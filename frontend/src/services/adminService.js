import api from './authService';

export const adminService = {
  // Obtener todos los admins
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.rol) params.append('rol', filtros.rol);
    if (filtros.activo !== undefined) params.append('activo', filtros.activo);
    if (filtros.sedeId) params.append('sedeId', filtros.sedeId);
    
    const query = params.toString();
    const url = query ? `/admins?${query}` : '/admins';
    
    const response = await api.get(url);
    return response.data;
  },

  // Obtener admin por ID
  getById: async (id) => {
    const response = await api.get(`/admins/${id}`);
    return response.data;
  },

  // Crear admin
  create: async (adminData) => {
    const response = await api.post('/admins', adminData);
    return response.data;
  },

  // Actualizar admin
  update: async (id, adminData) => {
    const response = await api.put(`/admins/${id}`, adminData);
    return response.data;
  },

  // Desactivar admin
  delete: async (id) => {
    const response = await api.delete(`/admins/${id}`);
    return response.data;
  },

  // Reactivar admin
  reactivar: async (id) => {
    const response = await api.put(`/admins/${id}/reactivar`);
    return response.data;
  },

  // Actualizar permisos
  updatePermisos: async (id, permisos) => {
    const response = await api.put(`/admins/${id}/permisos`, { permisos });
    return response.data;
  },

  // Actualizar sedes
  updateSedes: async (id, sedes) => {
    const response = await api.put(`/admins/${id}/sedes`, { sedes });
    return response.data;
  },

  // Cambiar contraseña
  cambiarPassword: async (id, nuevaPassword) => {
    const response = await api.put(`/admins/${id}/cambiar-password`, { nuevaPassword });
    return response.data;
  },

  // ⭐ NUEVO: Obtener estadísticas del dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admins/dashboard/stats');
    return response.data;
  }
};

export default adminService;