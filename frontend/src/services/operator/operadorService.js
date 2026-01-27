import userApi from "../userAuthService";

export const operadorService = {

  // Obtener vehículo asignado
  getMiVehiculo: async () => {
    const response = await userApi.get('/operador/mi-vehiculo');
    return response.data;
  },

  // Actualizar datos operacionales del vehículo
  actualizarDatosVehiculo: async (data) => {
    const response = await userApi.put('/operador/mi-vehiculo/actualizar-datos', data);
    return response.data;
  },

  // Obtener revisiones pendientes
  getRevisionesPendientes: async () => {
    const response = await userApi.get('/operador/revisiones-pendientes');
    return response.data;
  },

  // Obtener mis revisiones con filtros
  getMisRevisiones: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await userApi.get(`/operador/mis-revisiones${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Obtener detalle de una revisión
  getRevisionDetalle: async (id) => {
    const response = await userApi.get(`/operador/revisiones/${id}`);
    return response.data;
  },
  
  // Obtener tipo de revisión por ID ← AGREGAR
  getTipoRevision: async (id) => {
    const response = await userApi.get(`/operador/tipos-revision/${id}`);
    return response.data;
  },


  // Crear nueva revisión
  crearRevision: async (data) => {
    const response = await userApi.post('/operador/revisiones', data);
    return response.data;
  }
};

export default operadorService;