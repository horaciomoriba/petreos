// petrosfrontend/src/services/operator/operadorCombustibleService.js

import userApi from '../userAuthService';

const operadorCombustibleService = {
  // Obtener información del vehículo para pre-llenar formulario
  getInfoVehiculo: async () => {
    try {
      const response = await userApi.get('/operador/combustible/info-vehiculo');
      return response.data;
    } catch (error) {
      console.error('Error al obtener info del vehículo:', error);
      throw error;
    }
  },

  // Registrar nueva carga de combustible
  registrarCarga: async (datos) => {
    try {
      const response = await userApi.post('/operador/combustible', datos);
      return response.data;
    } catch (error) {
      console.error('Error al registrar carga:', error);
      throw error;
    }
  },

  // Obtener mis últimas cargas
  getMisCargas: async (limit = 10) => {
    try {
      const response = await userApi.get(`/operador/combustible/mis-cargas?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener mis cargas:', error);
      throw error;
    }
  }
};

export default operadorCombustibleService;