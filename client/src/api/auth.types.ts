export interface User {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
}

export interface AuthResponse {
  message?: string;
  accessToken: string;
  user: User;
}