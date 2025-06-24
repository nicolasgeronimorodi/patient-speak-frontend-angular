export interface UserInfoDetailViewModel {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  roleName: string;
  createdAt: Date;
  updatedAt?: Date;
}