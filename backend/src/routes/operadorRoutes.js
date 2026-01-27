import express from 'express';
import {
  getMiVehiculo,
  getRevisionesPendientes,
  getMisRevisiones,
  crearRevision,
  actualizarDatosVehiculo ,
  getTipoRevision,
  getRevisionDetalle
} from '../controllers/operadorController.js';
import { protectOperador } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación de operador
router.use(protectOperador);

// Rutas del operador
router.get('/mi-vehiculo', getMiVehiculo);
router.put('/mi-vehiculo/actualizar-datos', actualizarDatosVehiculo);
router.get('/revisiones-pendientes', getRevisionesPendientes);
router.get('/mis-revisiones', getMisRevisiones);
router.get('/revisiones/:id', getRevisionDetalle);
router.get('/tipos-revision/:id', getTipoRevision);
router.post('/revisiones', crearRevision);

export default router;