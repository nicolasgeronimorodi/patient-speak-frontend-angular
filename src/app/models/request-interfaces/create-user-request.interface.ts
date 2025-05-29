// Para la creación de usuarios
export interface CreateUserRequest {
  email: string;
  password: string;
  full_name?: string;
  role_id: number;
}
