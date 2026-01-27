// src/services/tipoRevisionService.js

import api from './authService';

export const tipoRevisionService = {
  
  // ==========================================
  // CRUD BÁSICO
  // ==========================================
  
  // Obtener todos los tipos de revisión
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.tipo_vehiculo) params.append('tipo_vehiculo', filtros.tipo_vehiculo);
    if (filtros.frecuencia) params.append('frecuencia', filtros.frecuencia);
    if (filtros.activo !== undefined) params.append('activo', filtros.activo);
    
    const queryString = params.toString();
    const url = `/admin/tipos-revision${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data.tiposRevision || response.data;
  },

  // Obtener tipo de revisión por ID
  getById: async (id) => {
    const response = await api.get(`/admin/tipos-revision/${id}`);
    return response.data;
  },

  // Obtener tipo de revisión por código
  getByCodigo: async (codigo) => {
    const response = await api.get(`/admin/tipos-revision/codigo/${codigo}`);
    return response.data;
  },

  // Obtener tipo de revisión por vehículo y frecuencia
  getByVehiculoYFrecuencia: async (tipo_vehiculo, frecuencia) => {
    const response = await api.get(`/admin/tipos-revision/vehiculo/${tipo_vehiculo}/${frecuencia}`);
    return response.data;
  },

  // Crear nuevo tipo de revisión
  create: async (tipoRevisionData) => {
    const response = await api.post('/admin/tipos-revision', tipoRevisionData);
    return response.data;
  },

  // Actualizar tipo de revisión
  update: async (id, tipoRevisionData) => {
    const response = await api.put(`/admin/tipos-revision/${id}`, tipoRevisionData);
    return response.data;
  },

  // Eliminar tipo de revisión (desactivar)
  delete: async (id) => {
    const response = await api.delete(`/admin/tipos-revision/${id}`);
    return response.data;
  },

  // ==========================================
  // GESTIÓN DE SECCIONES Y PREGUNTAS
  // ==========================================

  // Agregar sección
  agregarSeccion: async (id, seccion) => {
    const response = await api.post(`/admin/tipos-revision/${id}/seccion`, { seccion });
    return response.data;
  },

  // Agregar pregunta a sección
  agregarPregunta: async (id, seccionIndex, pregunta) => {
    const response = await api.post(
      `/admin/tipos-revision/${id}/seccion/${seccionIndex}/pregunta`, 
      { pregunta }
    );
    return response.data;
  }
};

export default tipoRevisionService;