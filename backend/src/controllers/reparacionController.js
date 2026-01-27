// controllers/reparacionController.js

import Reparacion from '../models/reparacion.js';
import Vehiculo from '../models/vehiculo.js';

// ============================================
// CREATE - Crear nueva reparación
// ============================================
export const crearReparacion = async (req, res) => {
  try {
    const {
      vehiculo_id,
      categoria,
      fecha_realizacion,
      descripcion,
      notas_adicionales,
      piezas,
      costo_mano_obra,
      estado,
      kilometraje_al_momento,
      horas_motor_al_momento
    } = req.body;

    // Validar vehículo existe
    const vehiculo = await Vehiculo.findById(vehiculo_id);
    if (!vehiculo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vehículo no encontrado' 
      });
    }

    // Calcular costo total de piezas
    let piezasCalculadas = [];
    if (piezas && piezas.length > 0) {
      piezasCalculadas = piezas.map(pieza => ({
        nombre: pieza.nombre,
        cantidad: pieza.cantidad,
        costo_unitario: pieza.costo_unitario,
        costo_total: pieza.cantidad * pieza.costo_unitario
      }));
    }

    const costoPiezas = piezasCalculadas.reduce((total, pieza) => total + pieza.costo_total, 0);
    const costoTotal = costoPiezas + (costo_mano_obra || 0);

    // Crear reparación
    const nuevaReparacion = new Reparacion({
      vehiculo: vehiculo_id,
      placa: vehiculo.placa,
      numero_economico: vehiculo.numero_economico,
      tipo_vehiculo: vehiculo.tipo_vehiculo,
      categoria,
      fecha_realizacion,
      descripcion,
      notas_adicionales,
      piezas: piezasCalculadas,
      costo_mano_obra: costo_mano_obra || 0,
      costo_total: costoTotal,
      registrado_por: {
        admin_id: req.admin._id,    // ⭐ CORREGIDO
        nombre: req.admin.name
      },
      estado: estado || 'completada',
      kilometraje_al_momento,
      horas_motor_al_momento
    });

    await nuevaReparacion.save();

    res.status(201).json({
      success: true,
      message: 'Reparación registrada exitosamente',
      data: nuevaReparacion
    });

  } catch (error) {
    console.error('Error al crear reparación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear reparación',
      error: error.message
    });
  }
};

// ============================================
// READ ALL - Obtener todas las reparaciones
// ============================================
export const obtenerReparaciones = async (req, res) => {
  try {
    const { 
      vehiculo, 
      categoria, 
      estado,
      fecha_desde,
      fecha_hasta,
      page = 1, 
      limit = 20 
    } = req.query;

    // Construir filtros
    const filtros = {};
    
    if (vehiculo) filtros.vehiculo = vehiculo;
    if (categoria) filtros.categoria = categoria;
    if (estado) filtros.estado = estado;
    
    if (fecha_desde || fecha_hasta) {
      filtros.fecha_realizacion = {};
      if (fecha_desde) filtros.fecha_realizacion.$gte = new Date(fecha_desde);
      if (fecha_hasta) filtros.fecha_realizacion.$lte = new Date(fecha_hasta);
    }

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reparaciones, total] = await Promise.all([
      Reparacion.find(filtros)
        .populate('vehiculo', 'placa numero_economico marca modelo tipo_vehiculo')
        .sort({ fecha_realizacion: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Reparacion.countDocuments(filtros)
    ]);

    res.json({
      success: true,
      data: reparaciones,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error al obtener reparaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reparaciones',
      error: error.message
    });
  }
};

// ============================================
// READ ONE - Obtener una reparación específica
// ============================================
export const obtenerReparacion = async (req, res) => {
  try {
    const { id } = req.params;

    const reparacion = await Reparacion.findById(id)
      .populate('vehiculo', 'placa numero_economico marca modelo tipo_vehiculo')
      .populate('registrado_por.admin_id', 'name email')
      .populate('modificaciones.modificado_por.admin_id', 'name email');

    if (!reparacion) {
      return res.status(404).json({
        success: false,
        message: 'Reparación no encontrada'
      });
    }

    res.json({
      success: true,
      data: reparacion
    });

  } catch (error) {
    console.error('Error al obtener reparación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reparación',
      error: error.message
    });
  }
};

