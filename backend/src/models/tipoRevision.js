// src/models/tipoRevision.js

import mongoose from 'mongoose';

const preguntaSchema = new mongoose.Schema({
  numero: {
    type: Number,
    required: true
  },
  texto: {
    type: String,
    required: true
  }
}, { _id: false });

const seccionSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  orden: {
    type: Number,
    required: true
  },
  preguntas: [preguntaSchema],
  
  // 🆕 Configuración de comentarios
  permite_comentarios: {
    type: Boolean,
    default: true
  },
  placeholder_comentarios: {
    type: String,
    default: 'Comentarios adicionales para esta sección...'
  }
}, { _id: false });

const campoLlantaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['bien_mal', 'numero'],
    default: 'bien_mal'
  },
  unidad: {
    type: String,
    required: false  // Ej: 'PSI', 'mm'
  },
  rango_min: {
    type: Number,
    required: false
  },
  rango_max: {
    type: Number,
    required: false
  }
}, { _id: false });

const tipoRevisionSchema = new mongoose.Schema({
  
  nombre: {
    type: String,
    required: true,
    unique: true
  },
  codigo: {
    type: String,
    required: true,
    unique: true
  },
  tipo_vehiculo: {
    type: String,
    required: true,
    enum: ['olla_revolvedora', 'planta_de_concreto', 'cargador_frontal', 'camioneta_pickup', 'grua', 'bomba_de_concreto', 'automovil']
  },
  frecuencia: {
    type: String,
    required: true,
    enum: ['diaria', 'mensual', 'bimestral']
  },
  
  // ===== SECCIONES (simplificado) =====
  secciones: [seccionSchema],
  
  // ===== CONFIGURACIÓN DE LLANTAS (simplificado) =====
  revision_llantas: {
    activa: {
      type: Boolean,
      default: true
    },
    campos: {
      type: [campoLlantaSchema],
      default: [
        {
          nombre: 'presion_medida',
          label: 'Presión',
          tipo: 'numero',
          unidad: 'PSI',
          rango_min: 80,
          rango_max: 120
        },
        {
          nombre: 'presion_estado',
          label: 'Estado de Presión',
          tipo: 'bien_mal'
        },
        {
          nombre: 'callo_medida',
          label: 'Profundidad del Callo',
          tipo: 'numero',
          unidad: 'mm',
          rango_min: 3,
          rango_max: 15
        },
        {
          nombre: 'callo_estado',
          label: 'Estado del Callo',
          tipo: 'bien_mal'
        }
      ]
    },
    permite_comentarios: {
      type: Boolean,
      default: true
    },
    placeholder_comentarios: {
      type: String,
      default: 'Comentarios adicionales sobre los neumáticos...'
    }
  },
  
  // ===== CAMPOS ADICIONALES =====
  requiere_licencia_vigente: {
    type: Boolean,
    default: true
  },
  permite_comentarios: {
    type: Boolean,
    default: true
  },
  
  activo: {
    type: Boolean,
    default: true
  }
  
}, {
  timestamps: true
});

tipoRevisionSchema.index({ codigo: 1 });
tipoRevisionSchema.index({ tipo_vehiculo: 1, frecuencia: 1 });
tipoRevisionSchema.index({ activo: 1 });

const TipoRevision = mongoose.model('TipoRevision', tipoRevisionSchema, 'tiporevisions');

export default TipoRevision;