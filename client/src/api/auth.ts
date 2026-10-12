import { api, refreshAuth } from "./axios";
import type { AuthResponse } from "./auth.types";

export interface RegisterPayload {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export const loginUser = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });

  return data;
};

export const registerUser = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  const normalizedPayload: RegisterPayload = {
    ...payload,
    firstName: payload.firstName.trim(),
    email: payload.email.trim().toLowerCase(),
  };

  if (normalizedPayload.lastName?.trim()) {
    normalizedPayload.lastName = normalizedPayload.lastName.trim();
  } else {
    delete normalizedPayload.lastName;
  }

  const { data } = await api.post<AuthResponse>(
    "/auth/register",
    normalizedPayload,
  );

  return data;
};

export const refreshUser = (): Promise<AuthResponse> =>
  refreshAuth();

export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};