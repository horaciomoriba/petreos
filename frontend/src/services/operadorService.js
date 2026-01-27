import api from './authService';

export const operadorService = {
  // Obtener todos los operadores
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.sedeId) params.append('sedeId', filtros.sedeId);
    if (filtros.activo !== undefined) params.append('activo', filtros.activo);
    if (filtros.vehiculoAsignado) params.append('vehiculoAsignado', filtros.vehiculoAsignado);
    
    const query = params.toString();
    const url = query ? `/users/operadores?${query}` : '/users/operadores';
    
    const response = await api.get(url);
    return response.data;
  },

  // Obtener operador por ID
  getById: async (id) => {
    const response = await api.get(`/users/operadores/${id}`);
    return response.data;
  },

  // Crear operador
  create: async (operadorData) => {
    const response = await api.post('/users/operadores', operadorData);
    return response.data;
  },

  // Actualizar operador
  update: async (id, operadorData) => {
    const response = await api.put(`/users/operadores/${id}`, operadorData);
    return response.data;
  },

  // Desactivar operador
  delete: async (id) => {
    const response = await api.delete(`/users/operadores/${id}`);
    return response.data;
  },

  // Asignar vehículo
  asignarVehiculo: async (id, vehiculoId) => {
    const response = await api.put(`/users/operadores/${id}/asignar-vehiculo`, { vehiculoId });
    return response.data;
  },

  // Cambiar contraseña
  cambiarPassword: async (id, nuevaPassword) => {
    const response = await api.put(`/users/operadores/${id}/cambiar-password`, { nuevaPassword });
    return response.data;
  }
};

export default operadorService;