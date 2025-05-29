import { Permission } from "./permission.interface";
import { Role } from "./role.interface";

  export interface RoleWithPermissions {
    role: Role;
    permissions: Permission[];
  }