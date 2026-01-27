// models/reparacion.js

import mongoose from 'mongoose';

const piezaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  costo_unitario: {
    type: Number,
    required: true,
    min: 0
  },
  costo_total: {
    type: Number,
    required: true
  }
});

const modificacionSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    default: Date.now
  },
  modificado_por: {
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    nombre: String
  },
  descripcion: String // Opcional: qué se modificó
});

const reparacionSchema = new mongoose.Schema({
  // VÍNCULO CON VEHÍCULO
  vehiculo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehiculo',
    required: true
  },
  
  // SNAPSHOT DEL VEHÍCULO (desnormalizado)
  placa: String,
  numero_economico: String,
  tipo_vehiculo: String,
  
  // CATEGORÍA
  categoria: {
    type: String,
    required: true,
    enum: [
      'Motor',
      'Transmisión',
      'Frenos',
      'Suspensión',
      'Sistema Eléctrico',
      'Llantas',
      'Carrocería',
      'Sistema de Enfriamiento',
      'Mantenimiento Preventivo',
      'Mantenimiento Correctivo',
      'Otro'
    ]
  },
  
  // FECHAS
  fecha_registro: {
    type: Date,
    default: Date.now
  },
  fecha_realizacion: {
    type: Date,
    required: true
  },
  
  // DESCRIPCIÓN
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  notas_adicionales: {
    type: String,
    trim: true
  },
  
  // PIEZAS UTILIZADAS
  piezas: [piezaSchema],
  
  // COSTOS
  costo_mano_obra: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  costo_total: {
    type: Number,
    required: true,
    min: 0
  },
  
  // QUIEN REGISTRÓ
  registrado_por: {
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    nombre: String
  },
  
  // TRACKING DE MODIFICACIONES ⭐ NUEVO
  modificaciones: [modificacionSchema],
  
  // ESTADO
  estado: {
    type: String,
    enum: ['completada', 'en_progreso', 'cancelada'],
    default: 'completada'
  },
  
  // METADATA
  kilometraje_al_momento: Number,
  horas_motor_al_momento: Number
  
}, {
  timestamps: true // Mantiene createdAt y updatedAt automático
});

// ÍNDICES
reparacionSchema.index({ vehiculo: 1, fecha_realizacion: -1 });
reparacionSchema.index({ categoria: 1 });
reparacionSchema.index({ estado: 1 });

// MÉTODO PARA CALCULAR COSTO TOTAL DE PIEZAS
reparacionSchema.methods.calcularCostoTotalPiezas = function() {
  return this.piezas.reduce((total, pieza) => total + pieza.costo_total, 0);
};

// MÉTODO PARA CALCULAR COSTO TOTAL
reparacionSchema.methods.calcularCostoTotal = function() {
  const costoPiezas = this.calcularCostoTotalPiezas();
  return costoPiezas + (this.costo_mano_obra || 0);
};

const Reparacion = mongoose.model('Reparacion', reparacionSchema);

export default Reparacion;