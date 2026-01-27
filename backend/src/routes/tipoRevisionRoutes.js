// src/routes/tipoRevisionRoutes.js

import express from 'express';
import { 
  getTiposRevision,
  getTipoRevisionById,
  getTipoRevisionByCodigo,
  getTipoRevisionPorVehiculo,
  createTipoRevision,
  updateTipoRevision,
  agregarSeccion,
  agregarPregunta,
  deleteTipoRevision
} from '../controllers/tipoRevisionController.js';
import { protectAdmin, authorizeAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación de admin
router.use(protectAdmin);

// ===== RUTAS PÚBLICAS (lectura - todos los admins) =====
router.get('/', getTiposRevision);
router.get('/:id', getTipoRevisionById);
router.get('/codigo/:codigo', getTipoRevisionByCodigo);
router.get('/vehiculo/:tipo_vehiculo/:frecuencia', getTipoRevisionPorVehiculo);

// ===== RUTAS ADMIN (super_admin, admin_flota) =====
router.post('/', 
  authorizeAdmin('super_admin', 'admin_flota'), 
  createTipoRevision
);

router.put('/:id', 
  authorizeAdmin('super_admin', 'admin_flota'), 
  updateTipoRevision
);

router.post('/:id/seccion', 
  authorizeAdmin('super_admin', 'admin_flota'), 
  agregarSeccion
);

router.post('/:id/seccion/:seccionIndex/pregunta', 
  authorizeAdmin('super_admin', 'admin_flota'), 
  agregarPregunta
);

router.delete('/:id', 
  authorizeAdmin('super_admin'), 
  deleteTipoRevision
);

export default router;