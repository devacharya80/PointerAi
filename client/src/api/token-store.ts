let accessToken: string | null = null;

let refreshPromise: Promise<string> | null = null;

export const getAccessToken = () => {
  return accessToken;
};

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getRefreshPromise = () => {
  return refreshPromise;
};

export const setRefreshPromise = (
  promise: Promise<string> | null,
) => {
  refreshPromise = promise;
};