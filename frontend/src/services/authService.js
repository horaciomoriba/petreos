import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Login para ADMIN
  login: async (username, password) => {
    const response = await api.post('/admin/auth/login', { username, password });
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      localStorage.removeItem('adminToken');
    } catch (error) {
      console.error('Error en logout:', error);
    } 
  },

  // Obtener perfil del admin actual
  getCurrentUser: async () => {
    const response = await api.get('/admin/auth/me');
    return response.data;
  },

  // Cambiar contraseña
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/admin/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },
};

export default api;