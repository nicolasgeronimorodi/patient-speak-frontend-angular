// Para detalles de usuario
export interface UserDetailViewModel {
  id: string;
  email: string;
  fullName: string;
  firstName?: string; // <- agregado
  lastName?: string;  // <- agregado
  role: {
    id: number;
    name: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt?: Date;
}
