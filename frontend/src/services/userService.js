import api from './authService';

export const userService = {
  // Obtener todos los usuarios (operadores)
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.role) params.append('role', filtros.role);
    if (filtros.sede) params.append('sede', filtros.sede);
    if (filtros.search) params.append('search', filtros.search);
    
    const queryString = params.toString();
    const url = `/admin/users${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Obtener usuario por ID
  getById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Crear nuevo usuario
  create: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  // Actualizar usuario
  update: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  // Eliminar usuario (soft delete)
  delete: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};

export default userService;