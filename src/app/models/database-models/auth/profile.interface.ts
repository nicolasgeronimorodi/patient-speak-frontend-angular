export interface ProfileEntity {
    id: string;
    full_name?: string;
    first_name?: string; // ← nuevo
    last_name?: string;  // ← nuevo
    role_id?: number;
    created_at?: string;
    updated_at?: string;
    role?: {
      id: number;
      name: string;
      description?: string;
    };
  }