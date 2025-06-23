import { ProfileEntity } from "../../database-models/auth/profile.interface";
import { UserDetailViewModel } from "../../view-models/user/user-detail.view.model";
import { UserListItemViewModel } from "../../view-models/user/user-list-item-view.model";

// Mappers para convertir entre modelos
export class UserMappers {
  // Convierte usuario y perfil a modelo de lista
  static toListItem(user: any, profile: ProfileEntity): UserListItemViewModel {
    return {
      id: user.id,
      email: user.email || '',
      fullName: profile.full_name || '',
      roleName: profile.role?.name || 'Sin rol',
      createdAt: new Date(profile.created_at || user.created_at || '')
    };
  }
  
  // Convierte usuario y perfil a modelo de detalle
  static toDetail(user: any, profile: ProfileEntity): UserDetailViewModel {
  return {
    id: user.id,
    email: user.email || '',
    fullName: profile.full_name || '',
    firstName: profile.first_name || '', // <- agregado
    lastName: profile.last_name || '',   // <- agregado
    role: profile.role || { id: profile.role_id || 0, name: 'Sin rol' },
    createdAt: new Date(profile.created_at || user.created_at || ''),
    updatedAt: profile.updated_at ? new Date(profile.updated_at) : undefined
  };
}
}
