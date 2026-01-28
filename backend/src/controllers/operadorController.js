// src/controllers/operadorController.js

import User from '../models/user.js';
import Vehiculo from '../models/vehiculo.js';
import Revision from '../models/revision.js';
import TipoRevision from '../models/tipoRevision.js';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import registrarActividad from '../utils/activityLogger.js'; // ⭐ NUEVO IMPORT

// ==========================================
// GET MI VEHÍCULO ASIGNADO
// ==========================================

// @desc    Obtener vehículo asignado al operador
// @route   GET /api/operador/mi-vehiculo
// @access  Private (Operador)
export const getMiVehiculo = async (req, res) => {
  try {
    const operador = await User.findById(req.operador._id)
      .populate({
        path: 'vehiculoAsignado',
        populate: {
          path: 'sede_actual',
          select: 'nombre ciudad'
        }
      });

    if (!operador.vehiculoAsignado) {
      return res.status(404).json({
        success: false,
        message: 'No tienes un vehículo asignado'
      });
    }

    // Transformar a camelCase
    const vehiculo = operador.vehiculoAsignado.toObject();
    const vehiculoTransformado = {
      _id: vehiculo._id,
      placa: vehiculo.placa,
      numeroEconomico: vehiculo.numero_economico,
      tipoVehiculo: vehiculo.tipo_vehiculo,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      year: vehiculo.year,
      sedeActual: vehiculo.sede_actual,
      disponibilidad: vehiculo.disponibilidad,
      kilometrajeActual: vehiculo.kilometraje_actual,
      horasMotorActual: vehiculo.horas_motor_actual,
      tipoCombustible: vehiculo.tipo_combustible,
      configuracionNeumaticos: vehiculo.configuracion_neumaticos
    };

    res.json({
      success: true,
      vehiculo: vehiculoTransformado
    });

  } catch (error) {
    console.error('Error en getMiVehiculo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener vehículo',
      error: error.message
    });
  }
};

// ==========================================
// GET REVISIONES PENDIENTES
// ==========================================

// @desc    Calcular revisiones pendientes del operador
// @route   GET /api/operador/revisiones-pendientes
// @access  Private (Operador)
export const getRevisionesPendientes = async (req, res) => {
  try {
    const operador = await User.findById(req.operador._id).populate('vehiculoAsignado');

    if (!operador.vehiculoAsignado) {
      return res.json({
        success: true,
        pendientes: [],
        message: 'No tienes un vehículo asignado'
      });
    }

    const vehiculoId = operador.vehiculoAsignado._id;
    const hoy = new Date();
    const pendientes = [];

    // ===== REVISIÓN DIARIA =====
    const revisionHoy = await Revision.findOne({
      vehiculo: vehiculoId,
      frecuencia: 'diaria',
      fecha: {
        $gte: startOfDay(hoy),
        $lte: endOfDay(hoy)
      }
    });

    if (!revisionHoy) {
      const tipoDiaria = await TipoRevision.findOne({
        tipo_vehiculo: operador.vehiculoAsignado.tipo_vehiculo,
        frecuencia: 'diaria',
        activo: true
      });

      pendientes.push({
        tipo: 'diaria',
        titulo: 'Revisión Diaria',
        descripcion: 'Revisión diaria del vehículo',
        urgente: true,
        tipoRevisionId: tipoDiaria?._id || null,
        vencimiento: endOfDay(hoy)
      });
    }

    // ===== REVISIÓN MENSUAL =====
    const inicioMes = startOfMonth(hoy);
    const finMes = endOfMonth(hoy);

    const revisionMensual = await Revision.findOne({
      vehiculo: vehiculoId,
      frecuencia: 'mensual',
      fecha: {
        $gte: inicioMes,
        $lte: finMes
      }
    });

    if (!revisionMensual) {
      const tipoMensual = await TipoRevision.findOne({
        tipo_vehiculo: operador.vehiculoAsignado.tipo_vehiculo,
        frecuencia: 'mensual',
        activo: true
      });

      const diasRestantes = Math.ceil((finMes - hoy) / (1000 * 60 * 60 * 24));

      pendientes.push({
        tipo: 'mensual',
        titulo: 'Revisión Mensual',
        descripcion: `Revisión mensual - Vence en ${diasRestantes} días`,
        urgente: diasRestantes <= 5,
        tipoRevisionId: tipoMensual?._id || null,
        vencimiento: finMes
      });
    }

    // ===== REVISIÓN BIMESTRAL =====
    const dosMesesAtras = subMonths(hoy, 2);
    const revisionBimestral = await Revision.findOne({
      vehiculo: vehiculoId,
      frecuencia: 'bimestral',
      fecha: { $gte: dosMesesAtras }
    });

    if (!revisionBimestral) {
      const tipoBimestral = await TipoRevision.findOne({
        tipo_vehiculo: operador.vehiculoAsignado.tipo_vehiculo,
        frecuencia: 'bimestral',
        activo: true
      });

      pendientes.push({
        tipo: 'bimestral',
        titulo: 'Revisión Bimestral',
        descripcion: 'Revisión cada 2 meses',
        urgente: false,
        tipoRevisionId: tipoBimestral?._id || null,
        vencimiento: null
      });
    }

    res.json({
      success: true,
      pendientes,
      total: pendientes.length
    });

  } catch (error) {
    console.error('Error en getRevisionesPendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener revisiones pendientes',
      error: error.message
    });
  }
};

