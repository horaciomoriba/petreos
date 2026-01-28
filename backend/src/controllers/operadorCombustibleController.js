// petreosbackend/src/controllers/operadorCombustibleController.js

import CargaCombustible from '../models/cargacombustible.js';
import Vehiculo from '../models/vehiculo.js';
import registrarActividad from '../utils/activityLogger.js'; // ⭐ NUEVO IMPORT

// @desc    Registrar nueva carga de combustible (OPERADOR)
// @route   POST /api/operador/combustible
// @access  Private (Operador)
export const registrarCarga = async (req, res) => {
  try {
    const {
      litros_cargados,
      horas_motor_al_momento,
      kilometraje_al_momento,
      costo,
      gasolinera,
      numero_ticket,
      observaciones,
      fecha_carga
    } = req.body;

    // Validar que req.operador exista (viene del middleware protectOperador)
    if (!req.operador) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Verificar que el operador tenga un vehículo asignado
    const vehiculo = await Vehiculo.findOne({ operador_actual: req.operador._id });

    if (!vehiculo) {
      return res.status(400).json({
        success: false,
        message: 'No tienes un vehículo asignado'
      });
    }

    // Validaciones básicas
    if (!litros_cargados || litros_cargados <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Los litros cargados deben ser mayor a 0'
      });
    }

    if (!horas_motor_al_momento || horas_motor_al_momento < 0) {
      return res.status(400).json({
        success: false,
        message: 'Las horas del motor son obligatorias y deben ser positivas'
      });
    }

    // Validar que las horas no sean menores a la última carga
    const ultimaCarga = await CargaCombustible.findOne({
      vehiculo: vehiculo._id
    })
    .sort({ fecha_carga: -1 })
    .select('horas_motor_al_momento');

    if (ultimaCarga && horas_motor_al_momento < ultimaCarga.horas_motor_al_momento) {
      return res.status(400).json({
        success: false,
        message: `Las horas del motor no pueden ser menores a la última carga registrada (${ultimaCarga.horas_motor_al_momento} hrs)`
      });
    }

    // CORRECCIÓN: Obtener tipo_combustible correctamente
    // Manejar tanto camelCase como snake_case
    const tipoCombustible = vehiculo.tipo_combustible || vehiculo.tipoCombustible || 'diesel';

    // Crear la carga
    const nuevaCarga = await CargaCombustible.create({
      vehiculo: vehiculo._id,
      fecha_carga: fecha_carga || Date.now(),
      litros_cargados,
      horas_motor_al_momento,
      kilometraje_al_momento,
      tipo_combustible: tipoCombustible,
      costo,
      gasolinera,
      numero_ticket,
      observaciones,
      registrado_por: {
        user_id: req.operador._id,
        nombre: req.operador.nombre,
        rol: 'operador'
      }
    });

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'crear_carga_combustible',
      'operador',
      req.operador.nombre,
      `Registró carga de ${litros_cargados} lts de combustible para vehículo ${vehiculo.placa}`
    );

    // Actualizar el vehículo con los datos más recientes
    if (horas_motor_al_momento && horas_motor_al_momento > vehiculo.horas_motor_actual) {
      vehiculo.horas_motor_actual = horas_motor_al_momento;
    }

    if (kilometraje_al_momento && kilometraje_al_momento > vehiculo.kilometraje_actual) {
      vehiculo.kilometraje_actual = kilometraje_al_momento;
    }

    await vehiculo.save();

    // Populate para respuesta
    await nuevaCarga.populate('vehiculo', 'placa numero_economico marca modelo');

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

// @desc    Obtener mis últimas cargas de combustible (OPERADOR)
// @route   GET /api/operador/mis-cargas
// @access  Private (Operador)
export const getMisCargas = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Validar que req.operador exista
    if (!req.operador) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Buscar vehículo asignado al operador
    const vehiculo = await Vehiculo.findOne({ operador_actual: req.operador._id });

    if (!vehiculo) {
      return res.status(200).json({
        success: true,
        message: 'No tienes un vehículo asignado',
        data: [],
        total: 0
      });
    }

    // Obtener cargas del vehículo asignado
    const cargas = await CargaCombustible.find({
      vehiculo: vehiculo._id
    })
    .populate('vehiculo', 'placa numero_economico marca modelo')
    .sort({ fecha_carga: -1 })
    .limit(parseInt(limit))
    .lean();

    const total = await CargaCombustible.countDocuments({
      vehiculo: vehiculo._id
    });

    res.status(200).json({
      success: true,
      data: cargas,
      total,
      vehiculo: {
        _id: vehiculo._id,
        placa: vehiculo.placa,
        numero_economico: vehiculo.numero_economico
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

// @desc    Obtener información del vehículo para pre-llenar formulario
// @route   GET /api/operador/combustible/info-vehiculo
// @access  Private (Operador)
export const getInfoVehiculoParaCarga = async (req, res) => {
  try {
    // Validar que req.operador exista
    if (!req.operador) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Buscar vehículo asignado
    const vehiculo = await Vehiculo.findOne({ operador_actual: req.operador._id })
      .select('placa numero_economico horas_motor_actual kilometraje_actual tipo_combustible tipoCombustible capacidad_tanque');

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'No tienes un vehículo asignado'
      });
    }

    // Obtener última carga para contexto
    const ultimaCarga = await CargaCombustible.findOne({
      vehiculo: vehiculo._id
    })
    .sort({ fecha_carga: -1 })
    .select('fecha_carga litros_cargados horas_motor_al_momento rendimiento');

    // Manejar tipo_combustible en ambos formatos
    const tipoCombustible = vehiculo.tipo_combustible || vehiculo.tipoCombustible;

    res.status(200).json({
      success: true,
      vehiculo: {
        _id: vehiculo._id,
        placa: vehiculo.placa,
        numero_economico: vehiculo.numero_economico,
        horas_motor_actual: vehiculo.horas_motor_actual,
        kilometraje_actual: vehiculo.kilometraje_actual,
        tipo_combustible: tipoCombustible,
        capacidad_tanque: vehiculo.capacidad_tanque
      },
      ultima_carga: ultimaCarga || null
    });

  } catch (error) {
    console.error('Error al obtener info del vehículo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del vehículo',
      error: error.message
    });
  }
};

export default {
  registrarCarga,
  getMisCargas,
  getInfoVehiculoParaCarga
};