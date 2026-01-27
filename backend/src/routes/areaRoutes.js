import express from 'express';
import {
  getAreas,
  getAreaById,
  createArea,
  updateArea,
  deleteArea,
  permanentDeleteArea
} from '../controllers/areaController.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación de admin
router.use(protectAdmin);

// CRUD Áreas
router.route('/')
  .get(getAreas)
  .post(createArea);

router.route('/:id')
  .get(getAreaById)
  .put(updateArea)
  .delete(deleteArea);

router.delete('/:id/permanent', permanentDeleteArea);

export default router;