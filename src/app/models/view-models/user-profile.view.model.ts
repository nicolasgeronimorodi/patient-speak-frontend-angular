  export interface UserProfile {
    id: string;
    email?: string;
    app_metadata?: {
      provider?: string;
      [key: string]: any;
    };
    user_metadata?: {
      [key: string]: any;
    };
    aud?: string;
    created_at?: string;
  }