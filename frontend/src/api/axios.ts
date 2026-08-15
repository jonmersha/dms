import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `JWT ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh');
      if (!refreshToken) {
        return Promise.reject(error);
      }
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/jwt/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem('access', res.data.access);
        api.defaults.headers.common['Authorization'] = `JWT ${res.data.access}`;
        originalRequest.headers.Authorization = `JWT ${res.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        
        // Prevent infinite reload loop if we are already on the login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
