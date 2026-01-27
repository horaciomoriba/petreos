// utils/activityLogger.js
import Actividad from '../models/actividad.js';

/**
 * Registra una actividad en el sistema
 * @param {String} tipo - Tipo de actividad (create, update, delete)
 * @param {String} usuarioTipo - 'admin' o 'operador'
 * @param {String} usuarioNombre - Nombre del usuario
 * @param {String} descripcion - Descripción de lo que se hizo
 */
export const registrarActividad = async (tipo, usuarioTipo, usuarioNombre, descripcion) => {
  try {
    await Actividad.create({
      tipo,
      usuario_tipo: usuarioTipo,
      usuario_nombre: usuarioNombre,
      descripcion
    });
  } catch (error) {
    // No fallar la operación principal si falla el log
    console.error('Error registrando actividad:', error);
  }
};

export default registrarActividad;