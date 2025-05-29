import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { from, map, Observable, throwError, catchError } from 'rxjs';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { ObservationActionKey } from '../enums/action-key';
import { PermissionName } from '../models/permission.model';

export type ActionKey = ObservationActionKey;

export type PermissionCheckMap = Record<PermissionName, boolean>;

@Injectable({ providedIn: 'root' })
export class PermissionContextService {
  private supabase: SupabaseClient;

  // Mapa base: ActionKey -> Permisos requeridos
  private readonly actionPermissionMap: Record<ActionKey, PermissionName[]> = {
    [ObservationActionKey.AddObservationToOwn]: ['observation:create:own'],
    [ObservationActionKey.AddObservationToAny]: ['observation:create:all'],
    [ObservationActionKey.DeleteOwnObservation]: ['observation:delete:own'],
    [ObservationActionKey.DeleteAnyObservation]: ['observation:delete:all'],
    [ObservationActionKey.ManageUsers]: ['user:manage'],
    [ObservationActionKey.AddObservation]: ['observation:create:own', 'observation:create:all'],
    [ObservationActionKey.DeleteObservation]: ['observation:delete:own', 'observation:delete:all']
  };

  constructor(private supabaseBase: SupabaseClientBaseService) {
    this.supabase = this.supabaseBase.getClient();
  }

  getCurrentUsersPermissionsForActions(
    actionKeys: ActionKey[]
  ): Observable<PermissionCheckMap> {
    const allPermissions = actionKeys.flatMap(
      (key) => this.actionPermissionMap[key] ?? []
    );
    const uniquePerms = [...new Set(allPermissions)];

    return from(this.supabase.rpc('get_current_user_permissions')).pipe(
      map((response) => {
        if (response.error) throw response.error;

        const granted = new Set((response.data ?? []).map((p: any) => p.name));
        const result = {} as PermissionCheckMap

        for (const perm of uniquePerms) {
          result[perm as PermissionName] = granted.has(perm);
        }

        return result;
      }),
      catchError((error) => {
        console.error('Error fetching user permissions:', error);
        return throwError(() => new Error('Unable to fetch user permissions'));
      })
    );
  }

  // Helper: true si alguna clave retorna permiso habilitado
  static evaluateNonRestrictivePermission(
    checkMap: PermissionCheckMap,
    permsToCheck: PermissionName[]
  ): boolean {
    return permsToCheck.some((perm) => checkMap[perm]);
  }

  static evaluateRestrictivePermission(
  map: PermissionCheckMap,
  ownPerm: PermissionName,
  allPerm: PermissionName,
  isOwner: boolean
): boolean {
  return map[allPerm] || (map[ownPerm] && isOwner);
}

  
}






/*
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

*/