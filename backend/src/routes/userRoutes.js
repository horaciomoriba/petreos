import express from 'express';
import {
  getOperadores,
  getOperadorById,
  createOperador,
  updateOperador,
  asignarVehiculo,
  deleteOperador,
  cambiarPasswordOperador
} from '../controllers/userController.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación de admin
router.use(protectAdmin);

// CRUD Operadores
router.route('/operadores')
  .get(getOperadores)
  .post(createOperador);

router.route('/operadores/:id')
  .get(getOperadorById)
  .put(updateOperador)
  .delete(deleteOperador);

// Acciones especiales
router.put('/operadores/:id/asignar-vehiculo', asignarVehiculo);
router.put('/operadores/:id/cambiar-password', cambiarPasswordOperador);

export default router;