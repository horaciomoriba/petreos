
import express from 'express';
import {
  registrarCarga,
  getMisCargas,
  getInfoVehiculoParaCarga
} from '../controllers/operadorCombustibleController.js';
import { protectUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación de operador
router.use(protectUser);

// @route   POST /api/operador/combustible
// @desc    Registrar nueva carga de combustible
// @access  Private (Operador)
router.post('/', registrarCarga);

// @route   GET /api/operador/combustible/mis-cargas
// @desc    Obtener mis últimas cargas
// @access  Private (Operador)
router.get('/mis-cargas', getMisCargas);

// @route   GET /api/operador/combustible/info-vehiculo
// @desc    Obtener información del vehículo para pre-llenar formulario
// @access  Private (Operador)
router.get('/info-vehiculo', getInfoVehiculoParaCarga);

export default router;




