// src/models/revision.js

import mongoose from 'mongoose';

const respuestaSchema = new mongoose.Schema({
  numero: {
    type: Number,
    required: true
  },
  texto_pregunta: {
    type: String,
    required: true
  },
  respuesta: {
    type: String,
    enum: ['Bien', 'Mal'],
    required: true
  },
  seccion_nombre: {
    type: String,
    required: true
  },
  seccion_orden: {
    type: Number,
    required: true
  },
  observaciones: {
    type: String,
    required: false,
    default: ''
  },
  fecha_reporte_mantenimiento: {
    type: Date,
    required: false
  }
}, { _id: false });

const llantaRevisionSchema = new mongoose.Schema({
  posicion: {
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
  
  // 🆕 PRESIÓN - Con medida y estado
  presion_medida: {
    type: Number,
    required: true,
    min: 0,
    max: 200  // PSI
  },
  presion_estado: {
    type: String,
    enum: ['Bien', 'Mal'],
    required: true
  },
  
  // 🆕 CALLO/PROFUNDIDAD - Con medida y estado
  callo_medida: {
    type: Number,
    required: true,
    min: 0,
    max: 30  // mm
  },
  callo_estado: {
    type: String,
    enum: ['Bien', 'Mal'],
    required: true
  },
  
  // ⚠️ RETROCOMPATIBILIDAD - Campos antiguos (opcionales)
  presion: {
    type: String,
    enum: ['Bien', 'Mal'],
    required: false
  },
  estado: {
    type: String,
    enum: ['Bien', 'Mal'],
    required: false
  }
}, { _id: false });

const comentarioSeccionSchema = new mongoose.Schema({
  seccion_nombre: {
    type: String,
    required: true
  },
  seccion_orden: {
    type: Number,
    required: true
  },
  comentario: {
    type: String,
    default: ''
  }
}, { _id: false });

const revisionSchema = new mongoose.Schema({
  
  // ===== REFERENCIAS =====
  vehiculo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehiculo',
    required: true
  },
  tipo_revision: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TipoRevision',
    required: true
  },
  
  // ===== INFO BÁSICA =====
  numero_economico: {
    type: String,
    required: true
  },
  placa: {
    type: String,
    required: true
  },
  tipo_vehiculo: {
    type: String,
    required: true
  },
  frecuencia: {
    type: String,
    enum: ['diaria', 'mensual', 'bimestral'],
    required: true
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // ===== OPERADOR =====
  operador: {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    nombre: {
      type: String,
      required: true
    },
    licencia_vigente: {
      type: Boolean,
      required: true
    }
  },
  
  // ===== RESPUESTAS (simplificado) =====
  respuestas: [respuestaSchema],
  
  // ===== LLANTAS =====
  llantas: [llantaRevisionSchema],
  
  // ===== COMENTARIOS (3 TIPOS) =====
  // 1️⃣ Comentarios por sección del checklist
  comentarios_secciones: [comentarioSeccionSchema],
  
  // 2️⃣ Comentarios específicos de neumáticos
  comentarios_neumaticos: {
    type: String,
    default: ''
  },
  
  // 3️⃣ Comentarios generales de toda la revisión
  comentarios: String,
  
  // ===== DATOS OPERACIONALES =====
  nivel_combustible: {
    type: String,
    enum: ['lleno', '3/4', '1/2', '1/4', 'reserva'],
    required: true
  },
  kilometraje_al_momento: {
    type: Number,
    required: true,
    min: 0
  },
  horas_motor_al_momento: {
    type: Number,
    required: true,
    min: 0
  },
  
  // ===== ANÁLISIS AUTOMÁTICO =====
  tiene_problemas: {
    type: Boolean,
    default: false
  },
  items_mal: [{
    numero: Number,
    texto: String,
    seccion_nombre: String,
    seccion_orden: Number
  }],
  llantas_mal: [{
    posicion: Number,
    problema: String  // 'presion_estado', 'callo_estado', 'presion', 'estado'
  }],
  
  // ===== FIRMAS =====
  firma_operador: {
    firmado: {
      type: Boolean,
      default: false
    },
    fecha: Date
  },
  firma_mecanico: {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    nombre: String,
    firmado: {
      type: Boolean,
      default: false
    },
    fecha: Date
  },
  
  // ===== APROBACIÓN =====
  aprobada: {
    type: Boolean,
    default: false
  },
  fecha_aprobacion: {
    type: Date
  },
  aprobada_por: {
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    nombre: String
  },
  
  // ===== PDF =====
  pdf_url: {
    type: String,
    default: null
  },
  
  pdf_generado_en: {
    type: Date,
    default: null
  },

  // ===== ESTADO =====
  estado: {
    type: String,
    enum: ['en_progreso', 'completada', 'pendiente_revision', 'cerrada'],
    default: 'en_progreso'
  }
  
}, {
  timestamps: true
});

// ===== MÉTODO PARA ANALIZAR PROBLEMAS =====
revisionSchema.methods.analizarProblemas = function() {
  this.items_mal = [];
  this.llantas_mal = [];
  
  // Revisar respuestas del checklist
  this.respuestas.forEach(resp => {
    if (resp.respuesta === 'Mal') {
      this.items_mal.push({
        numero: resp.numero,
        texto: resp.texto_pregunta,
        seccion_nombre: resp.seccion_nombre,
        seccion_orden: resp.seccion_orden
      });
    }
  });
  
  // Revisar llantas
  this.llantas.forEach(llanta => {
    // Revisar estado de presión
    if (llanta.presion_estado === 'Mal') {
      this.llantas_mal.push({
        posicion: llanta.posicion,
        problema: 'presion_estado'
      });
    }
    
    // Revisar estado de callo
    if (llanta.callo_estado === 'Mal') {
      this.llantas_mal.push({
        posicion: llanta.posicion,
        problema: 'callo_estado'
      });
    }
    
    // ⚠️ RETROCOMPATIBILIDAD
    if (llanta.presion === 'Mal') {
      this.llantas_mal.push({
        posicion: llanta.posicion,
        problema: 'presion'
      });
    }
    if (llanta.estado === 'Mal') {
      this.llantas_mal.push({
        posicion: llanta.posicion,
        problema: 'estado'
      });
    }
  });
  
  this.tiene_problemas = (this.items_mal.length > 0 || this.llantas_mal.length > 0);
  
  return {
    tiene_problemas: this.tiene_problemas,
    total_items_mal: this.items_mal.length,
    total_llantas_mal: this.llantas_mal.length
  };
};

// Índices
revisionSchema.index({ vehiculo: 1, fecha: -1 });
revisionSchema.index({ numero_economico: 1, fecha: -1 });
revisionSchema.index({ tipo_vehiculo: 1, frecuencia: 1 });
revisionSchema.index({ fecha: -1 });
revisionSchema.index({ tiene_problemas: 1 });
revisionSchema.index({ estado: 1 });
revisionSchema.index({ 'operador.user_id': 1 });

const Revision = mongoose.model('Revision', revisionSchema, 'revisiones');

export default Revision;