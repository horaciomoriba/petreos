import mongoose from 'mongoose';

const sedeSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la sede es requerido'],
    unique: true,
    trim: true
  },
  ubicacion: {
    type: String,
    required: [true, 'La ubicación es requerida'],
    trim: true
  },
  direccion: {
    type: String,
    trim: true
  },
  telefono: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Sede = mongoose.model('Sede', sedeSchema);

export default Sede;