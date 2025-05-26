import { Injectable } from '@angular/core';
import { PermissionName } from '../models/permission.model';
import { ObservationActionKey } from '../enums/action-key';
import { UserService } from './user.service';


type ActionKey = ObservationActionKey; // Unión con más enums mas adelante


@Injectable({
  providedIn: 'root'
})
export class PermissionContextService {



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

  constructor(private userService: UserService) {}

    private userPermissions: Set<PermissionName> = new Set();

  async initialize(): Promise<void> {
    const perms = await this.userService.getCurrentUserPermissions().toPromise();
    this.userPermissions = new Set(perms);
  }

  has(permission: PermissionName): boolean {
    return this.userPermissions.has(permission);
  }

  can(actionKey: ActionKey, context?: any): boolean {
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
}
