import express from 'express';
import {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  updatePermisos,
  updateSedes,
  cambiarPasswordAdmin,
  deleteAdmin,
  reactivarAdmin,
  getDashboardStats
} from '../controllers/adminController.js';
import { protectSuperAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación de super admin
router.use(protectSuperAdmin);

// CRUD Admins
router.route('/')
  .get(getAdmins)
  .post(createAdmin);

router.route('/:id')
  .get(getAdminById)
  .put(updateAdmin)
  .delete(deleteAdmin);

// Acciones especiales
router.put('/:id/permisos', updatePermisos);
router.put('/:id/sedes', updateSedes);
router.put('/:id/cambiar-password', cambiarPasswordAdmin);
router.put('/:id/reactivar', reactivarAdmin);
router.get('/dashboard/stats', getDashboardStats); 

export default router;