import Sede from '../models/sede.js';

// @desc    Obtener todas las sedes
// @route   GET /api/admin/sedes
// @access  Private (Admin)
export const getSedes = async (req, res) => {
  try {
    const sedes = await Sede.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sedes.length,
      data: sedes
    });
  } catch (error) {
    console.error('Error al obtener sedes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sedes'
    });
  }
};

// @desc    Obtener una sede por ID
// @route   GET /api/admin/sedes/:id
// @access  Private (Admin)
export const getSedeById = async (req, res) => {
  try {
    const sede = await Sede.findById(req.params.id);

    if (!sede) {
      return res.status(404).json({
        success: false,
        message: 'Sede no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: sede
    });
  } catch (error) {
    console.error('Error al obtener sede:', error);
    
    // Error de ID inválido
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Sede no encontrada'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al obtener sede'
    });
  }
};

// @desc    Crear nueva sede
// @route   POST /api/admin/sedes
// @access  Private (Admin - super_admin, jefe_mantenimiento)
export const createSede = async (req, res) => {
  try {
    const { nombre, ubicacion, direccion, telefono, email } = req.body;

    // Validar campos requeridos
    if (!nombre || !ubicacion) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y ubicación son requeridos'
      });
    }

    // Verificar si ya existe una sede con ese nombre
    const sedeExistente = await Sede.findOne({ nombre });
    if (sedeExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una sede con ese nombre'
      });
    }

    // Crear sede
    const sede = await Sede.create({
      nombre,
      ubicacion,
      direccion,
      telefono,
      email
    });

    res.status(201).json({
      success: true,
      message: 'Sede creada exitosamente',
      data: sede
    });
  } catch (error) {
    console.error('Error al crear sede:', error);
    
    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear sede'
    });
  }
};

// @desc    Actualizar sede
// @route   PUT /api/admin/sedes/:id
// @access  Private (Admin - super_admin, jefe_mantenimiento)
export const updateSede = async (req, res) => {
  try {
    const { nombre, ubicacion, direccion, telefono, email, activo } = req.body;

    let sede = await Sede.findById(req.params.id);

    if (!sede) {
      return res.status(404).json({
        success: false,
        message: 'Sede no encontrada'
      });
    }

    // Si se está actualizando el nombre, verificar que no exista otra con ese nombre
    if (nombre && nombre !== sede.nombre) {
      const sedeExistente = await Sede.findOne({ nombre });
      if (sedeExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una sede con ese nombre'
        });
      }
    }

    // Actualizar campos
    sede.nombre = nombre || sede.nombre;
    sede.ubicacion = ubicacion || sede.ubicacion;
    sede.direccion = direccion !== undefined ? direccion : sede.direccion;
    sede.telefono = telefono !== undefined ? telefono : sede.telefono;
    sede.email = email !== undefined ? email : sede.email;
    sede.activo = activo !== undefined ? activo : sede.activo;

    await sede.save();

    res.status(200).json({
      success: true,
      message: 'Sede actualizada exitosamente',
      data: sede
    });
  } catch (error) {
    console.error('Error al actualizar sede:', error);
    
    // Error de ID inválido
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Sede no encontrada'
      });
    }

    // Error de validación
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar sede'
    });
  }
};

// @desc    Eliminar sede (soft delete)
// @route   DELETE /api/admin/sedes/:id
// @access  Private (Admin - super_admin)
export const deleteSede = async (req, res) => {
  try {
    const sede = await Sede.findById(req.params.id);

    if (!sede) {
      return res.status(404).json({
        success: false,
        message: 'Sede no encontrada'
      });
    }

    // Soft delete - solo desactivar
    sede.activo = false;
    await sede.save();

    res.status(200).json({
      success: true,
      message: 'Sede desactivada exitosamente',
      data: sede
    });
  } catch (error) {
    console.error('Error al eliminar sede:', error);
    
    // Error de ID inválido
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Sede no encontrada'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar sede'
    });
  }
};

// @desc    Eliminar sede permanentemente
// @route   DELETE /api/admin/sedes/:id/permanent
// @access  Private (Admin - super_admin)
export const permanentDeleteSede = async (req, res) => {
  try {
    const sede = await Sede.findById(req.params.id);

    if (!sede) {
      return res.status(404).json({
        success: false,
        message: 'Sede no encontrada'
      });
    }

    await sede.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sede eliminada permanentemente'
    });
  } catch (error) {
    console.error('Error al eliminar sede permanentemente:', error);
    
    // Error de ID inválido
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Sede no encontrada'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar sede'
    });
  }
};