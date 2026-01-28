import Admin from '../models/admin.js';
import bcrypt from 'bcryptjs';
import Sede from '../models/sede.js';
import Vehiculo from '../models/vehiculo.js';
import Revision from '../models/revision.js';
import registrarActividad from '../utils/activityLogger.js'; // ⭐ NUEVO IMPORT

// ==========================================
// CRUD ADMINS (Solo Super Admin)
// ==========================================

// @desc    Listar todos los admins
// @route   GET /api/admins
// @access  Super Admin
export const getAdmins = async (req, res) => {
  try {
    const { rol, activo, sedeId } = req.query;
    
    let filtros = {};
    
    if (rol) filtros.rol = rol;
    if (activo !== undefined) filtros.activo = activo === 'true';
    if (sedeId) filtros.sedes = sedeId;
    
    const admins = await Admin.find(filtros)
      .populate('sedes', 'nombre ciudad')
      .populate('areas', 'nombre')
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    console.error('Error en getAdmins:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al obtener administradores',
      error: error.message 
    });
  }
};

// @desc    Obtener un admin por ID
// @route   GET /api/admins/:id
// @access  Super Admin
export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .populate('sedes', 'nombre ciudad direccion')
      .populate('areas', 'nombre descripcion')
      .select('-password');
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Administrador no encontrado' 
      });
    }
    
    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Error en getAdminById:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al obtener administrador',
      error: error.message 
    });
  }
};

// @desc    Crear nuevo admin
// @route   POST /api/admins
// @access  Super Admin
export const createAdmin = async (req, res) => {
  try {
    const { 
      username, 
      password, 
      nombre, 
      rol, 
      sedes, 
      areas, 
      permisos 
    } = req.body;
    
    // Validar campos requeridos
    if (!username || !password || !nombre || !rol) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Username, password, nombre y rol son requeridos' 
      });
    }
    
    // Validar que el rol sea válido
    const rolesValidos = ['super_admin', 'jefe_mantenimiento', 'mecanico', 'supervisor'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Rol inválido' 
      });
    }
    
    // Verificar si el username ya existe
    const existeAdmin = await Admin.findOne({ username });
    if (existeAdmin) {
      return res.status(400).json({ 
        success: false, 
        msg: 'El username ya está en uso' 
      });
    }
    
    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        msg: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }
    
    // Hashear password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear admin
    const admin = await Admin.create({
      username,
      password: hashedPassword,
      nombre,
      rol,
      sedes: sedes || [],
      areas: areas || [],
      permisos: permisos || {}
    });

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'crear_admin',
      'admin',
      req.admin.nombre,
      `Creó administrador ${nombre} con rol ${rol}`
    );
    
    // Obtener admin creado con populate
    const adminCreado = await Admin.findById(admin._id)
      .populate('sedes', 'nombre ciudad')
      .populate('areas', 'nombre')
      .select('-password');
    
    res.status(201).json({
      success: true,
      msg: 'Administrador creado exitosamente',
      data: adminCreado
    });
  } catch (error) {
    console.error('Error en createAdmin:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al crear administrador',
      error: error.message 
    });
  }
};

// @desc    Actualizar admin
// @route   PUT /api/admins/:id
// @access  Super Admin
export const updateAdmin = async (req, res) => {
  try {
    const { 
      nombre, 
      username, 
      rol, 
      sedes, 
      areas, 
      permisos, 
      activo 
    } = req.body;
    
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Administrador no encontrado' 
      });
    }
    
    // Verificar username único (si se está cambiando)
    if (username && username !== admin.username) {
      const existeUsername = await Admin.findOne({ username });
      if (existeUsername) {
        return res.status(400).json({ 
          success: false, 
          msg: 'El username ya está en uso' 
        });
      }
      admin.username = username;
    }
    
    // Validar rol si se está cambiando
    if (rol) {
      const rolesValidos = ['super_admin', 'jefe_mantenimiento', 'mecanico', 'supervisor'];
      if (!rolesValidos.includes(rol)) {
        return res.status(400).json({ 
          success: false, 
          msg: 'Rol inválido' 
        });
      }
      admin.rol = rol;
    }
    
    // Actualizar campos
    if (nombre) admin.nombre = nombre;
    if (sedes !== undefined) admin.sedes = sedes;
    if (areas !== undefined) admin.areas = areas;
    if (permisos !== undefined) admin.permisos = permisos;
    if (activo !== undefined) admin.activo = activo;
    
    await admin.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_admin',
      'admin',
      req.admin.nombre,
      `Actualizó datos del administrador ${admin.nombre}`
    );
    
    const adminActualizado = await Admin.findById(admin._id)
      .populate('sedes', 'nombre ciudad')
      .populate('areas', 'nombre')
      .select('-password');
    
    res.json({
      success: true,
      msg: 'Administrador actualizado exitosamente',
      data: adminActualizado
    });
  } catch (error) {
    console.error('Error en updateAdmin:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al actualizar administrador',
      error: error.message 
    });
  }
};

