// petreosbackend/src/controllers/adminCombustibleController.js

import CargaCombustible from '../models/cargacombustible.js';
import Vehiculo from '../models/vehiculo.js';
import mongoose from 'mongoose';
import registrarActividad from '../utils/activityLogger.js';

// @desc    Registrar nueva carga de combustible (ADMIN)
// @route   POST /api/admin/combustible
// @access  Private (Admin)
export const registrarCarga = async (req, res) => {
  try {
    const {
      vehiculo_id,
      litros_cargados,
      horas_motor_anterior,
      horas_motor_al_momento,
      kilometraje_anterior,
      kilometraje_al_momento,
      costo,
      gasolinera,
      numero_ticket,
      observaciones,
      fecha_carga
    } = req.body;

    // Validar autenticación
    const userSource = req.admin || req.user;
    
    if (!userSource) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const userId = userSource._id || userSource.id;
    const userName = userSource.nombre || userSource.name || userSource.username || 'Admin';

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Error de autenticación: ID de usuario no encontrado'
      });
    }

    // Validaciones básicas
    if (!vehiculo_id) {
      return res.status(400).json({
        success: false,
        message: 'El vehículo es obligatorio'
      });
    }

    if (!litros_cargados || litros_cargados <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Los litros cargados deben ser mayor a 0'
      });
    }

    if (horas_motor_anterior === undefined || horas_motor_anterior === null) {
      return res.status(400).json({
        success: false,
        message: 'Las horas del motor anterior son obligatorias'
      });
    }

    if (!horas_motor_al_momento || horas_motor_al_momento < 0) {
      return res.status(400).json({
        success: false,
        message: 'Las horas del motor al momento son obligatorias'
      });
    }

    // ⭐ NUEVA VALIDACIÓN: horas_anterior < horas_actual
    if (horas_motor_anterior > horas_motor_al_momento) {
      return res.status(400).json({
        success: false,
        message: 'Las horas del motor anterior no pueden ser mayores a las horas actuales'
      });
    }

    // Verificar que el vehículo exista
    const vehiculo = await Vehiculo.findById(vehiculo_id);
    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    const tipoCombustible = vehiculo.tipo_combustible || vehiculo.tipoCombustible || 'diesel';

    // Crear la carga (sin actualizar vehículo)
    const nuevaCarga = await CargaCombustible.create({
      vehiculo: vehiculo_id,
      fecha_carga: fecha_carga || Date.now(),
      litros_cargados,
      horas_motor_anterior,
      horas_motor_al_momento,
      kilometraje_anterior,
      kilometraje_al_momento,
      tipo_combustible: tipoCombustible,
      costo,
      gasolinera,
      numero_ticket,
      observaciones,
      registrado_por: {
        user_id: userId,
        nombre: userName,
        rol: 'admin'
      }
    });

    console.log('✅ Carga creada:', nuevaCarga._id);

    // Registrar actividad
    await registrarActividad(
      'crear_carga_combustible',
      'admin',
      userName,
      `Registró carga de ${litros_cargados} lts de combustible para vehículo ${vehiculo.numero_economico}`
    );

    // Populate para respuesta
    await nuevaCarga.populate('vehiculo', 'placa numero_economico marca modelo tipo_vehiculo');

    res.status(201).json({
      success: true,
      message: 'Carga de combustible registrada correctamente',
      data: nuevaCarga
    });

  } catch (error) {
    console.error('Error al registrar carga:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar la carga de combustible',
      error: error.message
    });
  }
};

// @desc    Obtener todas las cargas con filtros y paginación
// @route   GET /api/admin/combustible
// @access  Private (Admin)
export const getTodasLasCargas = async (req, res) => {
  try {
    const {
      vehiculo,
      fecha_desde,
      fecha_hasta,
      registrado_por,
      page = 1,
      limit = 20,
      sort = '-fecha_carga'
    } = req.query;

    // Construir filtros
    const filtros = {};

    if (vehiculo) {
      filtros.vehiculo = vehiculo;
    }

    if (fecha_desde || fecha_hasta) {
      filtros.fecha_carga = {};
      if (fecha_desde) {
        filtros.fecha_carga.$gte = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        filtros.fecha_carga.$lte = new Date(fecha_hasta);
      }
    }

    if (registrado_por) {
      filtros['registrado_por.user_id'] = registrado_por;
    }

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Obtener cargas
    const cargas = await CargaCombustible.find(filtros)
      .populate('vehiculo', 'placa numero_economico marca modelo tipo_vehiculo sede_actual')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await CargaCombustible.countDocuments(filtros);

    res.status(200).json({
      success: true,
      data: cargas,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener cargas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las cargas',
      error: error.message
    });
  }
};

