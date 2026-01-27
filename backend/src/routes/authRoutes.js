import express from 'express';
import { 
  adminLogin, 
  getProfile, 
  changePassword
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta pública - Login admin
router.post('/login', adminLogin);

// Rutas protegidas
router.get('/me', protect, getProfile);
router.put('/change-password', protect, changePassword);

export default router;