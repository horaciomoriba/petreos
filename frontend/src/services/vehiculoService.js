// src/services/vehiculoService.js

import api from './authService';

export const vehiculoService = {
  
  // ==========================================
  // CRUD BÁSICO
  // ==========================================
  
  // Obtener todos los vehículos con filtros
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.sede) params.append('sede', filtros.sede);
    if (filtros.tipo_vehiculo) params.append('tipo_vehiculo', filtros.tipo_vehiculo);
    if (filtros.disponibilidad) params.append('disponibilidad', filtros.disponibilidad);
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);
    
    const queryString = params.toString();
    const url = `/admin/vehiculos${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Obtener estadísticas
  getEstadisticas: async () => {
    const response = await api.get('/admin/vehiculos/estadisticas');
    return response.data;
  },

  // Obtener vehículo por ID
  getById: async (id) => {
    const response = await api.get(`/admin/vehiculos/${id}`);
    return response.data;
  },

  // Crear nuevo vehículo
  create: async (vehiculoData) => {
    const response = await api.post('/admin/vehiculos', vehiculoData);
    return response.data;
  },

  // Actualizar vehículo
  update: async (id, vehiculoData) => {
    const response = await api.put(`/admin/vehiculos/${id}`, vehiculoData);
    return response.data;
  },

  // Eliminar vehículo (soft delete)
  delete: async (id) => {
    const response = await api.delete(`/admin/vehiculos/${id}`);
    return response.data;
  },

  // ==========================================
  // NEUMÁTICOS
  // ==========================================

  // Configurar neumáticos del vehículo
  configurarNeumaticos: async (id, data) => {
    const response = await api.post(`/admin/vehiculos/${id}/configurar-neumaticos`, data);
    return response.data;
  },

  // ==========================================
  // MEDIDORES
  // ==========================================

  // Actualizar kilometraje
  actualizarKilometraje: async (id, kilometraje) => {
    const response = await api.put(`/admin/vehiculos/${id}/kilometraje`, { kilometraje });
    return response.data;
  },

  // Actualizar horas de motor
  actualizarHorasMotor: async (id, horas) => {
    const response = await api.put(`/admin/vehiculos/${id}/horas-motor`, { horas });
    return response.data;
  },

  // ==========================================
  // ASIGNACIONES
  // ==========================================

  // Asignar/remover operador
  asignarOperador: async (id, operador_id) => {
    const response = await api.put(`/admin/vehiculos/${id}/asignar-operador`, { operador_id });
    return response.data;
  },

  // Cambiar disponibilidad
  cambiarDisponibilidad: async (id, disponibilidad) => {
    const response = await api.put(`/admin/vehiculos/${id}/disponibilidad`, { disponibilidad });
    return response.data;
  }
};

export default vehiculoService;