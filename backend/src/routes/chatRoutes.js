import express from 'express';
import { sendMessage } from '../controllers/chatController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Proteger todas las rutas - solo admins
router.use(protectAdmin);

// POST /api/chat/message
router.post('/message', sendMessage);

export default router;