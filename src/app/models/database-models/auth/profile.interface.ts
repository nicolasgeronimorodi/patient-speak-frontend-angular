export interface ProfileEntity {
  id: string;
  email: string;
  full_name?: string;
  role_id?: number;
  created_at?: string;
  updated_at?: string;
  role?: {
    id: number;
    name: string;
    description?: string;
  };
}