// ==========================================
// CREAR NUEVA REVISIÓN (ACTUALIZADO)
// ==========================================

// @desc    Crear nueva revisión desde operador
// @route   POST /api/operador/revisiones
// @access  Private (Operador)
export const crearRevision = async (req, res) => {
  try {
    console.log("========================================");
    console.log("📥 POST /api/operador/revisiones");
    console.log("📦 Body completo:", JSON.stringify(req.body, null, 2));

    const { 
      tipoRevisionId, 
      datosOperacionales, 
      items, 
      neumaticos, 
      comentariosSecciones,      // 🆕 NUEVO
      comentariosNeumaticos,     // 🆕 NUEVO
      comentarios 
    } = req.body;

    console.log("🔍 Campos extraídos:");
    console.log("  - tipoRevisionId:", tipoRevisionId);
    console.log("  - nivel_combustible:", datosOperacionales?.nivel_combustible);
    console.log("  - kilometraje:", datosOperacionales?.kilometraje);
    console.log("  - horas:", datosOperacionales?.horas_motor);
    console.log("  - items count:", items?.length);
    console.log("  - neumaticos count:", neumaticos?.length);
    console.log("  - comentariosSecciones count:", comentariosSecciones?.length);
    console.log("  - comentariosNeumaticos:", comentariosNeumaticos ? 'SI' : 'NO');

    // Validaciones
    if (!tipoRevisionId) {
      return res.status(400).json({
        success: false,
        message: 'tipoRevisionId es requerido'
      });
    }

    if (!datosOperacionales?.nivel_combustible) {
      return res.status(400).json({
        success: false,
        message: 'nivel_combustible es requerido'
      });
    }

    if (datosOperacionales?.kilometraje === undefined || datosOperacionales?.kilometraje === null) {
      return res.status(400).json({
        success: false,
        message: 'kilometraje es requerido'
      });
    }

    if (datosOperacionales?.horas_motor === undefined || datosOperacionales?.horas_motor === null) {
      return res.status(400).json({
        success: false,
        message: 'horas_motor es requerido'
      });
    }

    console.log("✅ Validaciones básicas pasadas");

    // Obtener operador con populate
    const operador = await User.findById(req.operador._id)
      .populate('vehiculoAsignado')
      .populate('sedeActual');

    if (!operador.vehiculoAsignado) {
      return res.status(400).json({
        success: false,
        message: 'No tienes un vehículo asignado'
      });
    }

    console.log("✅ Operador encontrado:", operador.nombre);

    // Obtener tipo de revisión CON SECCIONES
    const tipoRevision = await TipoRevision.findById(tipoRevisionId);
    if (!tipoRevision) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de revisión no encontrado'
      });
    }

    console.log("✅ Tipo de revisión encontrado:", tipoRevision.nombre);
    console.log("📋 Secciones encontradas:", tipoRevision.secciones?.length || 0);

    // Obtener vehículo completo
    const vehiculo = await Vehiculo.findById(operador.vehiculoAsignado._id)
      .populate('sede_actual');

    console.log("✅ Vehículo encontrado:", vehiculo.placa);

    // Aplanar preguntas con información de sección
    const preguntasConSeccion = [];
    if (tipoRevision.secciones && tipoRevision.secciones.length > 0) {
      tipoRevision.secciones.forEach(seccion => {
        if (seccion.preguntas && seccion.preguntas.length > 0) {
          seccion.preguntas.forEach(pregunta => {
            preguntasConSeccion.push({
              numero: pregunta.numero,
              texto: pregunta.texto,
              seccion_nombre: seccion.nombre,
              seccion_orden: seccion.orden
            });
          });
        }
      });
    }

    console.log("📝 Preguntas con sección mapeadas:", preguntasConSeccion.length);

    // Transformar items a respuestas CON INFO DE SECCIÓN
    const respuestasTransformadas = items?.map((item, index) => {
      const preguntaInfo = preguntasConSeccion.find(p => 
        p.numero === item.numero || p.texto === item.nombre
      );

      if (!preguntaInfo) {
        console.warn(`⚠️ No se encontró info de sección para pregunta #${item.numero || index + 1}: ${item.nombre}`);
      }

      return {
        numero: item.numero || (index + 1),
        texto_pregunta: item.nombre,
        respuesta: item.estado === 'bien' ? 'Bien' : 'Mal',
        seccion_nombre: preguntaInfo?.seccion_nombre || 'Sin sección',
        seccion_orden: preguntaInfo?.seccion_orden || 0,
        observaciones: item.observaciones || ''
      };
    }) || [];

    console.log("📝 Respuestas transformadas con secciones:", respuestasTransformadas.length);

    // 🆕 Transformar neumaticos CON NUEVOS CAMPOS
    const llantasTransformadas = neumaticos?.map((neumatico, index) => {
      // Validar que vengan los nuevos campos
      if (neumatico.presion_medida === undefined || neumatico.callo_medida === undefined) {
        console.warn(`⚠️ Neumático ${index + 1} sin medidas numéricas`);
      }

      return {
        eje_numero: neumatico.eje_numero || neumatico.eje,
        posicion: neumatico.posicion || (index + 1),
        lado: neumatico.lado,
        
        // 🆕 Nuevos campos con medidas
        presion_medida: Number(neumatico.presion_medida) || 0,
        presion_estado: neumatico.presion_estado || 'Bien',
        callo_medida: Number(neumatico.callo_medida) || 0,
        callo_estado: neumatico.callo_estado || 'Bien',
        
        // ⚠️ Retrocompatibilidad (opcional)
        presion: neumatico.presion,
        estado: neumatico.estado
      };
    }) || [];

    console.log("🛞 Llantas transformadas:", llantasTransformadas.length);

    // 🆕 Transformar comentarios de secciones
    const comentariosSeccionesTransformados = comentariosSecciones?.map(cs => ({
      seccion_nombre: cs.seccion_nombre,
      seccion_orden: cs.seccion_orden,
      comentario: cs.comentario || ''
    })) || [];

    console.log("💬 Comentarios de secciones:", comentariosSeccionesTransformados.length);

    // Análisis de problemas
    const items_mal = respuestasTransformadas.filter(r => r.respuesta === 'Mal');
    const llantas_mal = llantasTransformadas.filter(l => 
      l.presion_estado === 'Mal' || l.callo_estado === 'Mal'
    );
    const tiene_problemas = items_mal.length > 0 || llantas_mal.length > 0;

    console.log("📊 Análisis:");
    console.log("  - Items mal:", items_mal.length);
    console.log("  - Llantas mal:", llantas_mal.length);
    console.log("  - Tiene problemas:", tiene_problemas);

    // Estado
    let estado = 'completada';
    if (tiene_problemas) {
      estado = 'pendiente_revision';
    }

    // Crear la revisión
    const nuevaRevision = new Revision({
      // Relaciones
      vehiculo: vehiculo._id,
      tipo_revision: tipoRevisionId,

      // Datos desnormalizados del vehículo (snapshot)
      tipo_vehiculo: vehiculo.tipo_vehiculo,
      placa: vehiculo.placa,
      numero_economico: vehiculo.numero_economico,

      // Frecuencia
      frecuencia: tipoRevision.frecuencia,

      // Operador
      operador: {
        user_id: operador._id,
        nombre: operador.nombre,
        licencia_vigente: true
      },

      // Datos operacionales
      nivel_combustible: datosOperacionales.nivel_combustible,
      kilometraje_al_momento: Number(datosOperacionales.kilometraje) || 0,
      horas_motor_al_momento: Number(datosOperacionales.horas_motor) || 0,

      // Respuestas y llantas
      respuestas: respuestasTransformadas,
      llantas: llantasTransformadas,

      // 🆕 COMENTARIOS (3 tipos)
      comentarios_secciones: comentariosSeccionesTransformados,
      comentarios_neumaticos: comentariosNeumaticos || '',
      comentarios: comentarios || '',

      // Items/Llantas con problemas
      items_mal: items_mal.map(item => ({
        numero: item.numero,
        texto: item.texto_pregunta,
        seccion_nombre: item.seccion_nombre,
        seccion_orden: item.seccion_orden
      })),
      llantas_mal: llantas_mal.map(llanta => ({
        posicion: llanta.posicion,
        problema: llanta.presion_estado === 'Mal' ? 'presion_estado' : 'callo_estado'
      })),

      // Estado
      tiene_problemas: tiene_problemas,
      estado: estado,

      // Fecha
      fecha: new Date()
    });

    console.log("💾 Objeto revisión a guardar:");
    console.log("  - placa:", nuevaRevision.placa);
    console.log("  - nivel_combustible:", nuevaRevision.nivel_combustible);
    console.log("  - kilometraje:", nuevaRevision.kilometraje_al_momento);
    console.log("  - horas:", nuevaRevision.horas_motor_al_momento);
    console.log("  - respuestas count:", nuevaRevision.respuestas.length);
    console.log("  - llantas count:", nuevaRevision.llantas.length);
    console.log("  - comentarios_secciones count:", nuevaRevision.comentarios_secciones.length);
    console.log("  - estado:", nuevaRevision.estado);

    const revisionGuardada = await nuevaRevision.save();
    console.log("✅ Revisión guardada con ID:", revisionGuardada._id);

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'crear_revision',
      'operador',
      req.operador.nombre,
      `Creó revisión ${tipoRevision.frecuencia} para vehículo ${vehiculo.placa}`
    );

    console.log("========================================");

    res.status(201).json({
      success: true,
      message: tiene_problemas 
        ? 'Revisión creada. Requiere aprobación del jefe de mantenimiento.'
        : 'Revisión completada y aprobada automáticamente',
      revision: revisionGuardada
    });

  } catch (error) {
    console.error('❌ Error en crearRevision:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al crear revisión',
      error: error.message
    });
  }
};

