import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { from, of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Enums
export enum ActionTypeEnum {
  Read = 1,
  Write = 2,
  Delete = 3,
  Create = 4,
  Manage = 5,
  ReadObservations = 6
}

export enum EntityTypeEnum {
  Transcription = 1,
  Tag = 2,
  Observation = 3,
  Profile = 4
}

// Estructura del resultado
export interface AuthorizationResult {
  actionId: number;
  entityId: number;
  resourceId: string | null;
  has_permission: boolean;
}

@Injectable({ providedIn: 'root' })
export class PermissionContextService {
  private supabase: SupabaseClient;

  // Memo para resultados previos
  private memoizedAuthResults: AuthorizationResult[] = [];

  constructor(private supabaseBase: SupabaseClientBaseService) {
    this.supabase = this.supabaseBase.getClient();
  }

  /**
   * Verifica si el usuario tiene permiso para una acción sobre una entidad (y recurso específico, si aplica),
   * usando Supabase RPC. El resultado se memoiza para evitar llamados repetidos.
   */
  validateAuthorizationForAction(
    actionId: number,
    entityId: number,
    resourceId: string | null
  ): Observable<boolean> {
    const existing = this.memoizedAuthResults.find(
      (entry) =>
        entry.actionId === actionId &&
        entry.entityId === entityId &&
        entry.resourceId === resourceId
    );

    if (existing) {
      return of(existing.has_permission);
    }

    return from(
      this.supabase.rpc('validate_user_authorization_for_action', {
        p_action_id: actionId,
        p_entity_id: entityId,
        p_resource_id: resourceId
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;

        const result: AuthorizationResult = {
          actionId,
          entityId,
          resourceId,
          has_permission: data
        };

        this.memoizedAuthResults.push(result);

        return data === true;
      }),
      catchError((err) => {
        console.error('Error calling validate_authorization_for_action:', err);
        return of(false);
      })
    );
  }

  /**
   * Limpia el memo de autorizaciones (ej: al cerrar sesión o cambiar de usuario)
   */
  clearMemo(): void {
    this.memoizedAuthResults = [];
  }
}
