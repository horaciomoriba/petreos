// services/actividadService.js
import api from './authService';

export const actividadService = {
  // Obtener actividades recientes (para dashboard)
  getRecientes: async (limit = 10) => {
    const response = await api.get(`/actividades/recientes?limit=${limit}`);
    return response.data;
  },

  // Obtener todas las actividades con filtros y paginación
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.usuario_tipo) params.append('usuario_tipo', filtros.usuario_tipo);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);
    
    const query = params.toString();
    const url = query ? `/actividades?${query}` : '/actividades';
    
    const response = await api.get(url);
    return response.data;
  }
};

export default actividadService;