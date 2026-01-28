import User from '../models/user.js';
import Vehiculo from '../models/vehiculo.js';
import bcrypt from 'bcryptjs';
import registrarActividad from '../utils/activityLogger.js'; // ⭐ NUEVO IMPORT

// ==========================================
// CRUD OPERADORES (Admin)
// ==========================================

// @desc    Listar todos los operadores
// @route   GET /api/users/operadores
// @access  Admin
export const getOperadores = async (req, res) => {
  try {
    const { sedeId, activo, vehiculoAsignado } = req.query;
    
    let filtros = { rol: 'operador' };
    
    if (sedeId) filtros.sedeActual = sedeId;
    if (activo !== undefined) filtros.activo = activo === 'true';
    if (vehiculoAsignado === 'sin_asignar') filtros.vehiculoAsignado = null;
    if (vehiculoAsignado === 'asignado') filtros.vehiculoAsignado = { $ne: null };
    
    const operadores = await User.find(filtros)
      .populate('sedeActual', 'nombre ciudad')
      .populate('vehiculoAsignado', 'numeroEconomico placa tipo')
      .select('-password')
      .sort({ nombre: 1 });
    
    res.json({
      success: true,
      count: operadores.length,
      data: operadores
    });
  } catch (error) {
    console.error('Error en getOperadores:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al obtener operadores',
      error: error.message 
    });
  }
};

// @desc    Obtener un operador por ID
// @route   GET /api/users/operadores/:id
// @access  Admin
export const getOperadorById = async (req, res) => {
  try {
    const operador = await User.findOne({ 
      _id: req.params.id, 
      rol: 'operador' 
    })
      .populate('sedeActual')
      .populate('vehiculoAsignado')
      .populate('historialSedes.sede', 'nombre ciudad')
      .select('-password');
    
    if (!operador) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Operador no encontrado' 
      });
    }
    
    res.json({
      success: true,
      data: operador
    });
  } catch (error) {
    console.error('Error en getOperadorById:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al obtener operador',
      error: error.message 
    });
  }
};

// @desc    Crear nuevo operador
// @route   POST /api/users/operadores
// @access  Admin
export const createOperador = async (req, res) => {
  try {
    const { username, password, nombre, sedeActual, vehiculoAsignado } = req.body;
    
    // Validar campos requeridos
    if (!username || !password || !nombre || !sedeActual) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Username, password, nombre y sede son requeridos' 
      });
    }
    
    // Verificar si el username ya existe
    const existeUser = await User.findOne({ username });
    if (existeUser) {
      return res.status(400).json({ 
        success: false, 
        msg: 'El username ya está en uso' 
      });
    }
    
    // Si se asigna vehículo, verificar disponibilidad
    if (vehiculoAsignado) {
      const vehiculo = await Vehiculo.findById(vehiculoAsignado);
      if (!vehiculo) {
        return res.status(404).json({ 
          success: false, 
          msg: 'Vehículo no encontrado' 
        });
      }

      // Si el vehículo ya tiene operador, desvincularlo
      if (vehiculo.operador_actual) {
        await User.findByIdAndUpdate(vehiculo.operador_actual, {
          vehiculoAsignado: null
        });
      }
      
      // Verificar que no esté asignado a otro operador (doble check)
      const vehiculoOcupado = await User.findOne({ 
        vehiculoAsignado, 
        activo: true
      });
      
      if (vehiculoOcupado) {
        return res.status(400).json({ 
          success: false, 
          msg: 'Este vehículo ya está asignado a otro operador activo' 
        });
      }
    }
    
    // Hashear password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear operador
    const operador = await User.create({
      username,
      password: hashedPassword,
      nombre,
      rol: 'operador',
      sedeActual,
      vehiculoAsignado: vehiculoAsignado || null,
      historialSedes: [{
        sede: sedeActual,
        fechaAsignacion: new Date()
      }]
    });
    
    // Actualizar vehículo con operador asignado (si aplica)
    if (vehiculoAsignado) {
      await Vehiculo.findByIdAndUpdate(vehiculoAsignado, {
        operador_actual: operador._id
      });
    }

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'crear_operador',
      'admin',
      req.admin.nombre,
      `Creó operador ${nombre}`
    );
    
    // Obtener operador creado con populate
    const operadorCreado = await User.findById(operador._id)
      .populate('sedeActual', 'nombre ciudad')
      .populate('vehiculoAsignado', 'numero_economico placa tipo_vehiculo')
      .select('-password');
    
    res.status(201).json({
      success: true,
      msg: 'Operador creado exitosamente',
      data: operadorCreado
    });
  } catch (error) {
    console.error('Error en createOperador:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al crear operador',
      error: error.message 
    });
  }
};

