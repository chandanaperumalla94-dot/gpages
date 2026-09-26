import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
const apiBaseUrl = configuredApiUrl
  ? configuredApiUrl.endsWith('/api')
    ? configuredApiUrl
    : `${configuredApiUrl}/api`
  : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // send the httpOnly auth cookie
});

// Attach the bearer token (kept as a fallback alongside the cookie) if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp_token');
  const safeToken = typeof token === 'string' ? token.trim() : '';

  if (safeToken && safeToken !== 'undefined' && safeToken !== 'null') {
    config.headers.Authorization = `Bearer ${safeToken}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

// Normalize error messages so components can just read err.message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
