import mongoose from 'mongoose';

const inventarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  cantidad: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  sede: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sede',
    required: true
  },
  categoria: {
    type: String,
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Inventario = mongoose.model('Inventario', inventarioSchema);

export default Inventario;