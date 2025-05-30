import { PermissionEntity } from "./permission.interface";
import { RoleEntity } from "./role.interface";

  export interface RoleWithPermissionsEntity {
    role: RoleEntity;
    permissions: PermissionEntity[];
  }