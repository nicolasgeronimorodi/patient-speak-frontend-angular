import { UserRolesEnum } from "../../../enums/user-roles.enum";
import { ProfileEntity } from "../../database-models/auth/profile.interface";
import { OperatorUserSimpleViewModel } from "../../view-models/user/operator-user-simple-view.model";
import { UserDetailViewModel } from "../../view-models/user/user-detail.view.model";
import { UserInfoDetailViewModel } from "../../view-models/user/user-info-detail.view.model";
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

 static toUserInfo(user: any, profile: ProfileEntity): UserInfoDetailViewModel {
    const roleId = profile.role_id;

    let roleName = 'Sin rol';
    switch (roleId) {
      case UserRolesEnum.Admin:
        roleName = 'Administrador de sistema';
        break;
      case UserRolesEnum.Operator:
        roleName = 'Usuario operador';
        break;
    }

    return {
      id: user.id,
      email: user.email || '',
      fullName: profile.full_name || '',
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      roleName,
      createdAt: new Date(profile.created_at || user.created_at || ''),
      updatedAt: profile.updated_at ? new Date(profile.updated_at) : undefined
    };
  }

  static toSimpleOperator(user: any, profile: ProfileEntity): OperatorUserSimpleViewModel {
  // Fallbacks en orden de prioridad
  const fullName =
    profile.full_name?.trim() ||
    [profile.first_name?.trim(), profile.last_name?.trim()]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    '-';

  return {
    id: user.id,
    fullName,
  };
}


}