// @desc    Actualizar operador
// @route   PUT /api/users/operadores/:id
// @access  Admin
export const updateOperador = async (req, res) => {
  try {
    const { nombre, username, sedeActual, activo } = req.body;
    
    const operador = await User.findOne({ 
      _id: req.params.id, 
      rol: 'operador' 
    });
    
    if (!operador) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Operador no encontrado' 
      });
    }
    
    // Verificar username único (si se está cambiando)
    if (username && username !== operador.username) {
      const existeUsername = await User.findOne({ username });
      if (existeUsername) {
        return res.status(400).json({ 
          success: false, 
          msg: 'El username ya está en uso' 
        });
      }
      operador.username = username;
    }
    
    // Actualizar campos
    if (nombre) operador.nombre = nombre;
    if (activo !== undefined) operador.activo = activo;
    
    // Si cambia de sede, actualizar historial
    if (sedeActual && sedeActual !== operador.sedeActual.toString()) {
      await operador.cambiarSede(sedeActual);
    }
    
    await operador.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_operador',
      'admin',
      req.admin.nombre,
      `Actualizó datos del operador ${operador.nombre}`
    );
    
    const operadorActualizado = await User.findById(operador._id)
      .populate('sedeActual', 'nombre ciudad')
      .populate('vehiculoAsignado', 'numeroEconomico placa tipo')
      .select('-password');
    
    res.json({
      success: true,
      msg: 'Operador actualizado exitosamente',
      data: operadorActualizado
    });
  } catch (error) {
    console.error('Error en updateOperador:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al actualizar operador',
      error: error.message 
    });
  }
};

