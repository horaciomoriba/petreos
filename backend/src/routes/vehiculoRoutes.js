// src/routes/vehiculoRoutes.js

import express from 'express';
import { 
  getVehiculos,
  getVehiculoById,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo,
  configurarNeumaticos,
  actualizarKilometraje,
  actualizarHorasMotor,
  asignarOperador,
  cambiarDisponibilidad,
  getEstadisticas
} from '../controllers/vehiculoController.js';
import { protectAdmin, authorizeAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación de admin
router.use(protectAdmin);

// ===== RUTAS PÚBLICAS (todos los admins autenticados) =====
router.get('/', getVehiculos);
router.get('/estadisticas', getEstadisticas);
router.get('/:id', getVehiculoById);

// ===== RUTAS ADMIN (super_admin, admin_flota) =====
router.post('/', 
  authorizeAdmin('super_admin', 'admin_flota'), 
  createVehiculo
);

router.put('/:id', 
  authorizeAdmin('super_admin', 'admin_flota'), 
  updateVehiculo
);

router.delete('/:id', 
  authorizeAdmin('super_admin', 'admin_flota'), 
  deleteVehiculo
);

router.post('/:id/configurar-neumaticos', 
  authorizeAdmin('super_admin', 'admin_flota'), 
  configurarNeumaticos
);

// ===== RUTAS OPERACIÓN (super_admin, admin_flota, jefe_mantenimiento, jefe_taller) =====
router.put('/:id/kilometraje', 
  authorizeAdmin('super_admin', 'admin_flota', 'jefe_mantenimiento', 'jefe_taller'), 
  actualizarKilometraje
);

router.put('/:id/horas-motor', 
  authorizeAdmin('super_admin', 'admin_flota', 'jefe_mantenimiento', 'jefe_taller'), 
  actualizarHorasMotor
);

router.put('/:id/asignar-operador', 
  authorizeAdmin('super_admin', 'admin_flota', 'jefe_mantenimiento'), 
  asignarOperador
);

router.put('/:id/disponibilidad', 
  authorizeAdmin('super_admin', 'admin_flota', 'jefe_mantenimiento', 'jefe_taller'), 
  cambiarDisponibilidad
);

export default router;