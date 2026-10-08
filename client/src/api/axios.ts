import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import type { AuthResponse } from "./auth.types";
import {
  getAccessToken,
  getRefreshPromise,
  setAccessToken,
  setRefreshPromise,
} from "./token-store";

const REFRESH_PATH = "/auth/refresh";

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Attach the access token to every request except the refresh call
api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token && !config.url?.includes(REFRESH_PATH)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// The actual refresh work. Runs once per refresh cycle.
const doRefresh = async (): Promise<AuthResponse> => {
  try {
    const { data } = await api.post<AuthResponse>(REFRESH_PATH);
    setAccessToken(data.accessToken);
    return data;
  } catch (error) {
    setAccessToken(null);
    throw error;
  } finally {
    setRefreshPromise(null);
  }
};

/*
 * Shared refresh entry point.
 * If a refresh is already running, every caller gets the same promise.
 * The promise is stored before doRefresh's finally can run,
 * because the finally only runs after the awaited request settles.
 */
export const refreshAuth = (): Promise<AuthResponse> => {
  const existing = getRefreshPromise();
  if (existing) return existing;

  const promise = doRefresh();
  setRefreshPromise(promise);
  return promise;
};

// Retry a 401 once after refreshing
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;

    const shouldSkip =
      !config ||
      error.response?.status !== 401 ||
      config._retry ||
      config.url?.includes(REFRESH_PATH);

    if (shouldSkip) {
      return Promise.reject(error);
    }

    config._retry = true;

    const { accessToken } = await refreshAuth();
    config.headers.Authorization = `Bearer ${accessToken}`;

    return api(config);
  },
);