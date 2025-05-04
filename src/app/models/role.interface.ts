export interface Role {
    id: number;
    name: string;
    description: string | null;
    created_at?: string;
  }
  
  export interface Permission {
    id: number;
    name: string;
    description: string | null;
    created_at?: string;
  }
  
  export interface RoleWithPermissions {
    role: Role;
    permissions: Permission[];
  }