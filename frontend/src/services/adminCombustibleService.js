import api from './authService';

const adminCombustibleService = {
  // Registrar nueva carga (admin puede elegir vehículo)
  registrarCarga: async (datos) => {
    try {
      const response = await api.post('/admin/combustible', datos);
      return response.data;
    } catch (error) {
      console.error('Error al registrar carga:', error);
      throw error;
    }
  },

  // Obtener todas las cargas con filtros y paginación
  getTodasLasCargas: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);
      if (filtros.vehiculo) params.append('vehiculo', filtros.vehiculo);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.registrado_por) params.append('registrado_por', filtros.registrado_por);
      if (filtros.sort) params.append('sort', filtros.sort);

      const response = await api.get(`/admin/combustible?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cargas:', error);
      throw error;
    }
  },

  // Obtener carga por ID
  getCargaById: async (id) => {
    try {
      const response = await api.get(`/admin/combustible/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener carga:', error);
      throw error;
    }
  },

  // Actualizar carga
  actualizarCarga: async (id, datos) => {
    try {
      const response = await api.put(`/admin/combustible/${id}`, datos);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar carga:', error);
      throw error;
    }
  },

  // Eliminar carga
  eliminarCarga: async (id) => {
    try {
      const response = await api.delete(`/admin/combustible/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar carga:', error);
      throw error;
    }
  },

  // Obtener estadísticas generales
  getEstadisticas: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

      const response = await api.get(`/admin/combustible/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  // Obtener cargas de un vehículo específico (para tab en detalle)
  getCargasVehiculo: async (vehiculoId, page = 1, limit = 20) => {
    try {
      const response = await api.get(
        `/admin/combustible/vehiculo/${vehiculoId}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener cargas del vehículo:', error);
      throw error;
    }
  }
};

export default adminCombustibleService;