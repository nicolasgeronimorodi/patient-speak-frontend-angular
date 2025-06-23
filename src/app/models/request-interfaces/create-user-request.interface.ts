// Para la creación de usuarios
export interface CreateUserRequest {
  email: string;
  password: string;
  full_name?: string; // seguirá existiendo por ahora
  first_name?: string;
  last_name?: string;
  role_id: number;
}