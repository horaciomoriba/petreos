// petreosbackend/src/models/CargaCombustible.js

import mongoose from 'mongoose';

const cargaCombustibleSchema = new mongoose.Schema({
  // Referencias
  vehiculo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehiculo',
    required: [true, 'El vehículo es obligatorio']
  },

  // Datos de la carga
  fecha_carga: {
    type: Date,
    required: [true, 'La fecha de carga es obligatoria'],
    default: Date.now
  },

  litros_cargados: {
    type: Number,
    required: [true, 'Los litros cargados son obligatorios'],
    min: [0.1, 'Los litros deben ser mayor a 0']
  },

  horas_motor_al_momento: {
    type: Number,
    required: [true, 'Las horas del motor son obligatorias'],
    min: [0, 'Las horas del motor no pueden ser negativas']
  },

  kilometraje_al_momento: {
    type: Number,
    min: [0, 'El kilometraje no puede ser negativo']
  },

  // Información adicional
  tipo_combustible: {
    type: String,
    enum: ['diesel', 'gasolina', 'gas'],
    lowercase: true,
    default: 'diesel' // ✅ AGREGADO: Valor por defecto
  },

  costo: {
    type: Number,
    min: [0, 'El costo no puede ser negativo']
  },

  gasolinera: {
    type: String,
    trim: true
  },

  numero_ticket: {
    type: String,
    trim: true
  },

  observaciones: {
    type: String,
    trim: true,
    maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres']
  },

  // Cálculo de rendimiento (se llena automáticamente)
  rendimiento: {
    horas_motor_anterior: {
      type: Number,
      min: [0, 'Las horas anteriores no pueden ser negativas']
    },
    horas_motor_actual: {
      type: Number,
      min: [0, 'Las horas actuales no pueden ser negativas']
    },
    horas_trabajadas: {
      type: Number,
      min: [0, 'Las horas trabajadas no pueden ser negativas']
    },
    consumo_por_hora: {
      type: Number,
      min: [0, 'El consumo por hora no puede ser negativo']
    },
    calculado: {
      type: Boolean,
      default: false
    }
  },

  // Quién registró
  registrado_por: {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    nombre: {
      type: String,
      required: true
    },
    rol: {
      type: String,
      enum: ['operador', 'admin'],
      required: true
    }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ÍNDICES para consultas rápidas
cargaCombustibleSchema.index({ vehiculo: 1, fecha_carga: -1 });
cargaCombustibleSchema.index({ fecha_carga: -1 });
cargaCombustibleSchema.index({ 'registrado_por.user_id': 1 });

// MIDDLEWARE PRE-SAVE: Calcular rendimiento automáticamente
cargaCombustibleSchema.pre('save', async function() {
  // Solo calcular si es un documento nuevo
  if (!this.isNew) {
    return;
  }

  // Buscar el vehículo para obtener las horas actuales (single source of truth)
  const Vehiculo = mongoose.model('Vehiculo');
  const vehiculo = await Vehiculo.findById(this.vehiculo).select('horas_motor_actual');

  if (!vehiculo) {
    throw new Error('Vehículo no encontrado');
  }

  const horasAnterior = vehiculo.horas_motor_actual || 0;
  const horasActual = this.horas_motor_al_momento;
  const horasTrabajadas = horasActual - horasAnterior;
  
  // Calcular rendimiento si las horas trabajadas son positivas
  if (horasTrabajadas > 0) {
    const consumoPorHora = this.litros_cargados / horasTrabajadas;
    
    this.rendimiento = {
      horas_motor_anterior: parseFloat(horasAnterior.toFixed(2)),
      horas_motor_actual: parseFloat(horasActual.toFixed(2)),
      horas_trabajadas: parseFloat(horasTrabajadas.toFixed(2)),
      consumo_por_hora: parseFloat(consumoPorHora.toFixed(2)),
      calculado: true
    };
  } else if (horasTrabajadas === 0) {
    // Horas no aumentaron
    this.rendimiento = {
      horas_motor_anterior: parseFloat(horasAnterior.toFixed(2)),
      horas_motor_actual: parseFloat(horasActual.toFixed(2)),
      horas_trabajadas: 0,
      consumo_por_hora: 0,
      calculado: false
    };
  } else {
    // Horas retrocedieron (error)
    this.rendimiento = {
      horas_motor_anterior: parseFloat(horasAnterior.toFixed(2)),
      horas_motor_actual: parseFloat(horasActual.toFixed(2)),
      horas_trabajadas: parseFloat(horasTrabajadas.toFixed(2)),
      consumo_por_hora: 0,
      calculado: false
    };
  }
});

// MÉTODO ESTÁTICO: Obtener estadísticas de un vehículo
cargaCombustibleSchema.statics.getEstadisticasVehiculo = async function(vehiculoId) {
  const stats = await this.aggregate([
    {
      $match: { 
        vehiculo: new mongoose.Types.ObjectId(vehiculoId),
        'rendimiento.calculado': true
      }
    },
    {
      $group: {
        _id: null,
        total_litros: { $sum: '$litros_cargados' },
        total_costo: { $sum: '$costo' },
        consumo_promedio: { $avg: '$rendimiento.consumo_por_hora' },
        total_cargas: { $sum: 1 }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    total_litros: 0,
    total_costo: 0,
    consumo_promedio: 0,
    total_cargas: 0
  };
};

// MÉTODO ESTÁTICO: Obtener histórico con rendimiento
cargaCombustibleSchema.statics.getHistoricoCompleto = async function(filtros = {}) {
  const query = this.find(filtros)
    .populate('vehiculo', 'placa numero_economico marca modelo tipo_vehiculo')
    .sort({ fecha_carga: -1 })
    .lean();

  return await query;
};

// MÉTODO DE INSTANCIA: Recalcular rendimiento manualmente
cargaCombustibleSchema.methods.recalcularRendimiento = async function() {
  try {
    // Buscar la carga inmediatamente anterior a esta para saber qué horas tenía el vehículo
    const cargaAnterior = await this.constructor.findOne({
      vehiculo: this.vehiculo,
      fecha_carga: { $lt: this.fecha_carga },
      _id: { $ne: this._id }
    })
    .sort({ fecha_carga: -1 })
    .select('horas_motor_al_momento');

    const horasAnterior = cargaAnterior ? cargaAnterior.horas_motor_al_momento : 0;
    const horasActual = this.horas_motor_al_momento;
    const horasTrabajadas = horasActual - horasAnterior;
    
    if (horasTrabajadas > 0) {
      const consumoPorHora = this.litros_cargados / horasTrabajadas;
      
      this.rendimiento = {
        horas_motor_anterior: parseFloat(horasAnterior.toFixed(2)),
        horas_motor_actual: parseFloat(horasActual.toFixed(2)),
        horas_trabajadas: parseFloat(horasTrabajadas.toFixed(2)),
        consumo_por_hora: parseFloat(consumoPorHora.toFixed(2)),
        calculado: true
      };
    } else if (horasTrabajadas === 0) {
      this.rendimiento = {
        horas_motor_anterior: parseFloat(horasAnterior.toFixed(2)),
        horas_motor_actual: parseFloat(horasActual.toFixed(2)),
        horas_trabajadas: 0,
        consumo_por_hora: 0,
        calculado: false
      };
    } else {
      this.rendimiento = {
        horas_motor_anterior: parseFloat(horasAnterior.toFixed(2)),
        horas_motor_actual: parseFloat(horasActual.toFixed(2)),
        horas_trabajadas: parseFloat(horasTrabajadas.toFixed(2)),
        consumo_por_hora: 0,
        calculado: false
      };
    }

    return this.save();
  } catch (error) {
    throw error;
  }
};

const CargaCombustible = mongoose.model('CargaCombustible', cargaCombustibleSchema);

export default CargaCombustible;