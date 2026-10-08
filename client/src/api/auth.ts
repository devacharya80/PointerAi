import { api, refreshAuth } from "./axios";
import type { AuthResponse } from "./auth.types";

export interface RegisterPayload {
  firstName: string;
  lastName: string | null;
  email: string;
  password: string;
}

export const loginUser = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return data;
};

export const registerUser = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
};

export const refreshUser = (): Promise<AuthResponse> => refreshAuth();

export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};