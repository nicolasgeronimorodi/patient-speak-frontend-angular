import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { PermissionName } from '../models/permission.model';
import { ObservationActionKey } from '../enums/action-key';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { catchError, from, map, Observable, throwError } from 'rxjs';


type ActionKey = ObservationActionKey;

@Injectable({ providedIn: 'root' })
export class PermissionContextService {
  private supabase: SupabaseClient;
  private userPermissions: Set<PermissionName> = new Set();
  private isInitialized = false;

  //  Mapa de reglas por acción
  private permissionMap: Record<ActionKey, PermissionName[] | ((args: any) => boolean)> = {
    [ObservationActionKey.AddObservationToOwn]: ['observation:create:own'],
    [ObservationActionKey.AddObservationToAny]: ['observation:create:all'],
    [ObservationActionKey.DeleteOwnObservation]: ['observation:delete:own'],
    [ObservationActionKey.DeleteAnyObservation]: ['observation:delete:all'],
    [ObservationActionKey.ManageUsers]: ['user:manage'],

    [ObservationActionKey.AddObservation]: ({ ownerId, currentUserId }) =>
      this.has('observation:create:all') ||
      (this.has('observation:create:own') && ownerId === currentUserId),

    [ObservationActionKey.DeleteObservation]: ({ createdBy, currentUserId }) =>
      this.has('observation:delete:all') ||
      (this.has('observation:delete:own') && createdBy === currentUserId)
  };

  constructor(private supabaseBase: SupabaseClientBaseService) {
    this.supabase = this.supabaseBase.getClient();
  }

    getCurrentUserPermissions(): Observable<PermissionName[]> {
    return from(this.supabase.rpc('get_current_user_permissions')).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return (response.data ?? []).map(
          (p: { name: string }) => p.name as PermissionName
        );
      }),
      catchError((error) => {
        console.error('Error obteniendo permisos del usuario:', error);
        return throwError(
          () => new Error('Error obteniendo permisos del usuario')
        );
      })
    );
  }

  /**
   * Inicializa los permisos una sola vez (post-login).
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const perms = await this.getCurrentUserPermissions().toPromise();
    this.userPermissions = new Set(perms);
    this.isInitialized = true;
  }

  /**
   * Recarga los permisos del usuario (si por ejemplo cambió el rol).
   */
  async refresh(): Promise<void> {
    const perms = await this.getCurrentUserPermissions().toPromise();
    this.userPermissions = new Set(perms);
  }

  has(permission: PermissionName): boolean {
    return this.userPermissions.has(permission);
  }

  can(actionKey: ActionKey, context?: any): boolean {
    //debugger;
    const rule = this.permissionMap[actionKey];
    if (!rule) return false;

    if (Array.isArray(rule)) {
      return rule.some(perm => this.has(perm));
    }

    if (typeof rule === 'function') {
      return rule(context);
    }

    return false;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}
