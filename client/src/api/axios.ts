import axios from "axios";
import type {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import type { AuthResponse } from "./auth.types";

import {
  getAccessToken,
  getRefreshPromise,
  setAccessToken,
  setRefreshPromise,
} from "./token-store";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "");

if (!BACKEND_URL) {
  console.error(
    "VITE_BACKEND_URL is missing. Set it in client/.env.",
  );
}

const REFRESH_PATH = "/auth/refresh";

type RetryableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  timeout: 30_000,
  headers: {
    Accept: "application/json",
  },
});

const isAuthEndpoint = (url = "") =>
  url.includes("/auth/login") ||
  url.includes("/auth/register") ||
  url.includes("/auth/refresh") ||
  url.includes("/auth/logout") ||
  url.includes("/auth/exchange");

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const refreshAuth = (): Promise<AuthResponse> => {
  const existing = getRefreshPromise();

  if (existing) {
    return existing;
  }

  const promise = (async () => {
    try {
      // The refresh route uses the HTTP-only refresh cookie.
      const { data } = await api.post<AuthResponse>(REFRESH_PATH);

      setAccessToken(data.accessToken);

      return data;
    } catch (error) {
      setAccessToken(null);
      throw error;
    } finally {
      setRefreshPromise(null);
    }
  })();

  setRefreshPromise(promise);

  return promise;
};

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;

    const shouldSkip =
      !config ||
      error.response?.status !== 401 ||
      config._retry ||
      isAuthEndpoint(config.url);

    if (shouldSkip) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      const { accessToken } = await refreshAuth();

      config.headers.Authorization = `Bearer ${accessToken}`;

      return api(config);
    } catch {
      setAccessToken(null);

      return Promise.reject(error);
    }
  },
);