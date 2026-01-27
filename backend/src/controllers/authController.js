import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';
import User from '../models/user.js';

// Generar JWT Token
const generateToken = (id, tipo, rol) => {
  return jwt.sign(
    { id, tipo, rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// ==========================================
// LOGIN ADMIN
// ==========================================

// @desc    Login de admin
// @route   POST /api/admin/auth/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona usuario y contraseña'
      });
    }

    // Buscar admin por username
    const admin = await Admin.findOne({ username }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar que el admin esté activo
    if (!admin.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo - Contacta al administrador'
      });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(admin._id, 'admin', admin.rol);

    // Preparar respuesta sin password
    const adminData = {
      _id: admin._id,
      username: admin.username,
      nombre: admin.nombre,
      tipo: 'admin',
      rol: admin.rol,
      sedes: admin.sedes,
      areas: admin.areas,
      permisos: admin.permisos,
      activo: admin.activo
    };

    res.status(200).json({
      success: true,
      token,
      user: adminData
    });

  } catch (error) {
    console.error('Error en adminLogin:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// ==========================================
// LOGIN OPERADOR
// ==========================================

// @desc    Login de operador
// @route   POST /api/auth/operador/login
// @access  Public
export const operadorLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona usuario y contraseña'
      });
    }

    // Buscar operador por username
    const operador = await User.findOne({ username, rol: 'operador' }).select('+password');

    if (!operador) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar que esté activo
    if (!operador.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo - Contacta al administrador'
      });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, operador.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(operador._id, 'user', operador.rol);

    // Preparar respuesta sin password
    const operadorData = {
      _id: operador._id,
      username: operador.username,
      nombre: operador.nombre,
      tipo: 'user',
      rol: operador.rol,
      sedeActual: operador.sedeActual,
      vehiculoAsignado: operador.vehiculoAsignado,
      activo: operador.activo
    };

    res.status(200).json({
      success: true,
      token,
      user: operadorData
    });

  } catch (error) {
    console.error('Error en operadorLogin:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// ==========================================
// GET PROFILE (Admin o Operador)
// ==========================================

// @desc    Obtener perfil del usuario actual
// @route   GET /api/admin/auth/me o GET /api/auth/operador/me
// @access  Private
export const getProfile = async (req, res) => {
  try {
    let usuario;
    
    // Buscar según el tipo guardado en el token
    if (req.user.tipo === 'admin') {
      usuario = await Admin.findById(req.user.id)
        .populate('sedes', 'nombre ciudad')
        .populate('areas', 'nombre')
        .select('-password');
    } else {
      usuario = await User.findById(req.user.id)
        .populate('sedeActual', 'nombre ciudad')
        .populate('vehiculoAsignado', 'numero_economico placa tipo_vehiculo')
        .select('-password');
    }

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        ...usuario.toObject(),
        tipo: req.user.tipo
      }
    });
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==========================================
// CAMBIAR CONTRASEÑA
// ==========================================

// @desc    Cambiar contraseña
// @route   PUT /api/admin/auth/change-password o PUT /api/auth/operador/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona la contraseña actual y la nueva'
      });
    }

    // Buscar usuario con password según el tipo
    let usuario;
    if (req.user.tipo === 'admin') {
      usuario = await Admin.findById(req.user.id).select('+password');
    } else {
      usuario = await User.findById(req.user.id).select('+password');
    }

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, usuario.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Validar nueva contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(newPassword, salt);

    await usuario.save();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};