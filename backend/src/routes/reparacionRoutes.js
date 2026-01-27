// routes/reparacionRoutes.js

import express from 'express';
import { protectAdmin } from '../middlewares/authMiddleware.js';
import {
  crearReparacion,
  obtenerReparaciones,
  obtenerReparacion,
  actualizarReparacion,
  eliminarReparacion,
  obtenerReparacionesPorVehiculo
} from '../controllers/reparacionController.js';

const router = express.Router();

// Todas las rutas requieren ser admin (protectAdmin ya valida todo)
router.use(protectAdmin);

// CRUD básico
router.post('/', crearReparacion);
router.get('/', obtenerReparaciones);
router.get('/:id', obtenerReparacion);
router.put('/:id', actualizarReparacion);
router.delete('/:id', eliminarReparacion);

// Historial por vehículo
router.get('/vehiculo/:vehiculo_id', obtenerReparacionesPorVehiculo);

export default router;