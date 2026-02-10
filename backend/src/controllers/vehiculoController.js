// src/controllers/vehiculoController.js

import Vehiculo from '../models/vehiculo.js';
import User from '../models/user.js';
import registrarActividad from '../utils/activityLogger.js';

// ===== OBTENER TODOS LOS VEHÍCULOS =====
export const getVehiculos = async (req, res) => {
  try {
    const { 
      sede, 
      tipo_vehiculo, 
      disponibilidad, 
      busqueda,
      page = 1,
      limit = 20
    } = req.query;

    // Construir filtros
    const filtros = { eliminado: false };

    if (sede) filtros.sede_actual = sede;
    if (tipo_vehiculo) filtros.tipo_vehiculo = tipo_vehiculo;
    if (disponibilidad) filtros.disponibilidad = disponibilidad;
    
    if (busqueda) {
      filtros.$or = [
        { placa: { $regex: busqueda, $options: 'i' } },
        { numero_economico: { $regex: busqueda, $options: 'i' } },
        { marca: { $regex: busqueda, $options: 'i' } },
        { modelo: { $regex: busqueda, $options: 'i' } }
      ];
    }

    // Paginación
    const skip = (page - 1) * limit;

    const vehiculos = await Vehiculo.find(filtros)
      .populate('sede_actual', 'nombre')
      .populate('operador_actual', 'nombre username rol')
      .sort({ numero_economico: 1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Transformar snake_case a camelCase para el frontend
    const vehiculosTransformados = vehiculos.map(v => ({
      ...v,
      numeroEconomico: v.numero_economico,
      tipoVehiculo: v.tipo_vehiculo,
      sedeActual: v.sede_actual,
      operadorActual: v.operador_actual,
      kilometrajeActual: v.kilometraje_actual,
      horasMotorActual: v.horas_motor_actual,
      tipoCombustible: v.tipo_combustible,
      capacidadTanque: v.capacidad_tanque,
      rendimientoPromedio: v.rendimiento_promedio,
      configuracionNeumaticos: v.configuracion_neumaticos
    }));

    const total = await Vehiculo.countDocuments(filtros);

    res.json({
      vehiculos: vehiculosTransformados,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error en getVehiculos:', error);
    res.status(500).json({ 
      message: 'Error al obtener vehículos',
      error: error.message 
    });
  }
};

// ===== OBTENER UN VEHÍCULO POR ID =====
export const getVehiculoById = async (req, res) => {
  try {
    const { id } = req.params;

    const vehiculo = await Vehiculo.findById(id)
      .populate('sede_actual', 'nombre ciudad')
      .populate('operador_actual', 'nombre username telefono rol')
      .lean();

    if (!vehiculo || vehiculo.eliminado) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    // Transformar a camelCase
    const vehiculoTransformado = {
      ...vehiculo,
      numeroEconomico: vehiculo.numero_economico,
      tipoVehiculo: vehiculo.tipo_vehiculo,
      sedeActual: vehiculo.sede_actual,
      operadorActual: vehiculo.operador_actual,
      kilometrajeActual: vehiculo.kilometraje_actual,
      horasMotorActual: vehiculo.horas_motor_actual,
      tipoCombustible: vehiculo.tipo_combustible,
      capacidadTanque: vehiculo.capacidad_tanque,
      rendimientoPromedio: vehiculo.rendimiento_promedio,
      configuracionNeumaticos: vehiculo.configuracion_neumaticos
    };

    res.json(vehiculoTransformado);

  } catch (error) {
    console.error('Error en getVehiculoById:', error);
    res.status(500).json({ 
      message: 'Error al obtener vehículo',
      error: error.message 
    });
  }
};

// ===== CREAR VEHÍCULO =====
export const createVehiculo = async (req, res) => {
  try {
    const {
      placa,
      numero_economico,
      tipo_vehiculo,
      marca,
      modelo,
      year,
      vin,
      color,
      sede_actual,
      operador_actual,
      tipo_combustible,
      capacidad_tanque,
      kilometraje_actual,
      horas_motor_actual
    } = req.body;

    // Validar campos requeridos
    if (!placa || !numero_economico || !tipo_vehiculo || !marca) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos: placa, numero_economico, tipo_vehiculo, marca' 
      });
    }

    // Verificar que no exista
    const existePlaca = await Vehiculo.findOne({ placa, eliminado: false });
    if (existePlaca) {
      return res.status(400).json({ message: 'Ya existe un vehículo con esa placa' });
    }

    const existeNumero = await Vehiculo.findOne({ numero_economico, eliminado: false });
    if (existeNumero) {
      return res.status(400).json({ message: 'Ya existe un vehículo con ese número económico' });
    }

    // Si se asigna operador, verificar disponibilidad
    if (operador_actual) {
      const operador = await User.findById(operador_actual);
      if (!operador) {
        return res.status(404).json({ 
          message: 'Operador no encontrado' 
        });
      }

      // Si el operador ya tiene un vehículo asignado, desvincularlo del vehículo anterior
      if (operador.vehiculoAsignado) {
        await Vehiculo.findByIdAndUpdate(operador.vehiculoAsignado, {
          operador_actual: null
        });
      }

      // Verificar que el operador no esté asignado a otro vehículo (doble check)
      const operadorOcupado = await User.findOne({ 
        _id: operador_actual,
        vehiculoAsignado: { $ne: null },
        activo: true
      });
      
      if (operadorOcupado && operadorOcupado.vehiculoAsignado) {
        console.log(`Operador ${operadorOcupado.nombre} será reasignado del vehículo anterior`);
      }
    }

    // Crear vehículo
    const vehiculo = new Vehiculo({
      placa,
      numero_economico,
      tipo_vehiculo,
      marca,
      modelo,
      year,
      vin,
      color,
      sede_actual,
      operador_actual: operador_actual || null,
      tipo_combustible,
      capacidad_tanque,
      kilometraje_actual: kilometraje_actual || 0,
      horas_motor_actual: horas_motor_actual || 0
    });

    await vehiculo.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'crear_vehiculo',
      'admin',
      req.admin.nombre,
      `Creó vehículo ${numero_economico} (${placa})`
    );

    // Si se asignó operador, actualizar el operador con el vehículo
    if (operador_actual) {
      await User.findByIdAndUpdate(operador_actual, {
        vehiculoAsignado: vehiculo._id
      });
    }

    // Populate para respuesta
    await vehiculo.populate('sede_actual', 'nombre');
    await vehiculo.populate('operador_actual', 'nombre username');

    // Transformar a camelCase
    const vehiculoTransformado = {
      ...vehiculo.toObject(),
      numeroEconomico: vehiculo.numero_economico,
      tipoVehiculo: vehiculo.tipo_vehiculo,
      sedeActual: vehiculo.sede_actual,
      operadorActual: vehiculo.operador_actual,
      kilometrajeActual: vehiculo.kilometraje_actual,
      horasMotorActual: vehiculo.horas_motor_actual,
      tipoCombustible: vehiculo.tipo_combustible,
      capacidadTanque: vehiculo.capacidad_tanque,
      rendimientoPromedio: vehiculo.rendimiento_promedio,
      configuracionNeumaticos: vehiculo.configuracion_neumaticos
    };

    res.status(201).json({
      message: 'Vehículo creado exitosamente',
      vehiculo: vehiculoTransformado
    });

  } catch (error) {
    console.error('Error en createVehiculo:', error);
    res.status(500).json({ 
      message: 'Error al crear vehículo',
      error: error.message 
    });
  }
};

