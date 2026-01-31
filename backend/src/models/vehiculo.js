// src/models/vehiculo.js

import mongoose from 'mongoose';

const neumaticoSchema = new mongoose.Schema({
  posicion_global: {
    type: Number,
    required: true
  },
  eje_numero: {
    type: Number,
    required: true
  },
  lado: {
    type: String,
    enum: ['izquierdo', 'derecho'],
    required: true
  },
  numero_en_lado: {
    type: Number,
    required: true
  }
}, { _id: false });

const ejeSchema = new mongoose.Schema({
  numero: {
    type: Number,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  neumaticos_por_lado: {
    type: Number,
    enum: [1, 2, 3],
    required: true
  },
  neumaticos: [neumaticoSchema]
}, { _id: false });

const vehiculoSchema = new mongoose.Schema({
  
  // ===== INFORMACIÓN BÁSICA =====
  placa: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  numero_economico: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tipo_vehiculo: {
    type: String,
    required: true,
    enum: ['olla_revolvedora','planta_de_concreto', 'cargador_frontal', 'camioneta_pickup', 'grua'],
    lowercase: true
  },
  marca: {
    type: String,
    required: true
  },
  modelo: String,
  year: Number,
  vin: String,
  color: String,
  
  // ===== OPERACIÓN =====
  sede_actual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sede'
  },
  operador_actual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  disponibilidad: {
    type: String,
    enum: ['disponible', 'en_servicio', 'mantenimiento', 'fuera_servicio'],
    default: 'disponible'
  },
  
  // ===== MEDIDORES =====
  kilometraje_actual: {
    type: Number,
    default: 0
  },
  horas_motor_actual: {
    type: Number,
    default: 0
  },
  
  // ===== COMBUSTIBLE =====
  tipo_combustible: {
    type: String,
    enum: ['diesel', 'gasolina', 'gas'],
    default: 'diesel'
  },
  capacidad_tanque: {
    type: Number,
    default: 0
  },
  rendimiento_promedio: {
    type: Number,
    default: 0
  },
  
  // ===== CONFIGURACIÓN DE NEUMÁTICOS =====
  configuracion_neumaticos: {
    configurado: {
      type: Boolean,
      default: false
    },
    total_ejes: {
      type: Number,
      default: 0
    },
    ejes: [ejeSchema]
  },
  
  // ===== SOFT DELETE =====
  eliminado: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true
});

// ===== MÉTODO PARA CONFIGURAR NEUMÁTICOS =====
vehiculoSchema.methods.configurarNeumaticos = function(configuracion) {
  let posicionGlobal = 1;
  
  this.configuracion_neumaticos.total_ejes = configuracion.ejes.length;
  this.configuracion_neumaticos.ejes = [];
  
  configuracion.ejes.forEach((ejeConfig, index) => {
    const eje = {
      numero: index + 1,
      nombre: ejeConfig.nombre,
      neumaticos_por_lado: ejeConfig.neumaticos_por_lado,
      neumaticos: []
    };
    
    // Crear neumáticos lado izquierdo
    for (let i = 1; i <= ejeConfig.neumaticos_por_lado; i++) {
      eje.neumaticos.push({
        posicion_global: posicionGlobal++,
        eje_numero: eje.numero,
        lado: 'izquierdo',
        numero_en_lado: i
      });
    }
    
    // Crear neumáticos lado derecho
    for (let i = 1; i <= ejeConfig.neumaticos_por_lado; i++) {
      eje.neumaticos.push({
        posicion_global: posicionGlobal++,
        eje_numero: eje.numero,
        lado: 'derecho',
        numero_en_lado: i
      });
    }
    
    this.configuracion_neumaticos.ejes.push(eje);
  });
  
  this.configuracion_neumaticos.configurado = true;
};

// Índices
vehiculoSchema.index({ placa: 1 });
vehiculoSchema.index({ numero_economico: 1 });
vehiculoSchema.index({ tipo_vehiculo: 1 });
vehiculoSchema.index({ sede_actual: 1 });
vehiculoSchema.index({ eliminado: 1 });

const Vehiculo = mongoose.model('Vehiculo', vehiculoSchema);

export default Vehiculo;