import express from 'express';
import { 
  operadorLogin, 
  getProfile, 
  changePassword
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta pública - Login operador
router.post('/login', operadorLogin);

// Rutas protegidas
router.get('/me', protect, getProfile);
router.put('/change-password', protect, changePassword);

export default router;