// ==========================================
// ACTUALIZAR DATOS OPERACIONALES DEL VEHÍCULO
// ==========================================

// @desc    Actualizar kilometraje y horas motor del vehículo asignado
// @route   PUT /api/operador/mi-vehiculo/actualizar-datos
// @access  Private (Operador)
export const actualizarDatosVehiculo = async (req, res) => {
  try {
    const { kilometraje, horasMotor } = req.body;

    const operador = await User.findById(req.operador._id).populate('vehiculoAsignado');

    if (!operador.vehiculoAsignado) {
      return res.status(404).json({
        success: false,
        message: 'No tienes un vehículo asignado'
      });
    }

    // Validaciones
    if (kilometraje !== undefined && kilometraje < 0) {
      return res.status(400).json({
        success: false,
        message: 'El kilometraje no puede ser negativo'
      });
    }

    if (horasMotor !== undefined && horasMotor < 0) {
      return res.status(400).json({
        success: false,
        message: 'Las horas del motor no pueden ser negativas'
      });
    }

    // Actualizar solo los campos permitidos
    const updateData = {};
    if (kilometraje !== undefined) updateData.kilometraje_actual = kilometraje;
    if (horasMotor !== undefined) updateData.horas_motor_actual = horasMotor;

    const vehiculoActualizado = await Vehiculo.findByIdAndUpdate(
      operador.vehiculoAsignado._id,
      updateData,
      { new: true, runValidators: true }
    ).populate('sede_actual', 'nombre ciudad');

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_vehiculo',
      'operador',
      req.operador.nombre,
      `Actualizó datos operacionales del vehículo ${vehiculoActualizado.placa}`
    );

    // Transformar a camelCase
    const vehiculoTransformado = {
      _id: vehiculoActualizado._id,
      placa: vehiculoActualizado.placa,
      numeroEconomico: vehiculoActualizado.numero_economico,
      tipoVehiculo: vehiculoActualizado.tipo_vehiculo,
      marca: vehiculoActualizado.marca,
      modelo: vehiculoActualizado.modelo,
      year: vehiculoActualizado.year,
      sedeActual: vehiculoActualizado.sede_actual,
      disponibilidad: vehiculoActualizado.disponibilidad,
      kilometrajeActual: vehiculoActualizado.kilometraje_actual,
      horasMotorActual: vehiculoActualizado.horas_motor_actual,
      tipoCombustible: vehiculoActualizado.tipo_combustible,
      capacidadTanque: vehiculoActualizado.capacidad_tanque,
      rendimientoPromedio: vehiculoActualizado.rendimiento_promedio,
      configuracionNeumaticos: vehiculoActualizado.configuracion_neumaticos
    };

    res.json({
      success: true,
      message: 'Datos actualizados correctamente',
      vehiculo: vehiculoTransformado
    });

  } catch (error) {
    console.error('Error en actualizarDatosVehiculo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar datos del vehículo',
      error: error.message
    });
  }
};

