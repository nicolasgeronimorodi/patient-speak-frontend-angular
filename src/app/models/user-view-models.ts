import { Profile } from './profile.interface';
import { Role } from './role.interface';

// Para la creación de usuarios
export interface CreateUserRequest {
  email: string;
  password: string;
  full_name?: string;
  role_id: number;
}

// Para mostrar usuarios en una lista
export interface UserListItem {
  id: string;
  email: string;
  fullName: string;
  roleName: string;
  createdAt: Date;
}

// Para detalles de usuario
export interface UserDetail {
  id: string;
  email: string;
  fullName: string;
  role: {
    id: number;
    name: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt?: Date;
}

// Mappers para convertir entre modelos
export class UserMappers {
  // Convierte usuario y perfil a modelo de lista
  static toListItem(user: any, profile: Profile): UserListItem {
    return {
      id: user.id,
      email: user.email || '',
      fullName: profile.full_name || '',
      roleName: profile.role?.name || 'Sin rol',
      createdAt: new Date(profile.created_at || user.created_at || '')
    };
  }
  
  // Convierte usuario y perfil a modelo de detalle
  static toDetail(user: any, profile: Profile): UserDetail {
    return {
      id: user.id,
      email: user.email || '',
      fullName: profile.full_name || '',
      role: profile.role || { id: profile.role_id || 0, name: 'Sin rol' },
      createdAt: new Date(profile.created_at || user.created_at || ''),
      updatedAt: profile.updated_at ? new Date(profile.updated_at) : undefined
    };
  }
}