// ============================================
// UPDATE - Actualizar reparación ⭐ CON TRACKING
// ============================================
export const actualizarReparacion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoria,
      fecha_realizacion,
      descripcion,
      notas_adicionales,
      piezas,
      costo_mano_obra,
      estado,
      kilometraje_al_momento,
      horas_motor_al_momento
    } = req.body;

    const reparacion = await Reparacion.findById(id);
    if (!reparacion) {
      return res.status(404).json({
        success: false,
        message: 'Reparación no encontrada'
      });
    }

    // Calcular nuevo costo si se modificaron piezas o mano de obra
    let piezasCalculadas = reparacion.piezas;
    if (piezas) {
      piezasCalculadas = piezas.map(pieza => ({
        nombre: pieza.nombre,
        cantidad: pieza.cantidad,
        costo_unitario: pieza.costo_unitario,
        costo_total: pieza.cantidad * pieza.costo_unitario
      }));
    }

    const costoPiezas = piezasCalculadas.reduce((total, pieza) => total + pieza.costo_total, 0);
    const nuevoManoObra = costo_mano_obra !== undefined ? costo_mano_obra : reparacion.costo_mano_obra;
    const nuevoCostoTotal = costoPiezas + nuevoManoObra;

    // Actualizar campos
    if (categoria) reparacion.categoria = categoria;
    if (fecha_realizacion) reparacion.fecha_realizacion = fecha_realizacion;
    if (descripcion) reparacion.descripcion = descripcion;
    if (notas_adicionales !== undefined) reparacion.notas_adicionales = notas_adicionales;
    if (piezas) reparacion.piezas = piezasCalculadas;
    if (costo_mano_obra !== undefined) reparacion.costo_mano_obra = costo_mano_obra;
    if (estado) reparacion.estado = estado;
    if (kilometraje_al_momento !== undefined) reparacion.kilometraje_al_momento = kilometraje_al_momento;
    if (horas_motor_al_momento !== undefined) reparacion.horas_motor_al_momento = horas_motor_al_momento;
    
    reparacion.costo_total = nuevoCostoTotal;

    // ⭐ AGREGAR REGISTRO DE MODIFICACIÓN
    reparacion.modificaciones.push({
      fecha: new Date(),
      modificado_por: {
        admin_id: req.admin._id,    // ⭐ CORREGIDO
        nombre: req.admin.name
      },
      descripcion: 'Reparación actualizada'
    });

    await reparacion.save();

    res.json({
      success: true,
      message: 'Reparación actualizada exitosamente',
      data: reparacion
    });

  } catch (error) {
    console.error('Error al actualizar reparación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar reparación',
      error: error.message
    });
  }
};

// ============================================
// DELETE - Eliminar reparación
// ============================================
export const eliminarReparacion = async (req, res) => {
  try {
    const { id } = req.params;

    const reparacion = await Reparacion.findById(id);
    if (!reparacion) {
      return res.status(404).json({
        success: false,
        message: 'Reparación no encontrada'
      });
    }

    await Reparacion.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Reparación eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar reparación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar reparación',
      error: error.message
    });
  }
};

// ============================================
// HISTORIAL - Obtener reparaciones por vehículo
// ============================================
export const obtenerReparacionesPorVehiculo = async (req, res) => {
  try {
    const { vehiculo_id } = req.params;

    const reparaciones = await Reparacion.find({ vehiculo: vehiculo_id })
      .sort({ fecha_realizacion: -1 });

    // Calcular estadísticas
    const stats = {
      total_reparaciones: reparaciones.length,
      costo_total: reparaciones.reduce((sum, rep) => sum + rep.costo_total, 0),
      por_categoria: {}
    };

    reparaciones.forEach(rep => {
      if (!stats.por_categoria[rep.categoria]) {
        stats.por_categoria[rep.categoria] = { count: 0, costo: 0 };
      }
      stats.por_categoria[rep.categoria].count++;
      stats.por_categoria[rep.categoria].costo += rep.costo_total;
    });

    res.json({
      success: true,
      data: reparaciones,
      stats
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de reparaciones',
      error: error.message
    });
  }
};