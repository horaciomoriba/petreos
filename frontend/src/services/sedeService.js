import api from './authService';

export const sedeService = {
  // Obtener todas las sedes
  getAll: async () => {
    const response = await api.get('/admin/sedes');
    return response.data;
  },

  // Obtener sede por ID
  getById: async (id) => {
    const response = await api.get(`/admin/sedes/${id}`);
    return response.data;
  },

  // Crear nueva sede
  create: async (sedeData) => {
    const response = await api.post('/admin/sedes', sedeData);
    return response.data;
  },

  // Actualizar sede
  update: async (id, sedeData) => {
    const response = await api.put(`/admin/sedes/${id}`, sedeData);
    return response.data;
  },

  // Eliminar sede (soft delete)
  delete: async (id) => {
    const response = await api.delete(`/admin/sedes/${id}`);
    return response.data;
  },

  // Eliminar sede permanentemente
  permanentDelete: async (id) => {
    const response = await api.delete(`/admin/sedes/${id}/permanent`);
    return response.data;
  },
};

export default sedeService;