// @desc    Actualizar permisos de admin
// @route   PUT /api/admins/:id/permisos
// @access  Super Admin
export const updatePermisos = async (req, res) => {
  try {
    const { permisos } = req.body;
    
    if (!permisos || typeof permisos !== 'object') {
      return res.status(400).json({ 
        success: false, 
        msg: 'Permisos inválidos' 
      });
    }
    
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Administrador no encontrado' 
      });
    }
    
    admin.permisos = permisos;
    await admin.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_admin',
      'admin',
      req.admin.nombre,
      `Actualizó permisos del administrador ${admin.nombre}`
    );
    
    const adminActualizado = await Admin.findById(admin._id)
      .populate('sedes', 'nombre ciudad')
      .populate('areas', 'nombre')
      .select('-password');
    
    res.json({
      success: true,
      msg: 'Permisos actualizados exitosamente',
      data: adminActualizado
    });
  } catch (error) {
    console.error('Error en updatePermisos:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al actualizar permisos',
      error: error.message 
    });
  }
};

// @desc    Asignar/desasignar sedes a admin
// @route   PUT /api/admins/:id/sedes
// @access  Super Admin
export const updateSedes = async (req, res) => {
  try {
    const { sedes } = req.body;
    
    if (!Array.isArray(sedes)) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Sedes debe ser un array' 
      });
    }
    
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Administrador no encontrado' 
      });
    }
    
    admin.sedes = sedes;
    await admin.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_admin',
      'admin',
      req.admin.nombre,
      `Actualizó sedes asignadas al administrador ${admin.nombre}`
    );
    
    const adminActualizado = await Admin.findById(admin._id)
      .populate('sedes', 'nombre ciudad')
      .populate('areas', 'nombre')
      .select('-password');
    
    res.json({
      success: true,
      msg: 'Sedes actualizadas exitosamente',
      data: adminActualizado
    });
  } catch (error) {
    console.error('Error en updateSedes:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al actualizar sedes',
      error: error.message 
    });
  }
};

// @desc    Cambiar contraseña de admin
// @route   PUT /api/admins/:id/cambiar-password
// @access  Super Admin
export const cambiarPasswordAdmin = async (req, res) => {
  try {
    const { nuevaPassword } = req.body;
    
    if (!nuevaPassword || nuevaPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        msg: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }
    
    const admin = await Admin.findById(req.params.id).select('+password');
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Administrador no encontrado' 
      });
    }
    
    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(nuevaPassword, salt);
    await admin.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_admin',
      'admin',
      req.admin.nombre,
      `Cambió contraseña del administrador ${admin.nombre}`
    );
    
    res.json({
      success: true,
      msg: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error en cambiarPasswordAdmin:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al cambiar contraseña',
      error: error.message 
    });
  }
};

// @desc    Desactivar admin (soft delete)
// @route   DELETE /api/admins/:id
// @access  Super Admin
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Administrador no encontrado' 
      });
    }
    
    // No permitir desactivar super_admin
    if (admin.rol === 'super_admin') {
      return res.status(400).json({ 
        success: false, 
        msg: 'No se puede desactivar un Super Admin' 
      });
    }
    
    // Desactivar admin
    admin.activo = false;
    await admin.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'eliminar_admin',
      'admin',
      req.admin.nombre,
      `Desactivó al administrador ${admin.nombre}`
    );
    
    res.json({
      success: true,
      msg: 'Administrador desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteAdmin:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al desactivar administrador',
      error: error.message 
    });
  }
};

// @desc    Reactivar admin
// @route   PUT /api/admins/:id/reactivar
// @access  Super Admin
export const reactivarAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Administrador no encontrado' 
      });
    }
    
    admin.activo = true;
    await admin.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_admin',
      'admin',
      req.admin.nombre,
      `Reactivó al administrador ${admin.nombre}`
    );
    
    const adminActualizado = await Admin.findById(admin._id)
      .populate('sedes', 'nombre ciudad')
      .populate('areas', 'nombre')
      .select('-password');
    
    res.json({
      success: true,
      msg: 'Administrador reactivado exitosamente',
      data: adminActualizado
    });
  } catch (error) {
    console.error('Error en reactivarAdmin:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al reactivar administrador',
      error: error.message 
    });
  }
};

// @desc    Obtener estadísticas para el dashboard
// @route   GET /api/admins/dashboard/stats
// @access  Super Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Importar modelos necesarios al inicio del archivo
    // (asegúrate de tener estos imports al principio)
    const Sede = (await import('../models/sede.js')).default;
    const Vehiculo = (await import('../models/vehiculo.js')).default;
    const Revision = (await import('../models/revision.js')).default;
    
    // Contar administradores totales (activos)
    const totalAdmins = await Admin.countDocuments({ activo: true });
    
    // Contar sedes activas
    const totalSedes = await Sede.countDocuments();
    
    // Contar vehículos totales
    const totalVehiculos = await Vehiculo.countDocuments();
    
    // OPCIONAL: Contar revisiones pendientes de aprobación
    const revisionesPendientes = await Revision.countDocuments({ 
      aprobada: false, 
      estado: { $in: ['completada', 'pendiente_revision'] }
    });

    res.json({
      success: true,
      data: {
        totalAdmins,
        totalSedes,
        totalVehiculos,
        revisionesPendientes
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    res.status(500).json({ 
      success: false,
      msg: 'Error al obtener estadísticas del dashboard',
      error: error.message 
    });
  }
};