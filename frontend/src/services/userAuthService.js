import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crear instancia de axios con configuración base para USER
const userApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar userToken a las peticiones
userApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
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
userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // SOLO redirigir si NO es el endpoint de login
      const isLoginEndpoint = error.config?.url?.includes('/auth/') && error.config?.url?.includes('/login');
      
      if (!isLoginEndpoint) {
        localStorage.removeItem('userToken');
        window.location.href = '/user/login';
      }
    }
    return Promise.reject(error);
  }
);

export const userAuthService = {
  // Login para USER (Operador)
  login: async (username, password) => {
    const response = await userApi.post('/auth/operador/login', { username, password });
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('userToken');
  },

  // Obtener perfil del operador actual
  getCurrentUser: async () => {
    const response = await userApi.get('/auth/operador/me');
    return response.data;
  },

  // Cambiar contraseña
  changePassword: async (currentPassword, newPassword) => {
    const response = await userApi.put('/auth/operador/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },
};

export default userApi;