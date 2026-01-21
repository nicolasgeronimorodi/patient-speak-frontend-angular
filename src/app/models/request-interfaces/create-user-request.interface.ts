// Para la creacion de usuarios (invitacion por email)
export interface CreateUserRequest {
  email: string;
  password?: string; // Opcional - solo para flujo legacy, el nuevo flujo usa invitacion
  full_name?: string;
  role_id: number;
}
