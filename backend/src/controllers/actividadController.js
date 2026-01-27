// controllers/actividadController.js
import Actividad from '../models/actividad.js';

// @desc    Obtener actividades recientes (para dashboard)
// @route   GET /api/actividades/recientes
// @access  Private/Admin
export const getActividadesRecientes = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const actividades = await Actividad.find()
      .sort({ fecha: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      data: actividades
    });
  } catch (error) {
    console.error('Error obteniendo actividades recientes:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al obtener actividades recientes',
      error: error.message
    });
  }
};

// @desc    Obtener todas las actividades con filtros
// @route   GET /api/actividades
// @access  Private/Admin
export const getActividades = async (req, res) => {
  try {
    const {
      tipo,
      usuario_tipo,
      fecha_desde,
      fecha_hasta,
      page = 1,
      limit = 20
    } = req.query;
    
    let filtros = {};
    
    if (tipo) filtros.tipo = tipo;
    if (usuario_tipo) filtros.usuario_tipo = usuario_tipo;
    
    // Rango de fechas
    if (fecha_desde || fecha_hasta) {
      filtros.fecha = {};
      if (fecha_desde) filtros.fecha.$gte = new Date(fecha_desde);
      if (fecha_hasta) filtros.fecha.$lte = new Date(fecha_hasta);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [actividades, total] = await Promise.all([
      Actividad.find(filtros)
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Actividad.countDocuments(filtros)
    ]);
    
    res.json({
      success: true,
      data: actividades,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo actividades:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al obtener actividades',
      error: error.message
    });
  }
};