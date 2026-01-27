// petreosbackend/src/routes/adminCombustibleRoutes.js

import express from 'express';
import {
  registrarCarga,
  getTodasLasCargas,
  getCargaById,
  actualizarCarga,
  eliminarCarga,
  getEstadisticasGenerales,
  getCargasVehiculo
} from '../controllers/adminCombustibleController.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación de admin
router.use(protectAdmin);

// @route   GET /api/admin/combustible/stats
// @desc    Obtener estadísticas generales
// @access  Private (Admin)
router.get('/stats', getEstadisticasGenerales);

// @route   GET /api/admin/combustible/vehiculo/:vehiculoId
// @desc    Obtener cargas y estadísticas de un vehículo específico
// @access  Private (Admin)
router.get('/vehiculo/:vehiculoId', getCargasVehiculo);

// @route   POST /api/admin/combustible
// @desc    Registrar nueva carga de combustible
// @access  Private (Admin)
router.post('/', registrarCarga);

// @route   GET /api/admin/combustible
// @desc    Obtener todas las cargas con filtros
// @access  Private (Admin)
router.get('/', getTodasLasCargas);

// @route   GET /api/admin/combustible/:id
// @desc    Obtener carga por ID
// @access  Private (Admin)
router.get('/:id', getCargaById);

// @route   PUT /api/admin/combustible/:id
// @desc    Actualizar carga
// @access  Private (Admin)
router.put('/:id', actualizarCarga);

// @route   DELETE /api/admin/combustible/:id
// @desc    Eliminar carga
// @access  Private (Admin)
router.delete('/:id', eliminarCarga);

export default router;