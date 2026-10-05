import axios from "axios";
import {
  getAccessToken,
  getRefreshPromise,
  setAccessToken,
  setRefreshPromise,
} from "./token-store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Attach access token to requests
api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Handle expired access tokens
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    /*
     * IMPORTANT:
     *
     * Never try to refresh the refresh request itself.
     *
     * Otherwise:
     *
     * /auth/refresh -> 401
     *       ↓
     * interceptor
     *       ↓
     * /auth/refresh
     *       ↓
     * 401
     *       ↓
     * infinite loop
     */
    if (originalRequest?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    /*
     * Only handle 401 responses.
     */
    if (
      error.response?.status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    let refreshPromise = getRefreshPromise();

    /*
     * If another request is already refreshing,
     * wait for that same refresh request.
     */
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const response = await api.post("/auth/refresh");

          const newAccessToken = response.data.accessToken;

          setAccessToken(newAccessToken);

          return newAccessToken;
        } catch (refreshError) {
          setAccessToken(null);

          throw refreshError;
        } finally {
          setRefreshPromise(null);
        }
      })();

      setRefreshPromise(refreshPromise);
    }

    try {
      const newAccessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers ?? {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);