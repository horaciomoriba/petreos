import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false // No incluir password por defecto en queries
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  rol: {
    type: String,
    required: true,
    enum: ['operador'], // Por ahora solo operador, después: 'mecanico', 'supervisor', etc.
    default: 'operador'
  },
  sedeActual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sede',
    required: true
  },
  vehiculoAsignado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehiculo',
    default: null
  },
  historialSedes: [{
    sede: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sede'
    },
    fechaAsignacion: {
      type: Date,
      default: Date.now
    },
    fechaSalida: Date
  }],
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para búsquedas rápidas
userSchema.index({ username: 1 });
userSchema.index({ rol: 1, activo: 1 });
userSchema.index({ sedeActual: 1 });
userSchema.index({ vehiculoAsignado: 1 });

// Virtual para saber si la licencia está vigente
userSchema.virtual('licenciaVigente').get(function() {
  if (!this.licencia?.vigencia) return false;
  return new Date(this.licencia.vigencia) > new Date();
});

// Método para asignar vehículo
userSchema.methods.asignarVehiculo = function(vehiculoId) {
  this.vehiculoAsignado = vehiculoId;
  return this.save();
};

// Método para cambiar de sede (guarda historial)
userSchema.methods.cambiarSede = function(nuevaSedeId) {
  // Cerrar sede actual en historial
  if (this.historialSedes.length > 0) {
    const ultimaSede = this.historialSedes[this.historialSedes.length - 1];
    if (!ultimaSede.fechaSalida) {
      ultimaSede.fechaSalida = new Date();
    }
  }
  
  // Agregar nueva sede al historial
  this.historialSedes.push({
    sede: nuevaSedeId,
    fechaAsignacion: new Date()
  });
  
  this.sedeActual = nuevaSedeId;
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;