// ===== ACTUALIZAR VEHÍCULO =====
export const updateVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const vehiculo = await Vehiculo.findById(id);

    if (!vehiculo || vehiculo.eliminado) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    // Si se está cambiando el operador, sincronizar
    if (updates.operador_actual !== undefined && 
        updates.operador_actual !== vehiculo.operador_actual?.toString()) {
      
      // 1. Desvincular operador anterior (si había)
      if (vehiculo.operador_actual) {
        await User.findByIdAndUpdate(vehiculo.operador_actual, {
          vehiculoAsignado: null
        });
      }

      // 2. Si se asigna un nuevo operador (no null)
      if (updates.operador_actual) {
        const nuevoOperador = await User.findById(updates.operador_actual);
        if (!nuevoOperador) {
          return res.status(404).json({ message: 'Operador no encontrado' });
        }

        // 3. Si el nuevo operador ya tenía un vehículo, desvincularlo
        if (nuevoOperador.vehiculoAsignado) {
          await Vehiculo.findByIdAndUpdate(nuevoOperador.vehiculoAsignado, {
            operador_actual: null
          });
        }

        // 4. Asignar este vehículo al nuevo operador
        await User.findByIdAndUpdate(updates.operador_actual, {
          vehiculoAsignado: vehiculo._id
        });
      }
    }

    // Campos que se pueden actualizar
    const camposPermitidos = [
      'marca', 'modelo', 'year', 'vin', 'color',
      'sede_actual', 'operador_actual', 'disponibilidad',
      'tipo_combustible', 'capacidad_tanque'
    ];

    camposPermitidos.forEach(campo => {
      if (updates[campo] !== undefined) {
        vehiculo[campo] = updates[campo];
      }
    });

    await vehiculo.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_vehiculo',
      'admin',
      req.admin.nombre,
      `Actualizó vehículo ${vehiculo.numero_economico} (${vehiculo.placa})`
    );

    await vehiculo.populate('sede_actual', 'nombre');
    await vehiculo.populate('operador_actual', 'nombre username');

    // Transformar a camelCase
    const vehiculoTransformado = {
      ...vehiculo.toObject(),
      numeroEconomico: vehiculo.numero_economico,
      tipoVehiculo: vehiculo.tipo_vehiculo,
      sedeActual: vehiculo.sede_actual,
      operadorActual: vehiculo.operador_actual,
      kilometrajeActual: vehiculo.kilometraje_actual,
      horasMotorActual: vehiculo.horas_motor_actual,
      tipoCombustible: vehiculo.tipo_combustible,
      capacidadTanque: vehiculo.capacidad_tanque,
      rendimientoPromedio: vehiculo.rendimiento_promedio,
      configuracionNeumaticos: vehiculo.configuracion_neumaticos
    };

    res.json({
      message: 'Vehículo actualizado exitosamente',
      vehiculo: vehiculoTransformado
    });

  } catch (error) {
    console.error('Error en updateVehiculo:', error);
    res.status(500).json({ 
      message: 'Error al actualizar vehículo',
      error: error.message 
    });
  }
};

