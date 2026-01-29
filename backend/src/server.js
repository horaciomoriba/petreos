import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';

// Importar rutas
import adminAuthRoutes from './routes/authRoutes.js';
import operadorAuthRoutes from './routes/operadorAuthRoutes.js';

import adminRoutes from './routes/adminRoutes.js';

import operadorRoutes from './routes/operadorRoutes.js';

import sedeRoutes from './routes/sedeRoutes.js';
import vehiculoRoutes from './routes/vehiculoRoutes.js';
import tipoRevisionRoutes from './routes/tipoRevisionRoutes.js';
import revisionRoutes from './routes/revisionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import areaRoutes from './routes/areaRoutes.js';
import reparacionRoutes from './routes/reparacionRoutes.js';
import actividadRoutes from './routes/actividadRoutes.js';

import operadorCombustibleRoutes from './routes/operadorCombustibleRoutes.js';
import adminCombustibleRoutes from './routes/adminCombustibleRoutes.js';

import chatRoutes from './routes/chatRoutes.js';

import mongoose from 'mongoose';

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB
connectDB();

// Rutas base
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Sistema de Gestión Empresarial - Petreos',
    version: '1.0.0',
    status: 'active'
  });
});

// ===== RUTAS DE AUTENTICACIÓN =====
app.use('/api/admin/auth', adminAuthRoutes);      // Login admin
app.use('/api/auth/operador', operadorAuthRoutes); // Login operador

// ===== RUTAS DE ADMIN =====
app.use('/api/admin/sedes', sedeRoutes);
app.use('/api/admin/vehiculos', vehiculoRoutes);
app.use('/api/admin/tipos-revision', tipoRevisionRoutes);
app.use('/api/revisiones', revisionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/admin/areas', areaRoutes)
app.use('/api/admin/combustible', adminCombustibleRoutes);
app.use('/api/reparaciones', reparacionRoutes);
app.use('/api/actividades', actividadRoutes);

// ===== RUTAS DE OPERADOR =====
app.use('/api/operador', operadorRoutes);
app.use('/api/operador/combustible', operadorCombustibleRoutes);
app.use('/api/chat', chatRoutes);

app.use('/uploads', express.static('uploads'));


// Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Ruta no encontrada' 
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});