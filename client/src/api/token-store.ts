// This holds the current access token
let accessToken: string | null = null;

// This holds a promise if a refresh is already in-flight
// Used to deduplicate: if multiple requests fail with 401 simultaneously,
// they all await the SAME refresh call instead of making multiple refresh requests
let refreshPromise: Promise<string> | null = null;

// Getter for access token
export const getAccessToken = () => accessToken;

// Setter for access token
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// Getter for in-flight refresh promise
export const getRefreshPromise = () => refreshPromise;

// Setter for in-flight refresh promise
export const setRefreshPromise = (promise: Promise<string> | null) => {
  refreshPromise = promise;
};

// let promise = getRefreshPromise();

// if (!promise) {
//     promise = refreshAccessToken();

//     setRefreshPromise(promise);
// }

// const newToken = await promise;