// ==========================================
// GET TIPO DE REVISIÓN
// ==========================================

// @desc    Obtener tipo de revisión por ID
// @route   GET /api/operador/tipos-revision/:id
// @access  Private (Operador)
export const getTipoRevision = async (req, res) => {
  try {
    const { id } = req.params;

    const tipoRevision = await TipoRevision.findById(id);

    if (!tipoRevision) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de revisión no encontrado'
      });
    }

    if (!tipoRevision.activo) {
      return res.status(400).json({
        success: false,
        message: 'Este tipo de revisión no está activo'
      });
    }

    res.json({
      success: true,
      tipoRevision
    });

  } catch (error) {
    console.error('Error en getTipoRevision:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipo de revisión',
      error: error.message
    });
  }
};

// ==========================================
// GET MIS REVISIONES
// ==========================================

// @desc    Obtener historial de revisiones del operador
// @route   GET /api/operador/mis-revisiones
// @access  Private (Operador)
export const getMisRevisiones = async (req, res) => {
  try {
    const { frecuencia, page = 1, limit = 10 } = req.query;

    const operador = await User.findById(req.operador._id).populate('vehiculoAsignado');

    if (!operador.vehiculoAsignado) {
      return res.json({
        success: true,
        revisiones: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          pages: 0,
          limit: parseInt(limit)
        }
      });
    }

    // Construir query
    const query = {
      vehiculo: operador.vehiculoAsignado._id,
      'operador.user_id': operador._id
    };

    // Filtro por frecuencia
    if (frecuencia) {
      query.frecuencia = frecuencia;
    }

    // Contar total
    const total = await Revision.countDocuments(query);

    // Obtener revisiones con paginación
    const revisiones = await Revision.find(query)
      .populate('tipo_revision', 'nombre')
      .sort({ fecha: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      revisiones,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error en getMisRevisiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener revisiones',
      error: error.message
    });
  }
};

// ==========================================
// GET DETALLE DE REVISIÓN
// ==========================================

// @desc    Obtener detalle de una revisión específica
// @route   GET /api/operador/revisiones/:id
// @access  Private (Operador)
export const getRevisionDetalle = async (req, res) => {
  try {
    const { id } = req.params;

    const revision = await Revision.findById(id)
      .populate('tipo_revision', 'nombre frecuencia')
      .populate('vehiculo', 'placa numero_economico marca modelo');

    if (!revision) {
      return res.status(404).json({
        success: false,
        message: 'Revisión no encontrada'
      });
    }

    // Verificar que la revisión pertenece al operador
    if (revision.operador.user_id.toString() !== req.operador._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta revisión'
      });
    }

    res.json({
      success: true,
      revision
    });

  } catch (error) {
    console.error('Error en getRevisionDetalle:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener revisión',
      error: error.message
    });
  }
};