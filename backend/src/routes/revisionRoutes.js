// src/routes/revisionRoutes.js

import express from 'express';
import { 
  getRevisiones,
  getRevisionById,
  getRevisionesPorVehiculo,
  createRevision,
  updateRevision,
  firmarOperador,
  firmarMecanico,
  getEstadisticas,
  deleteRevision,
  aprobarRevision,
  descargarPDFRevision,      // ← AGREGAR
  regenerarPDFRevision        // ← AGREGAR
} from '../controllers/revisionController.js';
import { protectAdmin, protectUser, authorizeAdmin, authorizeUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ===== RUTAS ADMIN =====
const adminRoutes = express.Router();
adminRoutes.use(protectAdmin);

adminRoutes.get('/', getRevisiones);
adminRoutes.get('/estadisticas', getEstadisticas);
adminRoutes.get('/:id', getRevisionById);
adminRoutes.get('/vehiculo/:vehiculo_id', getRevisionesPorVehiculo);

// ✅ RUTAS PDF (antes de las rutas con :id para evitar conflictos)
adminRoutes.get('/:id/pdf', descargarPDFRevision);
adminRoutes.post('/:id/regenerar-pdf', 
  authorizeAdmin('super_admin', 'admin_flota', 'jefe_mantenimiento'), 
  regenerarPDFRevision
);

adminRoutes.post('/', 
  authorizeAdmin('super_admin', 'admin_flota', 'jefe_mantenimiento', 'jefe_taller'), 
  createRevision
);

adminRoutes.put('/:id', 
  authorizeAdmin('super_admin', 'admin_flota', 'jefe_mantenimiento', 'jefe_taller'), 
  updateRevision
);

adminRoutes.put('/:id/firmar-operador', 
  authorizeAdmin('super_admin', 'admin_flota'), 
  firmarOperador
);

adminRoutes.put('/:id/firmar-mecanico', 
  authorizeAdmin('super_admin', 'jefe_mantenimiento', 'jefe_taller'), 
  firmarMecanico
);

adminRoutes.put('/:id/aprobar', 
  authorizeAdmin('super_admin', 'admin_flota', 'jefe_mantenimiento'), 
  aprobarRevision
);

adminRoutes.delete('/:id', 
  authorizeAdmin('super_admin', 'admin_flota'), 
  deleteRevision
);

// ===== RUTAS USER (OPERADORES) =====
const userRoutes = express.Router();
userRoutes.use(protectUser);

userRoutes.post('/', 
  authorizeUser('operador'), 
  createRevision
);

userRoutes.put('/:id', 
  authorizeUser('operador'), 
  updateRevision
);

userRoutes.put('/:id/firmar-operador', 
  authorizeUser('operador'), 
  firmarOperador
);

userRoutes.get('/mis-revisiones', async (req, res, next) => {
  req.query.operador = req.user._id;
  next();
}, getRevisiones);

// Combinar rutas
router.use('/admin', adminRoutes);
router.use('/operador', userRoutes);

export default router;