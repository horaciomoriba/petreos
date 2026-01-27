import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  sede: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sede',
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices
areaSchema.index({ nombre: 1, sede: 1 }, { unique: true }); // Nombre único por sede

const Area = mongoose.model('Area', areaSchema);

export default Area;