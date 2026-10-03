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

// Attach access token to every request
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      let refreshPromise = getRefreshPromise();

      // No refresh currently happening
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const res = await api.post("/auth/refresh");

            const newToken = res.data.accessToken;

            setAccessToken(newToken);

            return newToken;
          } catch (err) {
            setAccessToken(null);
            throw err;
          } finally {
            setRefreshPromise(null);
          }
        })();

        setRefreshPromise(refreshPromise);
      }

      try {
        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Rename to be clear it's refresh failure
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
