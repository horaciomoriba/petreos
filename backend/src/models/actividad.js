// models/actividad.js
import mongoose from 'mongoose';

const actividadSchema = new mongoose.Schema({
  // Tipo de actividad
  tipo: {
    type: String,
    required: true,
    enum: [
      // Revisiones
      'crear_revision',
      'aprobar_revision',
      'rechazar_revision',
      
      // Vehículos
      'crear_vehiculo',
      'actualizar_vehiculo',
      'eliminar_vehiculo',
      
      // Sedes
      'crear_sede',
      'actualizar_sede',
      'eliminar_sede',
      
      // Admins
      'crear_admin',
      'actualizar_admin',
      'eliminar_admin',
      
      // Operadores
      'crear_operador',
      'actualizar_operador',
      'eliminar_operador',
      
      // Combustible
      'crear_carga_combustible',
      'actualizar_carga_combustible',
      'eliminar_carga_combustible',
      
      // Reparaciones
      'crear_reparacion',
      'actualizar_reparacion',
      'eliminar_reparacion'
    ]
  },
  
  // Quién lo hizo (admin u operador)
  usuario_tipo: {
    type: String,
    enum: ['admin', 'operador'],
    required: true
  },
  
  usuario_nombre: {
    type: String,
    required: true
  },
  
  // Qué se hizo (descripción simple)
  descripcion: {
    type: String,
    required: true
  },
  
  // Fecha
  fecha: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Índices para búsquedas rápidas
actividadSchema.index({ tipo: 1, fecha: -1 });
actividadSchema.index({ usuario_tipo: 1, fecha: -1 });
actividadSchema.index({ fecha: -1 });

const Actividad = mongoose.model('Actividad', actividadSchema);

export default Actividad;