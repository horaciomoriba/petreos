import Area from '../models/area.js';
import registrarActividad from '../utils/activityLogger.js'; // ⭐ NUEVO IMPORT

// @desc    Listar todas las áreas
// @route   GET /api/admin/areas
// @access  Admin
export const getAreas = async (req, res) => {
  try {
    const { sedeId, activo } = req.query;
    
    let filtros = {};
    
    if (sedeId) filtros.sede = sedeId;
    if (activo !== undefined) filtros.activo = activo === 'true';
    
    const areas = await Area.find(filtros)
      .populate('sede', 'nombre ciudad')
      .sort({ nombre: 1 });
    
    res.json({
      success: true,
      count: areas.length,
      data: areas
    });
  } catch (error) {
    console.error('Error en getAreas:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al obtener áreas',
      error: error.message 
    });
  }
};

// @desc    Obtener área por ID
// @route   GET /api/admin/areas/:id
// @access  Admin
export const getAreaById = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id)
      .populate('sede', 'nombre ciudad direccion');
    
    if (!area) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Área no encontrada' 
      });
    }
    
    res.json({
      success: true,
      data: area
    });
  } catch (error) {
    console.error('Error en getAreaById:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al obtener área',
      error: error.message 
    });
  }
};

// @desc    Crear nueva área
// @route   POST /api/admin/areas
// @access  Admin
export const createArea = async (req, res) => {
  try {
    const { nombre, descripcion, sede } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !sede) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Nombre y sede son requeridos' 
      });
    }
    
    // Verificar si ya existe un área con ese nombre en esa sede
    const existeArea = await Area.findOne({ nombre, sede });
    if (existeArea) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Ya existe un área con ese nombre en esta sede' 
      });
    }
    
    // Crear área
    const area = await Area.create({
      nombre,
      descripcion,
      sede
    });

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'crear_sede',
      'admin',
      req.admin.nombre,
      `Creó área ${nombre}`
    );
    
    // Obtener área creada con populate
    const areaCreada = await Area.findById(area._id)
      .populate('sede', 'nombre ciudad');
    
    res.status(201).json({
      success: true,
      msg: 'Área creada exitosamente',
      data: areaCreada
    });
  } catch (error) {
    console.error('Error en createArea:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al crear área',
      error: error.message 
    });
  }
};

// @desc    Actualizar área
// @route   PUT /api/admin/areas/:id
// @access  Admin
export const updateArea = async (req, res) => {
  try {
    const { nombre, descripcion, sede, activo } = req.body;
    
    const area = await Area.findById(req.params.id);
    
    if (!area) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Área no encontrada' 
      });
    }
    
    // Verificar nombre único si se está cambiando
    if (nombre && nombre !== area.nombre) {
      const existeNombre = await Area.findOne({ 
        nombre, 
        sede: sede || area.sede,
        _id: { $ne: req.params.id }
      });
      
      if (existeNombre) {
        return res.status(400).json({ 
          success: false, 
          msg: 'Ya existe un área con ese nombre en esta sede' 
        });
      }
      area.nombre = nombre;
    }
    
    // Actualizar campos
    if (descripcion !== undefined) area.descripcion = descripcion;
    if (sede) area.sede = sede;
    if (activo !== undefined) area.activo = activo;
    
    await area.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_sede',
      'admin',
      req.admin.nombre,
      `Actualizó área ${area.nombre}`
    );
    
    const areaActualizada = await Area.findById(area._id)
      .populate('sede', 'nombre ciudad');
    
    res.json({
      success: true,
      msg: 'Área actualizada exitosamente',
      data: areaActualizada
    });
  } catch (error) {
    console.error('Error en updateArea:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al actualizar área',
      error: error.message 
    });
  }
};

// @desc    Desactivar área (soft delete)
// @route   DELETE /api/admin/areas/:id
// @access  Admin
export const deleteArea = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    
    if (!area) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Área no encontrada' 
      });
    }
    
    area.activo = false;
    await area.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'eliminar_sede',
      'admin',
      req.admin.nombre,
      `Desactivó área ${area.nombre}`
    );
    
    res.json({
      success: true,
      msg: 'Área desactivada exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteArea:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al desactivar área',
      error: error.message 
    });
  }
};

// @desc    Eliminar área permanentemente
// @route   DELETE /api/admin/areas/:id/permanent
// @access  Admin
export const permanentDeleteArea = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    
    if (!area) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Área no encontrada' 
      });
    }

    const nombreArea = area.nombre; // Guardar antes de eliminar
    
    await area.deleteOne();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'eliminar_sede',
      'admin',
      req.admin.nombre,
      `Eliminó permanentemente área ${nombreArea}`
    );
    
    res.json({
      success: true,
      msg: 'Área eliminada permanentemente'
    });
  } catch (error) {
    console.error('Error en permanentDeleteArea:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al eliminar área',
      error: error.message 
    });
  }
};