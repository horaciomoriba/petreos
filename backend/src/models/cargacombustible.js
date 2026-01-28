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

  // ⭐ NUEVOS CAMPOS: Datos independientes para cálculo de rendimiento
  horas_motor_anterior: {
    type: Number,
    required: [true, 'Las horas del motor anterior son obligatorias'],
    min: [0, 'Las horas anteriores no pueden ser negativas'],
    default: 0
  },

  horas_motor_al_momento: {
    type: Number,
    required: [true, 'Las horas del motor son obligatorias'],
    min: [0, 'Las horas del motor no pueden ser negativas']
  },

  kilometraje_anterior: {
    type: Number,
    min: [0, 'El kilometraje anterior no puede ser negativo'],
    default: 0
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
    default: 'diesel'
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
    horas_trabajadas: {
      type: Number,
      min: [0, 'Las horas trabajadas no pueden ser negativas'],
      default: 0
    },
    kilometros_recorridos: {
      type: Number,
      min: [0, 'Los kilómetros recorridos no pueden ser negativos'],
      default: 0
    },
    consumo_por_hora: {
      type: Number,
      min: [0, 'El consumo por hora no puede ser negativo'],
      default: 0
    },
    consumo_por_km: {
      type: Number,
      min: [0, 'El consumo por km no puede ser negativo'],
      default: 0
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

// ⭐ MIDDLEWARE PRE-SAVE: Calcular rendimiento usando campos propios
cargaCombustibleSchema.pre('save', function(next) {
  try {
    // Solo calcular si es un documento nuevo o si cambiaron los valores relevantes
    if (!this.isNew && !this.isModified('horas_motor_anterior') && 
        !this.isModified('horas_motor_al_momento') && 
        !this.isModified('litros_cargados') &&
        !this.isModified('kilometraje_anterior') &&
        !this.isModified('kilometraje_al_momento')) {
      return next();
    }

    // Asegurar que los valores existan
    const horasAnterior = Number(this.horas_motor_anterior) || 0;
    const horasActual = Number(this.horas_motor_al_momento) || 0;
    const horasTrabajadas = horasActual - horasAnterior;

    const kmAnterior = Number(this.kilometraje_anterior) || 0;
    const kmActual = Number(this.kilometraje_al_momento) || 0;
    const kmRecorridos = kmActual - kmAnterior;
    
    // Calcular rendimiento si las horas trabajadas son positivas
    if (horasTrabajadas > 0 && this.litros_cargados > 0) {
      const consumoPorHora = this.litros_cargados / horasTrabajadas;
      const consumoPorKm = kmRecorridos > 0 ? this.litros_cargados / kmRecorridos : 0;
      
      this.rendimiento = {
        horas_trabajadas: parseFloat(horasTrabajadas.toFixed(2)),
        kilometros_recorridos: parseFloat(kmRecorridos.toFixed(2)),
        consumo_por_hora: parseFloat(consumoPorHora.toFixed(2)),
        consumo_por_km: parseFloat(consumoPorKm.toFixed(3)),
        calculado: true
      };
    } else if (horasTrabajadas === 0) {
      // Horas no aumentaron
      this.rendimiento = {
        horas_trabajadas: 0,
        kilometros_recorridos: parseFloat(kmRecorridos.toFixed(2)),
        consumo_por_hora: 0,
        consumo_por_km: 0,
        calculado: false
      };
    } else {
      // Horas retrocedieron (error en datos)
      this.rendimiento = {
        horas_trabajadas: parseFloat(horasTrabajadas.toFixed(2)),
        kilometros_recorridos: parseFloat(kmRecorridos.toFixed(2)),
        consumo_por_hora: 0,
        consumo_por_km: 0,
        calculado: false
      };
    }

    next();
  } catch (error) {
    console.error('Error en pre-save de CargaCombustible:', error);
    next(error);
  }
});

// MÉTODO ESTÁTICO: Obtener estadísticas de un vehículo
cargaCombustibleSchema.statics.getEstadisticasVehiculo = async function(vehiculoId) {
  try {
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
          consumo_promedio_hora: { $avg: '$rendimiento.consumo_por_hora' },
          consumo_promedio_km: { $avg: '$rendimiento.consumo_por_km' },
          total_cargas: { $sum: 1 }
        }
      }
    ]);

    return stats.length > 0 ? stats[0] : {
      total_litros: 0,
      total_costo: 0,
      consumo_promedio_hora: 0,
      consumo_promedio_km: 0,
      total_cargas: 0
    };
  } catch (error) {
    console.error('Error en getEstadisticasVehiculo:', error);
    return {
      total_litros: 0,
      total_costo: 0,
      consumo_promedio_hora: 0,
      consumo_promedio_km: 0,
      total_cargas: 0
    };
  }
};

// MÉTODO ESTÁTICO: Obtener histórico con rendimiento
cargaCombustibleSchema.statics.getHistoricoCompleto = async function(filtros = {}) {
  try {
    const query = this.find(filtros)
      .populate('vehiculo', 'placa numero_economico marca modelo tipo_vehiculo')
      .sort({ fecha_carga: -1 })
      .lean();

    return await query;
  } catch (error) {
    console.error('Error en getHistoricoCompleto:', error);
    return [];
  }
};

// ⭐ MÉTODO DE INSTANCIA: Recalcular rendimiento manualmente (usa campos propios)
cargaCombustibleSchema.methods.recalcularRendimiento = async function() {
  try {
    const horasAnterior = Number(this.horas_motor_anterior) || 0;
    const horasActual = Number(this.horas_motor_al_momento) || 0;
    const horasTrabajadas = horasActual - horasAnterior;

    const kmAnterior = Number(this.kilometraje_anterior) || 0;
    const kmActual = Number(this.kilometraje_al_momento) || 0;
    const kmRecorridos = kmActual - kmAnterior;
    
    if (horasTrabajadas > 0 && this.litros_cargados > 0) {
      const consumoPorHora = this.litros_cargados / horasTrabajadas;
      const consumoPorKm = kmRecorridos > 0 ? this.litros_cargados / kmRecorridos : 0;
      
      this.rendimiento = {
        horas_trabajadas: parseFloat(horasTrabajadas.toFixed(2)),
        kilometros_recorridos: parseFloat(kmRecorridos.toFixed(2)),
        consumo_por_hora: parseFloat(consumoPorHora.toFixed(2)),
        consumo_por_km: parseFloat(consumoPorKm.toFixed(3)),
        calculado: true
      };
    } else if (horasTrabajadas === 0) {
      this.rendimiento = {
        horas_trabajadas: 0,
        kilometros_recorridos: parseFloat(kmRecorridos.toFixed(2)),
        consumo_por_hora: 0,
        consumo_por_km: 0,
        calculado: false
      };
    } else {
      this.rendimiento = {
        horas_trabajadas: parseFloat(horasTrabajadas.toFixed(2)),
        kilometros_recorridos: parseFloat(kmRecorridos.toFixed(2)),
        consumo_por_hora: 0,
        consumo_por_km: 0,
        calculado: false
      };
    }

    return await this.save();
  } catch (error) {
    console.error('Error en recalcularRendimiento:', error);
    throw error;
  }
};

const CargaCombustible = mongoose.model('CargaCombustible', cargaCombustibleSchema);

export default CargaCombustible;