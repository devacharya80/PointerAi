import type { AuthResponse } from "./auth.types";

let accessToken: string | null = null;
let refreshPromise: Promise<AuthResponse> | null = null;

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getRefreshPromise = (): Promise<AuthResponse> | null =>
  refreshPromise;

export const setRefreshPromise = (
  promise: Promise<AuthResponse> | null,
): void => {
  refreshPromise = promise;
};