// @desc    Obtener carga por ID
// @route   GET /api/admin/combustible/:id
// @access  Private (Admin)
export const getCargaById = async (req, res) => {
  try {
    const carga = await CargaCombustible.findById(req.params.id)
      .populate('vehiculo', 'placa numero_economico marca modelo tipo_vehiculo sede_actual operador_actual')
      .lean();

    if (!carga) {
      return res.status(404).json({
        success: false,
        message: 'Carga no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: carga
    });

  } catch (error) {
    console.error('Error al obtener carga:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la carga',
      error: error.message
    });
  }
};

// @desc    Actualizar carga
// @route   PUT /api/admin/combustible/:id
// @access  Private (Admin)
export const actualizarCarga = async (req, res) => {
  try {
    const {
      litros_cargados,
      horas_motor_anterior,
      horas_motor_al_momento,
      kilometraje_anterior,
      kilometraje_al_momento,
      costo,
      gasolinera,
      numero_ticket,
      observaciones,
      fecha_carga
    } = req.body;

    const carga = await CargaCombustible.findById(req.params.id)
      .populate('vehiculo', 'placa numero_economico');

    if (!carga) {
      return res.status(404).json({
        success: false,
        message: 'Carga no encontrada'
      });
    }

    // Actualizar campos permitidos
    if (litros_cargados !== undefined) carga.litros_cargados = litros_cargados;
    if (horas_motor_anterior !== undefined) carga.horas_motor_anterior = horas_motor_anterior;
    if (horas_motor_al_momento !== undefined) carga.horas_motor_al_momento = horas_motor_al_momento;
    if (kilometraje_anterior !== undefined) carga.kilometraje_anterior = kilometraje_anterior;
    if (kilometraje_al_momento !== undefined) carga.kilometraje_al_momento = kilometraje_al_momento;
    if (costo !== undefined) carga.costo = costo;
    if (gasolinera !== undefined) carga.gasolinera = gasolinera;
    if (numero_ticket !== undefined) carga.numero_ticket = numero_ticket;
    if (observaciones !== undefined) carga.observaciones = observaciones;
    if (fecha_carga !== undefined) carga.fecha_carga = fecha_carga;

    // Validar que horas_anterior < horas_actual
    if (carga.horas_motor_anterior > carga.horas_motor_al_momento) {
      return res.status(400).json({
        success: false,
        message: 'Las horas del motor anterior no pueden ser mayores a las horas actuales'
      });
    }

    await carga.save();

    // Registrar actividad
    const userName = req.admin?.nombre || req.user?.nombre || 'Admin';
    await registrarActividad(
      'actualizar_carga_combustible',
      'admin',
      userName,
      `Actualizó carga de combustible del vehículo ${carga.vehiculo.numero_economico}`
    );

    await carga.populate('vehiculo', 'placa numero_economico marca modelo');

    res.status(200).json({
      success: true,
      message: 'Carga actualizada correctamente',
      data: carga
    });

  } catch (error) {
    console.error('Error al actualizar carga:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la carga',
      error: error.message
    });
  }
};

// @desc    Eliminar carga
// @route   DELETE /api/admin/combustible/:id
// @access  Private (Admin)
export const eliminarCarga = async (req, res) => {
  try {
    const carga = await CargaCombustible.findById(req.params.id)
      .populate('vehiculo', 'placa numero_economico');

    if (!carga) {
      return res.status(404).json({
        success: false,
        message: 'Carga no encontrada'
      });
    }

    await carga.deleteOne();

    // Registrar actividad
    const userName = req.admin?.nombre || req.user?.nombre || 'Admin';
    await registrarActividad(
      'eliminar_carga_combustible',
      'admin',
      userName,
      `Eliminó carga de combustible del vehículo ${carga.vehiculo.numero_economico}`
    );

    res.status(200).json({
      success: true,
      message: 'Carga eliminada correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar carga:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la carga',
      error: error.message
    });
  }
};

