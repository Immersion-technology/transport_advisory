import axios from 'axios';

// In dev the Vite proxy rewrites `/api` → http://localhost:5000.
// In production we point straight at the backend URL via VITE_API_URL.
const API_BASE = import.meta.env.VITE_API_URL
  ? `${String(import.meta.env.VITE_API_URL).replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ta_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url || '';
      // A 401 from a public auth endpoint means "wrong credentials" or
      // "expired link" — let the page handle it with a toast. Only force a
      // redirect when an authenticated request (has a token) gets rejected.
      const isAuthEndpoint = /\/auth\/(login|register|checkout|magic-link)/.test(url);
      const hasToken = !!localStorage.getItem('ta_token');

      if (!isAuthEndpoint && hasToken) {
        localStorage.removeItem('ta_token');
        localStorage.removeItem('ta_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
