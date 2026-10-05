import { api } from "./axios";

export interface AuthResponse {
  accessToken: string;

  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Email + password login
export const loginUser = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

// Register
export const registerUser = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  const response = await api.post(
    "/auth/register",
    payload,
  );

  return response.data;
};

// Refresh access token using httpOnly refresh cookie
export const refreshUser = async (): Promise<AuthResponse> => {
  const response = await api.post("/auth/refresh");

  return response.data;
};

// Logout
export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};