// @desc    Obtener estadísticas generales
// @route   GET /api/admin/combustible/stats
// @access  Private (Admin)
export const getEstadisticasGenerales = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    // Filtro de fechas
    const filtroFecha = {};
    if (fecha_desde || fecha_hasta) {
      filtroFecha.fecha_carga = {};
      if (fecha_desde) filtroFecha.fecha_carga.$gte = new Date(fecha_desde);
      if (fecha_hasta) filtroFecha.fecha_carga.$lte = new Date(fecha_hasta);
    }

    // Estadísticas globales
    const statsGenerales = await CargaCombustible.aggregate([
      { $match: filtroFecha },
      {
        $group: {
          _id: null,
          total_litros: { $sum: '$litros_cargados' },
          total_costo: { $sum: '$costo' },
          total_cargas: { $sum: 1 },
          consumo_promedio_hora: { 
            $avg: {
              $cond: [
                { $eq: ['$rendimiento.calculado', true] },
                '$rendimiento.consumo_por_hora',
                null
              ]
            }
          },
          consumo_promedio_km: { 
            $avg: {
              $cond: [
                { $eq: ['$rendimiento.calculado', true] },
                '$rendimiento.consumo_por_km',
                null
              ]
            }
          }
        }
      }
    ]);

    // Top 5 vehículos con más consumo
    const topConsumidores = await CargaCombustible.aggregate([
      { $match: filtroFecha },
      {
        $group: {
          _id: '$vehiculo',
          total_litros: { $sum: '$litros_cargados' },
          total_costo: { $sum: '$costo' },
          num_cargas: { $sum: 1 }
        }
      },
      { $sort: { total_litros: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'vehiculos',
          localField: '_id',
          foreignField: '_id',
          as: 'vehiculo'
        }
      },
      { $unwind: '$vehiculo' },
      {
        $project: {
          vehiculo: {
            _id: '$vehiculo._id',
            placa: '$vehiculo.placa',
            numero_economico: '$vehiculo.numero_economico',
            marca: '$vehiculo.marca',
            modelo: '$vehiculo.modelo'
          },
          total_litros: 1,
          total_costo: 1,
          num_cargas: 1
        }
      }
    ]);

    // Consumo por mes (últimos 6 meses)
    const consumoPorMes = await CargaCombustible.aggregate([
      {
        $match: {
          fecha_carga: { 
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$fecha_carga' },
            month: { $month: '$fecha_carga' }
          },
          total_litros: { $sum: '$litros_cargados' },
          total_costo: { $sum: '$costo' },
          num_cargas: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        generales: statsGenerales[0] || {
          total_litros: 0,
          total_costo: 0,
          total_cargas: 0,
          consumo_promedio_hora: 0,
          consumo_promedio_km: 0
        },
        top_consumidores: topConsumidores,
        consumo_por_mes: consumoPorMes
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// @desc    Obtener cargas y estadísticas de un vehículo específico
// @route   GET /api/admin/combustible/vehiculo/:vehiculoId
// @access  Private (Admin)
export const getCargasVehiculo = async (req, res) => {
  try {
    const { vehiculoId } = req.params;
    const { limit = 20, page = 1 } = req.query;

    // Validar que el vehículo exista
    const vehiculo = await Vehiculo.findById(vehiculoId)
      .select('placa numero_economico marca modelo tipo_vehiculo');

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    // Obtener estadísticas del vehículo
    const estadisticas = await CargaCombustible.getEstadisticasVehiculo(vehiculoId);

    // Obtener cargas con paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const cargas = await CargaCombustible.find({ vehiculo: vehiculoId })
      .sort({ fecha_carga: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await CargaCombustible.countDocuments({ vehiculo: vehiculoId });

    res.status(200).json({
      success: true,
      vehiculo,
      estadisticas,
      cargas,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener cargas del vehículo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cargas del vehículo',
      error: error.message
    });
  }
};

export default {
  registrarCarga,
  getTodasLasCargas,
  getCargaById,
  actualizarCarga,
  eliminarCarga,
  getEstadisticasGenerales,
  getCargasVehiculo
};