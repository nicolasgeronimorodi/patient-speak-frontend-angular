/**
 * Database role keys from Supabase roles table
 */
export enum RoleKey {
  Admin = 'admin',
  Operator = 'transcription_basic_operator'
}

/**
 * Human-readable role display names for UI
 */
export enum RoleDisplayName {
  Admin = 'Administrador',
  Operator = 'Operador',
  Unknown = 'Sin rol'
}

/**
 * Maps database role name to display name.
 * Returns RoleDisplayName.Unknown for unrecognized roles.
 */
export function getRoleDisplayName(dbRoleName: string | undefined): RoleDisplayName {
  switch (dbRoleName) {
    case RoleKey.Admin:
      return RoleDisplayName.Admin;
    case RoleKey.Operator:
      return RoleDisplayName.Operator;
    default:
      return RoleDisplayName.Unknown;
  }
}