// @desc    Asignar/Reasignar vehículo a operador
// @route   PUT /api/users/operadores/:id/asignar-vehiculo
// @access  Admin
export const asignarVehiculo = async (req, res) => {
  try {
    const { vehiculoId } = req.body;
    
    const operador = await User.findOne({ 
      _id: req.params.id, 
      rol: 'operador' 
    });
    
    if (!operador) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Operador no encontrado' 
      });
    }
    
    let vehiculoPlaca = null; // Para el registro de actividad
    
    // 1. Si el operador ya tenía un vehículo asignado, quitarle la relación
    if (operador.vehiculoAsignado) {
      await Vehiculo.findByIdAndUpdate(operador.vehiculoAsignado, {
        operador_actual: null  // Desvincular el vehículo anterior
      });
    }
    
    // 2. Si se está asignando un nuevo vehículo (no null)
    if (vehiculoId) {
      // Verificar que el vehículo existe
      const vehiculo = await Vehiculo.findById(vehiculoId);
      if (!vehiculo) {
        return res.status(404).json({ 
          success: false, 
          msg: 'Vehículo no encontrado' 
        });
      }

      vehiculoPlaca = vehiculo.placa; // Guardar para la actividad
      
      // 3. Si el vehículo ya tenía un operador asignado, quitarle la relación
      if (vehiculo.operador_actual) {
        await User.findByIdAndUpdate(vehiculo.operador_actual, {
          vehiculoAsignado: null  // Desvincular el operador anterior del vehículo
        });
      }
      
      // 4. Verificar que no esté asignado a otro operador activo (doble check)
      const operadorConVehiculo = await User.findOne({ 
        vehiculoAsignado: vehiculoId, 
        activo: true,
        _id: { $ne: req.params.id }
      });
      
      if (operadorConVehiculo) {
        return res.status(400).json({ 
          success: false, 
          msg: `Este vehículo ya está asignado a ${operadorConVehiculo.nombre}` 
        });
      }
      
      // 5. Asignar vehículo al operador
      operador.vehiculoAsignado = vehiculoId;
      await operador.save();
      
      // 6. Asignar operador al vehículo
      await Vehiculo.findByIdAndUpdate(vehiculoId, {
        operador_actual: operador._id
      });

      // ⭐ REGISTRAR ACTIVIDAD - ASIGNACIÓN
      await registrarActividad(
        'actualizar_operador',
        'admin',
        req.admin.nombre,
        `Asignó vehículo ${vehiculoPlaca} al operador ${operador.nombre}`
      );
    } else {
      // 7. Si vehiculoId es null, solo desasignar
      operador.vehiculoAsignado = null;
      await operador.save();

      // ⭐ REGISTRAR ACTIVIDAD - DESASIGNACIÓN
      await registrarActividad(
        'actualizar_operador',
        'admin',
        req.admin.nombre,
        `Removió vehículo asignado del operador ${operador.nombre}`
      );
    }
    
    const operadorActualizado = await User.findById(operador._id)
      .populate('sedeActual', 'nombre ciudad')
      .populate('vehiculoAsignado', 'numero_economico placa tipo_vehiculo')
      .select('-password');
    
    res.json({
      success: true,
      msg: vehiculoId ? 'Vehículo asignado exitosamente' : 'Vehículo desasignado exitosamente',
      data: operadorActualizado
    });
  } catch (error) {
    console.error('Error en asignarVehiculo:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al asignar vehículo',
      error: error.message 
    });
  }
};

// @desc    Desactivar operador (soft delete)
// @route   DELETE /api/users/operadores/:id
// @access  Admin
export const deleteOperador = async (req, res) => {
  try {
    const operador = await User.findOne({ 
      _id: req.params.id, 
      rol: 'operador' 
    });
    
    if (!operador) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Operador no encontrado' 
      });
    }
    
    // Desasignar vehículo si tiene (sincronizar ambos lados)
    if (operador.vehiculoAsignado) {
      await Vehiculo.findByIdAndUpdate(operador.vehiculoAsignado, {
        operador_actual: null
      });
    }
    
    // Desactivar operador
    operador.activo = false;
    operador.vehiculoAsignado = null;
    await operador.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'eliminar_operador',
      'admin',
      req.admin.nombre,
      `Desactivó operador ${operador.nombre}`
    );
    
    res.json({
      success: true,
      msg: 'Operador desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteOperador:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al desactivar operador',
      error: error.message 
    });
  }
};

// @desc    Cambiar contraseña de operador
// @route   PUT /api/users/operadores/:id/cambiar-password
// @access  Admin
export const cambiarPasswordOperador = async (req, res) => {
  try {
    const { nuevaPassword } = req.body;
    
    if (!nuevaPassword || nuevaPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        msg: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }
    
    const operador = await User.findOne({ 
      _id: req.params.id, 
      rol: 'operador' 
    }).select('+password');
    
    if (!operador) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Operador no encontrado' 
      });
    }
    
    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    operador.password = await bcrypt.hash(nuevaPassword, salt);
    await operador.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_operador',
      'admin',
      req.admin.nombre,
      `Cambió contraseña del operador ${operador.nombre}`
    );
    
    res.json({
      success: true,
      msg: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error en cambiarPasswordOperador:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al cambiar contraseña',
      error: error.message 
    });
  }
};