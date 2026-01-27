import api from './authService';

export const areaService = {
  // Obtener todas las áreas
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.sedeId) params.append('sedeId', filtros.sedeId);
    if (filtros.activo !== undefined) params.append('activo', filtros.activo);
    
    const query = params.toString();
    const url = query ? `/admin/areas?${query}` : '/admin/areas';
    
    const response = await api.get(url);
    return response.data;
  },

  // Obtener área por ID
  getById: async (id) => {
    const response = await api.get(`/admin/areas/${id}`);
    return response.data;
  },

  // Crear nueva área
  create: async (areaData) => {
    const response = await api.post('/admin/areas', areaData);
    return response.data;
  },

  // Actualizar área
  update: async (id, areaData) => {
    const response = await api.put(`/admin/areas/${id}`, areaData);
    return response.data;
  },

  // Eliminar área (soft delete)
  delete: async (id) => {
    const response = await api.delete(`/admin/areas/${id}`);
    return response.data;
  },

  // Eliminar área permanentemente
  permanentDelete: async (id) => {
    const response = await api.delete(`/admin/areas/${id}/permanent`);
    return response.data;
  }
};

export default areaService;