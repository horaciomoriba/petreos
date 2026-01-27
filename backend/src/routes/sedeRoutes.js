import express from 'express';
import {
  getSedes,
  getSedeById,
  createSede,
  updateSede,
  deleteSede,
  permanentDeleteSede
} from '../controllers/sedeController.js';
import { protectAdmin, authorizeAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas protegidas - todos los admins pueden ver
router.get('/', protectAdmin, getSedes);
router.get('/:id', protectAdmin, getSedeById);

// Solo super_admin y jefe_mantenimiento pueden crear y actualizar
router.post('/', protectAdmin, authorizeAdmin('super_admin', 'jefe_mantenimiento'), createSede);
router.put('/:id', protectAdmin, authorizeAdmin('super_admin', 'jefe_mantenimiento'), updateSede);

// Solo super_admin puede eliminar
router.delete('/:id', protectAdmin, authorizeAdmin('super_admin'), deleteSede);
router.delete('/:id/permanent', protectAdmin, authorizeAdmin('super_admin'), permanentDeleteSede);

export default router;