// ===== ELIMINAR VEHÍCULO (SOFT DELETE) =====
export const deleteVehiculo = async (req, res) => {
  try {
    const { id } = req.params;

    const vehiculo = await Vehiculo.findById(id);

    if (!vehiculo || vehiculo.eliminado) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    // Si tiene operador asignado, desvincularlo
    if (vehiculo.operador_actual) {
      await User.findByIdAndUpdate(vehiculo.operador_actual, {
        vehiculoAsignado: null
      });
    }

    vehiculo.eliminado = true;
    vehiculo.operador_actual = null;
    await vehiculo.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'eliminar_vehiculo',
      'admin',
      req.admin.nombre,
      `Eliminó vehículo ${vehiculo.numero_economico} (${vehiculo.placa})`
    );

    res.json({ 
      message: 'Vehículo eliminado exitosamente' 
    });

  } catch (error) {
    console.error('Error en deleteVehiculo:', error);
    res.status(500).json({ 
      message: 'Error al eliminar vehículo',
      error: error.message 
    });
  }
};

// ===== CONFIGURAR NEUMÁTICOS =====
export const configurarNeumaticos = async (req, res) => {
  try {
    const { id } = req.params;
    const { ejes } = req.body;

    if (!ejes || !Array.isArray(ejes)) {
      return res.status(400).json({ 
        message: 'Se requiere un array de ejes con la configuración' 
      });
    }

    const vehiculo = await Vehiculo.findById(id);

    if (!vehiculo || vehiculo.eliminado) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    // Usar el método del modelo
    vehiculo.configurarNeumaticos({ ejes });
    await vehiculo.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_vehiculo',
      'admin',
      req.admin.nombre,
      `Configuró neumáticos del vehículo ${vehiculo.numero_economico}`
    );

    res.json({
      message: 'Neumáticos configurados exitosamente',
      configuracion_neumaticos: vehiculo.configuracion_neumaticos
    });

  } catch (error) {
    console.error('Error en configurarNeumaticos:', error);
    res.status(500).json({ 
      message: 'Error al configurar neumáticos',
      error: error.message 
    });
  }
};

