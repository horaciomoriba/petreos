// src/services/revisionService.js

import api from './authService';

export const revisionService = {
  
  // ==========================================
  // CRUD BÁSICO - ADMIN
  // ==========================================
  
  // Obtener todas las revisiones con filtros (ADMIN)
  getAllAdmin: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.vehiculo) params.append('vehiculo', filtros.vehiculo);
    if (filtros.tipo_vehiculo) params.append('tipo_vehiculo', filtros.tipo_vehiculo);
    if (filtros.frecuencia) params.append('frecuencia', filtros.frecuencia);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros.tiene_problemas !== undefined) params.append('tiene_problemas', filtros.tiene_problemas);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.operador) params.append('operador', filtros.operador);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);
    
    const queryString = params.toString();
    const url = `/revisiones/admin${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Obtener estadísticas (ADMIN)
  getEstadisticasAdmin: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.vehiculo_id) params.append('vehiculo_id', filtros.vehiculo_id);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    
    const queryString = params.toString();
    const url = `/revisiones/admin/estadisticas${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Obtener revisión por ID (ADMIN)
  getByIdAdmin: async (id) => {
    const response = await api.get(`/revisiones/admin/${id}`);
    return response.data;
  },

  // Obtener revisiones de un vehículo (ADMIN)
  getByVehiculoAdmin: async (vehiculo_id, filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.frecuencia) params.append('frecuencia', filtros.frecuencia);
    if (filtros.limit) params.append('limit', filtros.limit);
    
    const queryString = params.toString();
    const url = `/revisiones/admin/vehiculo/${vehiculo_id}${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Crear nueva revisión (ADMIN)
  createAdmin: async (revisionData) => {
    const response = await api.post('/revisiones/admin', revisionData);
    return response.data;
  },

  // Actualizar revisión (ADMIN)
  updateAdmin: async (id, revisionData) => {
    const response = await api.put(`/revisiones/admin/${id}`, revisionData);
    return response.data;
  },

  // Eliminar revisión (ADMIN)
  deleteAdmin: async (id) => {
    const response = await api.delete(`/revisiones/admin/${id}`);
    return response.data;
  },

  // Firmar como operador (ADMIN puede hacerlo)
  firmarOperadorAdmin: async (id) => {
    const response = await api.put(`/revisiones/admin/${id}/firmar-operador`);
    return response.data;
  },

  // Firmar como mecánico (ADMIN)
  firmarMecanicoAdmin: async (id, mecanico) => {
    const response = await api.put(`/revisiones/admin/${id}/firmar-mecanico`, { mecanico });
    return response.data;
  },

  aprobarRevision: async (id) => {
    const response = await api.put(`/revisiones/admin/${id}/aprobar`);
    return response.data;
  },

  // ==========================================
  // PDF - ADMIN
  // ==========================================

  // Descargar PDF de revisión (ADMIN)
  descargarPDF: async (id) => {
    const response = await api.get(`/revisiones/admin/${id}/pdf`, {
      responseType: 'blob' // Importante para archivos binarios
    });
    
    // Crear URL temporal para descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Revision_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  },

  // Regenerar PDF de revisión (ADMIN)
  regenerarPDF: async (id) => {
    const response = await api.post(`/revisiones/admin/${id}/regenerar-pdf`);
    return response.data;
  },


  // ==========================================
  // OPERADOR (USER)
  // ==========================================

  // Obtener mis revisiones (OPERADOR)
  getMisRevisiones: async () => {
    const response = await api.get('/revisiones/operador/mis-revisiones');
    return response.data;
  },

  // Crear nueva revisión (OPERADOR)
  createOperador: async (revisionData) => {
    const response = await api.post('/revisiones/operador', revisionData);
    return response.data;
  },

  // Actualizar revisión (OPERADOR)
  updateOperador: async (id, revisionData) => {
    const response = await api.put(`/revisiones/operador/${id}`, revisionData);
    return response.data;
  },

  // Firmar como operador (OPERADOR)
  firmarOperador: async (id) => {
    const response = await api.put(`/revisiones/operador/${id}/firmar-operador`);
    return response.data;
  }
};

export default revisionService;