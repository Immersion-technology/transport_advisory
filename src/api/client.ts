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
      localStorage.removeItem('ta_token');
      localStorage.removeItem('ta_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