// ===== ACTUALIZAR KILOMETRAJE =====
export const actualizarKilometraje = async (req, res) => {
  try {
    const { id } = req.params;
    const { kilometraje } = req.body;

    if (!kilometraje || kilometraje < 0) {
      return res.status(400).json({ 
        message: 'Kilometraje inválido' 
      });
    }

    const vehiculo = await Vehiculo.findById(id);

    if (!vehiculo || vehiculo.eliminado) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    const kmAnterior = vehiculo.kilometraje_actual;
    vehiculo.kilometraje_actual = kilometraje;
    await vehiculo.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_vehiculo',
      'admin',
      req.admin.nombre,
      `Actualizó kilometraje del vehículo ${vehiculo.numero_economico} de ${kmAnterior} km a ${kilometraje} km`
    );

    res.json({
      message: 'Kilometraje actualizado',
      kilometraje_actual: vehiculo.kilometraje_actual
    });

  } catch (error) {
    console.error('Error en actualizarKilometraje:', error);
    res.status(500).json({ 
      message: 'Error al actualizar kilometraje',
      error: error.message 
    });
  }
};

// ===== ACTUALIZAR HORAS DE MOTOR =====
export const actualizarHorasMotor = async (req, res) => {
  try {
    const { id } = req.params;
    const { horas } = req.body;

    if (!horas || horas < 0) {
      return res.status(400).json({ 
        message: 'Horas inválidas' 
      });
    }

    const vehiculo = await Vehiculo.findById(id);

    if (!vehiculo || vehiculo.eliminado) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    const horasAnterior = vehiculo.horas_motor_actual;
    vehiculo.horas_motor_actual = horas;
    await vehiculo.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_vehiculo',
      'admin',
      req.admin.nombre,
      `Actualizó horas motor del vehículo ${vehiculo.numero_economico} de ${horasAnterior} hrs a ${horas} hrs`
    );

    res.json({
      message: 'Horas de motor actualizadas',
      horas_motor_actual: vehiculo.horas_motor_actual
    });

  } catch (error) {
    console.error('Error en actualizarHorasMotor:', error);
    res.status(500).json({ 
      message: 'Error al actualizar horas de motor',
      error: error.message 
    });
  }
};

