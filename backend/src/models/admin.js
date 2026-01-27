import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
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
    enum: ['super_admin', 'jefe_mantenimiento', 'mecanico', 'supervisor'],
    default: 'supervisor'
  },
  sedes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sede'
  }],
  areas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area'
  }],
  permisos: {
    type: Map,
    of: [String], // ['create', 'read', 'update', 'delete']
    default: {}
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;