import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';
import User from '../models/user.js';

// ==========================================
// MIDDLEWARE GENÉRICO (cualquier usuario autenticado)
// ==========================================
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token no encontrado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Guardar el decoded en req.user (contiene: id, tipo, rol)
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Error en protect:', error);
    res.status(401).json({
      success: false,
      message: 'No autorizado - Token inválido'
    });
  }
};

// ==========================================
// MIDDLEWARE SOLO ADMINS
// ==========================================
export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verificar que sea tipo admin
      if (decoded.tipo !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado - Solo administradores'
        });
      }

      // Buscar el admin y agregarlo a req
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado - Administrador no encontrado'
        });
      }

      if (!req.admin.activo) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado - Usuario inactivo'
        });
      }

      // También guardamos decoded para compatibilidad
      req.user = decoded;

      next();
    } catch (error) {
      console.error('Error en protectAdmin:', error);
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token inválido'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'No autorizado - No se proporcionó token'
    });
  }
};

// ==========================================
// MIDDLEWARE SOLO SUPER ADMIN
// ==========================================
export const protectSuperAdmin = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        msg: 'No autorizado, token no encontrado' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que sea tipo admin
    if (decoded.tipo !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        msg: 'Acceso denegado' 
      });
    }

    req.admin = await Admin.findById(decoded.id).select('-password');
    
    if (!req.admin) {
      return res.status(401).json({ 
        success: false, 
        msg: 'Admin no encontrado' 
      });
    }
    
    // Verificar que sea super admin
    if (req.admin.rol !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        msg: 'Acceso denegado. Solo Super Admins' 
      });
    }

    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Error en protectSuperAdmin:', error);
    res.status(401).json({ 
      success: false, 
      msg: 'No autorizado, token inválido' 
    });
  }
};

// ==========================================
// MIDDLEWARE SOLO OPERADORES
// ==========================================
export const protectOperador = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verificar que sea tipo user y rol operador
      if (decoded.tipo !== 'user' || decoded.rol !== 'operador') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado - Solo operadores'
        });
      }

      // Buscar el operador y agregarlo a req
      req.operador = await User.findById(decoded.id)
        .populate('sedeActual', 'nombre ciudad')
        .populate('vehiculoAsignado', 'numero_economico placa tipo_vehiculo')
        .select('-password');

      if (!req.operador) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado - Operador no encontrado'
        });
      }

      if (!req.operador.activo) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado - Usuario inactivo'
        });
      }

      // También guardamos decoded
      req.user = decoded;

      next();
    } catch (error) {
      console.error('Error en protectOperador:', error);
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token inválido'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'No autorizado - No se proporcionó token'
    });
  }
};

// ==========================================
// MIDDLEWARE LEGACY (mantener por compatibilidad)
// ==========================================
export const protectUser = async (req, res, next) => {
  // Alias de protectOperador para compatibilidad con código existente
  return protectOperador(req, res, next);
};

// ==========================================
// MIDDLEWARE PARA VERIFICAR ROLES ESPECÍFICOS DE ADMIN
// ==========================================
export const authorizeAdmin = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado - Solo para administradores'
      });
    }

    if (!roles.includes(req.admin.rol)) {
      return res.status(403).json({
        success: false,
        message: `El rol ${req.admin.rol} no tiene permiso para acceder a esta ruta`
      });
    }
    next();
  };
};

// ==========================================
// MIDDLEWARE PARA VERIFICAR ROLES ESPECÍFICOS DE USER
// ==========================================
export const authorizeUser = (...roles) => {
  return (req, res, next) => {
    if (!req.operador && !req.user) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado - Solo para usuarios'
      });
    }

    const userRol = req.operador?.rol || req.user?.rol;

    if (!roles.includes(userRol)) {
      return res.status(403).json({
        success: false,
        message: `El rol ${userRol} no tiene permiso para acceder a esta ruta`
      });
    }
    next();
  };
};