// ===== ASIGNAR OPERADOR =====
export const asignarOperador = async (req, res) => {
  try {
    const { id } = req.params;
    const { operador_id } = req.body;

    const vehiculo = await Vehiculo.findById(id);

    if (!vehiculo || vehiculo.eliminado) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    let operadorNombre = null;

    // 1. Si el vehículo ya tenía un operador asignado, quitarle la relación
    if (vehiculo.operador_actual) {
      await User.findByIdAndUpdate(vehiculo.operador_actual, {
        vehiculoAsignado: null
      });
    }

    // 2. Si se está asignando un nuevo operador (no null)
    if (operador_id) {
      // Verificar que el operador existe
      const operador = await User.findById(operador_id);
      if (!operador) {
        return res.status(404).json({ message: 'Operador no encontrado' });
      }

      operadorNombre = operador.nombre;

      // 3. Si el operador ya tenía un vehículo asignado, quitarle la relación
      if (operador.vehiculoAsignado) {
        await Vehiculo.findByIdAndUpdate(operador.vehiculoAsignado, {
          operador_actual: null
        });
      }

      // 4. Asignar operador al vehículo
      vehiculo.operador_actual = operador_id;
      await vehiculo.save();

      // 5. Asignar vehículo al operador
      await User.findByIdAndUpdate(operador_id, {
        vehiculoAsignado: vehiculo._id
      });

      // ⭐ REGISTRAR ACTIVIDAD - ASIGNACIÓN
      await registrarActividad(
        'actualizar_vehiculo',
        'admin',
        req.admin.nombre,
        `Asignó operador ${operadorNombre} al vehículo ${vehiculo.numero_economico}`
      );
    } else {
      // 6. Si operador_id es null, solo desasignar
      vehiculo.operador_actual = null;
      await vehiculo.save();

      // ⭐ REGISTRAR ACTIVIDAD - DESASIGNACIÓN
      await registrarActividad(
        'actualizar_vehiculo',
        'admin',
        req.admin.nombre,
        `Removió operador del vehículo ${vehiculo.numero_economico}`
      );
    }

    // Populate y transformar respuesta
    await vehiculo.populate('operador_actual', 'nombre username');
    
    const vehiculoTransformado = {
      ...vehiculo.toObject(),
      numeroEconomico: vehiculo.numero_economico,
      tipoVehiculo: vehiculo.tipo_vehiculo,
      sedeActual: vehiculo.sede_actual,
      operadorActual: vehiculo.operador_actual,
      kilometrajeActual: vehiculo.kilometraje_actual,
      horasMotorActual: vehiculo.horas_motor_actual,
      tipoCombustible: vehiculo.tipo_combustible,
      capacidadTanque: vehiculo.capacidad_tanque,
      rendimientoPromedio: vehiculo.rendimiento_promedio,
      configuracionNeumaticos: vehiculo.configuracion_neumaticos
    };

    res.json({
      message: operador_id ? 'Operador asignado' : 'Operador removido',
      vehiculo: vehiculoTransformado
    });

  } catch (error) {
    console.error('Error en asignarOperador:', error);
    res.status(500).json({ 
      message: 'Error al asignar operador',
      error: error.message 
    });
  }
};

// ===== CAMBIAR DISPONIBILIDAD =====
export const cambiarDisponibilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { disponibilidad } = req.body;

    const estadosValidos = ['disponible', 'en_servicio', 'mantenimiento', 'fuera_servicio'];
    
    if (!estadosValidos.includes(disponibilidad)) {
      return res.status(400).json({ 
        message: 'Estado de disponibilidad inválido' 
      });
    }

    const vehiculo = await Vehiculo.findById(id);

    if (!vehiculo || vehiculo.eliminado) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    const estadoAnterior = vehiculo.disponibilidad;
    vehiculo.disponibilidad = disponibilidad;
    await vehiculo.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_vehiculo',
      'admin',
      req.admin.nombre,
      `Cambió disponibilidad del vehículo ${vehiculo.numero_economico} de "${estadoAnterior}" a "${disponibilidad}"`
    );

    res.json({
      message: 'Disponibilidad actualizada',
      disponibilidad: vehiculo.disponibilidad
    });

  } catch (error) {
    console.error('Error en cambiarDisponibilidad:', error);
    res.status(500).json({ 
      message: 'Error al cambiar disponibilidad',
      error: error.message 
    });
  }
};

// ===== OBTENER ESTADÍSTICAS =====
export const getEstadisticas = async (req, res) => {
  try {
    const total = await Vehiculo.countDocuments({ eliminado: false });
    
    const porTipo = await Vehiculo.aggregate([
      { $match: { eliminado: false } },
      { $group: { _id: '$tipo_vehiculo', count: { $sum: 1 } } }
    ]);

    const porDisponibilidad = await Vehiculo.aggregate([
      { $match: { eliminado: false } },
      { $group: { _id: '$disponibilidad', count: { $sum: 1 } } }
    ]);

    res.json({
      total,
      por_tipo: porTipo,
      por_disponibilidad: porDisponibilidad
    });

  } catch (error) {
    console.error('Error en getEstadisticas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas',
      error: error.message 
    });
  }
};