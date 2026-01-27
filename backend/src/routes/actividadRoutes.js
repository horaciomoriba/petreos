// routes/actividadRoutes.js
import express from 'express';
import {
  getActividades,
  getActividadesRecientes
} from '../controllers/actividadController.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protectAdmin); // Solo admins pueden ver actividades

router.get('/', getActividades);
router.get('/recientes', getActividadesRecientes);

export default router;