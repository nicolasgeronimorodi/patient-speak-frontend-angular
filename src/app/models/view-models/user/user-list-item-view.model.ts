import { RoleDisplayName } from '../../enums/role.enum';

// Para mostrar usuarios en una lista
export interface UserListItemViewModel {
  id: string;
  email: string;
  fullName: string;
  roleName: RoleDisplayName;
  createdAt: Date;
  isActive: boolean;
}
