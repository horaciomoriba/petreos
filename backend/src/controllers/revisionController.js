// src/controllers/revisionController.js

import Revision from '../models/revision.js';
import TipoRevision from '../models/tipoRevision.js';
import Vehiculo from '../models/vehiculo.js';
import Admin from '../models/admin.js'
import { generarPDFRevision } from '../utils/pdfGenerator.js';
import registrarActividad from '../utils/activityLogger.js'; // ⭐ NUEVO IMPORT
import path from 'path'; 
import fs from 'fs';      

// ===== OBTENER TODAS LAS REVISIONES =====
export const getRevisiones = async (req, res) => {
  try {
    const { 
      vehiculo,
      tipo_vehiculo,
      frecuencia,
      fecha_desde,
      fecha_hasta,
      tiene_problemas,
      estado,
      operador,
      page = 1,
      limit = 20
    } = req.query;

    const filtros = {};

    if (vehiculo) filtros.vehiculo = vehiculo;
    if (tipo_vehiculo) filtros.tipo_vehiculo = tipo_vehiculo;
    if (frecuencia) filtros.frecuencia = frecuencia;
    
    if (tiene_problemas !== undefined && tiene_problemas !== '' && tiene_problemas !== null) {
      filtros.tiene_problemas = tiene_problemas === 'true';
    }
    
    if (estado) filtros.estado = estado;
    if (operador) filtros['operador.user_id'] = operador;

    // Filtro por rango de fechas
    if (fecha_desde || fecha_hasta) {
      filtros.fecha = {};
      if (fecha_desde) filtros.fecha.$gte = new Date(fecha_desde);
      if (fecha_hasta) filtros.fecha.$lte = new Date(fecha_hasta);
    }

    const skip = (page - 1) * limit;

    const revisiones = await Revision.find(filtros)
      .populate('vehiculo', 'placa numero_economico marca modelo')
      .populate('tipo_revision', 'nombre codigo')
      .populate('operador.user_id', 'nombre email')
      .sort({ fecha: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Revision.countDocuments(filtros);

    res.json({
      revisiones,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error en getRevisiones:', error);
    res.status(500).json({ 
      message: 'Error al obtener revisiones',
      error: error.message 
    });
  }
};

// ===== OBTENER UNA REVISIÓN POR ID =====
export const getRevisionById = async (req, res) => {
  try {
    const { id } = req.params;

    const revision = await Revision.findById(id)
      .populate('vehiculo', 'placa numero_economico marca modelo tipo_vehiculo')
      .populate('tipo_revision')
      .populate('operador.user_id', 'nombre email telefono')
      .populate('firma_mecanico.user_id', 'nombre email');

    if (!revision) {
      return res.status(404).json({ message: 'Revisión no encontrada' });
    }

    res.json(revision);

  } catch (error) {
    console.error('Error en getRevisionById:', error);
    res.status(500).json({ 
      message: 'Error al obtener revisión',
      error: error.message 
    });
  }
};

// ===== OBTENER REVISIONES DE UN VEHÍCULO =====
export const getRevisionesPorVehiculo = async (req, res) => {
  try {
    const { vehiculo_id } = req.params;
    const { frecuencia, limit = 10 } = req.query;

    const filtros = { vehiculo: vehiculo_id };
    if (frecuencia) filtros.frecuencia = frecuencia;

    const revisiones = await Revision.find(filtros)
      .populate('tipo_revision', 'nombre codigo')
      .populate('operador.user_id', 'nombre')
      .sort({ fecha: -1 })
      .limit(parseInt(limit));

    res.json(revisiones);

  } catch (error) {
    console.error('Error en getRevisionesPorVehiculo:', error);
    res.status(500).json({ 
      message: 'Error al obtener revisiones del vehículo',
      error: error.message 
    });
  }
};

// ===== CREAR REVISIÓN (ACTUALIZADO CON NUEVOS CAMPOS) =====
export const createRevision = async (req, res) => {
  try {
    console.log("========================================");
    console.log("📥 POST /api/revisiones/admin");
    console.log("📦 Body completo:", JSON.stringify(req.body, null, 2));

    const {
      vehiculo_id,
      tipo_revision_id,
      operador,
      respuestas,
      llantas,
      comentarios_secciones,      // 🆕 NUEVO
      comentarios_neumaticos,     // 🆕 NUEVO
      comentarios,
      nivel_combustible,
      kilometraje_al_momento,
      horas_motor_al_momento
    } = req.body;

    console.log("🔍 Campos extraídos:");
    console.log("  - nivel_combustible:", nivel_combustible);
    console.log("  - kilometraje:", kilometraje_al_momento);
    console.log("  - horas:", horas_motor_al_momento);
    console.log("  - comentarios_secciones:", comentarios_secciones?.length);
    console.log("  - comentarios_neumaticos:", comentarios_neumaticos ? 'SI' : 'NO');

    // Validaciones
    if (!vehiculo_id) {
      return res.status(400).json({ message: 'vehiculo_id es requerido' });
    }
    if (!tipo_revision_id) {
      return res.status(400).json({ message: 'tipo_revision_id es requerido' });
    }
    if (!operador || !operador.user_id || !operador.nombre) {
      return res.status(400).json({ message: 'Datos del operador incompletos' });
    }
    if (!nivel_combustible) {
      return res.status(400).json({ message: 'nivel_combustible es requerido' });
    }
    if (kilometraje_al_momento === undefined || kilometraje_al_momento === null) {
      return res.status(400).json({ message: 'kilometraje_al_momento es requerido' });
    }
    if (horas_motor_al_momento === undefined || horas_motor_al_momento === null) {
      return res.status(400).json({ message: 'horas_motor_al_momento es requerido' });
    }

    console.log("✅ Validaciones pasadas");

    // Verificar vehículo
    const vehiculo = await Vehiculo.findById(vehiculo_id);
    if (!vehiculo) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }
    console.log("✅ Vehículo encontrado:", vehiculo.placa);

    // Verificar tipo de revisión CON SECCIONES
    const tipoRevision = await TipoRevision.findById(tipo_revision_id);
    if (!tipoRevision) {
      return res.status(404).json({ message: 'Tipo de revisión no encontrado' });
    }
    console.log("✅ Tipo de revisión encontrado:", tipoRevision.nombre);
    console.log("📋 Secciones encontradas:", tipoRevision.secciones?.length || 0);

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

    // Transformar respuestas para incluir info de sección
    let respuestasFinales = respuestas || [];
    
    if (respuestasFinales.length > 0 && !respuestasFinales[0].seccion_nombre) {
      console.log("⚠️ Respuestas no tienen info de sección, agregando...");
      respuestasFinales = respuestasFinales.map((resp, index) => {
        const preguntaInfo = preguntasConSeccion.find(p => 
          p.numero === resp.numero || p.texto === resp.texto_pregunta
        );

        if (!preguntaInfo) {
          console.warn(`⚠️ No se encontró info de sección para pregunta #${resp.numero || index + 1}`);
        }

        return {
          ...resp,
          seccion_nombre: preguntaInfo?.seccion_nombre || 'Sin sección',
          seccion_orden: preguntaInfo?.seccion_orden || 0
        };
      });
    }

    console.log("📝 Respuestas finales con secciones:", respuestasFinales.length);

    // Análisis de problemas
    const items_mal = respuestasFinales?.filter(r => r.respuesta === 'Mal') || [];
    const llantas_mal = llantas?.filter(l => 
      l.presion_estado === 'Mal' || l.callo_estado === 'Mal' || l.presion === 'Mal' || l.estado === 'Mal'
    ) || [];
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

    // CREAR REVISIÓN CON TODOS LOS CAMPOS
    const nuevaRevision = new Revision({
      vehiculo: vehiculo_id,
      tipo_revision: tipo_revision_id,
      
      // Datos desnormalizados del vehículo
      tipo_vehiculo: vehiculo.tipo_vehiculo,
      placa: vehiculo.placa,
      numero_economico: vehiculo.numero_economico,
      
      // Datos del tipo de revisión
      frecuencia: tipoRevision.frecuencia,
      
      // Operador
      operador: {
        user_id: operador.user_id,
        nombre: operador.nombre,
        licencia_vigente: operador.licencia_vigente !== false
      },
      
      // Respuestas CON INFO DE SECCIÓN y llantas
      respuestas: respuestasFinales,
      llantas: llantas || [],
      
      // 🆕 COMENTARIOS (3 tipos)
      comentarios_secciones: comentarios_secciones || [],
      comentarios_neumaticos: comentarios_neumaticos || '',
      comentarios: comentarios || '',
      
      // Datos operacionales
      nivel_combustible: nivel_combustible,
      kilometraje_al_momento: Number(kilometraje_al_momento) || 0,
      horas_motor_al_momento: Number(horas_motor_al_momento) || 0,
      
      // Análisis (ahora incluye info de sección)
      items_mal: items_mal.map(item => ({
        numero: item.numero,
        texto: item.texto_pregunta,
        seccion_nombre: item.seccion_nombre,
        seccion_orden: item.seccion_orden
      })),
      llantas_mal: llantas_mal.map(llanta => ({
        posicion: llanta.posicion,
        problema: llanta.presion_estado === 'Mal' ? 'presion_estado' : 
                 llanta.callo_estado === 'Mal' ? 'callo_estado' :
                 llanta.presion === 'Mal' ? 'presion' : 'estado'
      })),
      tiene_problemas: tiene_problemas,
      
      // Estado y fecha
      estado: estado,
      fecha: new Date()
    });

    console.log("💾 Objeto revisión a guardar:");
    console.log("  - placa:", nuevaRevision.placa);
    console.log("  - comentarios_secciones count:", nuevaRevision.comentarios_secciones.length);
    console.log("  - comentarios_neumaticos:", nuevaRevision.comentarios_neumaticos ? 'SI' : 'NO');

    const revisionGuardada = await nuevaRevision.save();
    console.log("✅ Revisión guardada con ID:", revisionGuardada._id);

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'crear_revision',
      'admin',
      req.admin.nombre,
      `Creó revisión ${tipoRevision.frecuencia} para vehículo ${vehiculo.numero_economico}`
    );

    console.log("========================================");

    res.status(201).json({
      success: true,
      message: 'Revisión creada exitosamente',
      revision: revisionGuardada
    });

  } catch (error) {
    console.error('❌ Error en createRevision:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al crear revisión',
      error: error.message
    });
  }
};

// ===== ACTUALIZAR REVISIÓN =====
export const updateRevision = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const revision = await Revision.findById(id)
      .populate('vehiculo', 'placa numero_economico');

    if (!revision) {
      return res.status(404).json({ message: 'Revisión no encontrada' });
    }

    // No permitir editar si ya está cerrada
    if (revision.estado === 'cerrada') {
      return res.status(400).json({ 
        message: 'No se puede editar una revisión cerrada' 
      });
    }

    // Campos que se pueden actualizar
    const camposPermitidos = [
      'respuestas',
      'llantas',
      'comentarios_secciones',      // 🆕 NUEVO
      'comentarios_neumaticos',     // 🆕 NUEVO
      'comentarios',
      'estado'
    ];

    camposPermitidos.forEach(campo => {
      if (updates[campo] !== undefined) {
        revision[campo] = updates[campo];
      }
    });

    // Re-analizar problemas si se actualizaron respuestas o llantas
    if (updates.respuestas || updates.llantas) {
      revision.analizarProblemas();
    }

    await revision.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_revision',
      'admin',
      req.admin.nombre,
      `Actualizó revisión del vehículo ${revision.vehiculo.numero_economico}`
    );

    res.json({
      message: 'Revisión actualizada exitosamente',
      revision
    });

  } catch (error) {
    console.error('Error en updateRevision:', error);
    res.status(500).json({ 
      message: 'Error al actualizar revisión',
      error: error.message 
    });
  }
};

// ===== FIRMAR REVISIÓN (OPERADOR) =====
export const firmarOperador = async (req, res) => {
  try {
    const { id } = req.params;

    const revision = await Revision.findById(id);

    if (!revision) {
      return res.status(404).json({ message: 'Revisión no encontrada' });
    }

    revision.firma_operador.firmado = true;
    revision.firma_operador.fecha = new Date();

    // Cambiar estado si tiene problemas
    if (revision.tiene_problemas) {
      revision.estado = 'pendiente_revision';
    } else {
      revision.estado = 'completada';
    }

    await revision.save();

    res.json({
      message: 'Revisión firmada por operador',
      revision
    });

  } catch (error) {
    console.error('Error en firmarOperador:', error);
    res.status(500).json({ 
      message: 'Error al firmar revisión',
      error: error.message 
    });
  }
};

// ===== FIRMAR REVISIÓN (MECÁNICO) =====
export const firmarMecanico = async (req, res) => {
  try {
    const { id } = req.params;
    const { mecanico } = req.body;

    if (!mecanico || !mecanico.user_id || !mecanico.nombre) {
      return res.status(400).json({ 
        message: 'Faltan datos del mecánico: user_id, nombre' 
      });
    }

    const revision = await Revision.findById(id);

    if (!revision) {
      return res.status(404).json({ message: 'Revisión no encontrada' });
    }

    revision.firma_mecanico = {
      user_id: mecanico.user_id,
      nombre: mecanico.nombre,
      firmado: true,
      fecha: new Date()
    };

    revision.estado = 'cerrada';

    await revision.save();

    res.json({
      message: 'Revisión firmada por mecánico y cerrada',
      revision
    });

  } catch (error) {
    console.error('Error en firmarMecanico:', error);
    res.status(500).json({ 
      message: 'Error al firmar revisión',
      error: error.message 
    });
  }
};

// ===== OBTENER ESTADÍSTICAS DE REVISIONES =====
export const getEstadisticas = async (req, res) => {
  try {
    const { vehiculo_id, fecha_desde, fecha_hasta } = req.query;

    const filtros = {};
    if (vehiculo_id) filtros.vehiculo = vehiculo_id;
    
    if (fecha_desde || fecha_hasta) {
      filtros.fecha = {};
      if (fecha_desde) filtros.fecha.$gte = new Date(fecha_desde);
      if (fecha_hasta) filtros.fecha.$lte = new Date(fecha_hasta);
    }

    const total = await Revision.countDocuments(filtros);
    const conProblemas = await Revision.countDocuments({ 
      ...filtros, 
      tiene_problemas: true 
    });

    const porFrecuencia = await Revision.aggregate([
      { $match: filtros },
      { $group: { _id: '$frecuencia', count: { $sum: 1 } } }
    ]);

    const porEstado = await Revision.aggregate([
      { $match: filtros },
      { $group: { _id: '$estado', count: { $sum: 1 } } }
    ]);

    res.json({
      total,
      con_problemas: conProblemas,
      sin_problemas: total - conProblemas,
      por_frecuencia: porFrecuencia,
      por_estado: porEstado
    });

  } catch (error) {
    console.error('Error en getEstadisticas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas',
      error: error.message 
    });
  }
};

// ===== ELIMINAR REVISIÓN =====
export const deleteRevision = async (req, res) => {
  try {
    const { id } = req.params;

    const revision = await Revision.findById(id)
      .populate('vehiculo', 'placa numero_economico');

    if (!revision) {
      return res.status(404).json({ message: 'Revisión no encontrada' });
    }

    // Solo se pueden eliminar revisiones en progreso
    if (revision.estado !== 'en_progreso') {
      return res.status(400).json({ 
        message: 'Solo se pueden eliminar revisiones en progreso' 
      });
    }

    const numeroEconomicoVehiculo = revision.vehiculo.numero_economico; // Guardar antes de eliminar

    await Revision.findByIdAndDelete(id);

    await registrarActividad(
      'eliminar_revision',
      'admin',
      req.admin.nombre,
      `Eliminó revisión del vehículo ${numeroEconomicoVehiculo}`
    );

    res.json({ 
      message: 'Revisión eliminada exitosamente' 
    });

  } catch (error) {
    console.error('Error en deleteRevision:', error);
    res.status(500).json({ 
      message: 'Error al eliminar revisión',
      error: error.message 
    });
  }
};

// ===== APROBAR REVISIÓN (Actualiza vehículo) =====
export const aprobarRevision = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar la revisión con todos los datos necesarios
    const revision = await Revision.findById(id)
      .populate('tipo_revision', 'nombre frecuencia')
      .populate('vehiculo', 'placa numero_economico marca modelo');

    if (!revision) {
      return res.status(404).json({
        success: false,
        message: 'Revisión no encontrada'
      });
    }

    if (revision.aprobada) {
      return res.status(400).json({
        success: false,
        message: 'Esta revisión ya fue aprobada'
      });
    }

    // Marcar como aprobada
    revision.aprobada = true;
    revision.fecha_aprobacion = new Date();
    revision.estado = 'cerrada';
    revision.aprobada_por = {
      admin_id: req.admin._id,
      nombre: req.admin.nombre
    };

    await revision.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'aprobar_revision',
      'admin',
      req.admin.nombre,
      `Aprobó revisión ${revision.tipo_revision.frecuencia} del vehículo ${revision.vehiculo.numero_economico}`
    );

    // GENERAR PDF AUTOMÁTICAMENTE
    try {
      console.log('🔄 Generando PDF para revisión:', revision._id);
      const pdfUrl = await generarPDFRevision(revision);
      
      revision.pdf_url = pdfUrl;
      revision.pdf_generado_en = new Date();
      await revision.save();
      
      console.log('✅ PDF generado exitosamente:', pdfUrl);
    } catch (pdfError) {
      console.error('❌ Error al generar PDF:', pdfError);
      // No fallar la aprobación si el PDF falla
    }

    // ACTUALIZAR VEHÍCULO SIEMPRE
    try {
      const vehiculoActualizado = await Vehiculo.findByIdAndUpdate(
        revision.vehiculo._id, 
        {
          kilometraje_actual: revision.kilometraje_al_momento,
          horas_motor_actual: revision.horas_motor_al_momento
        },
        { new: true }
      );
      
      console.log('✅ Vehículo actualizado:', {
        kilometraje: vehiculoActualizado.kilometraje_actual,
        horas: vehiculoActualizado.horas_motor_actual
      });
    } catch (vehiculoError) {
      console.error('❌ Error al actualizar vehículo:', vehiculoError);
      // No fallar la aprobación si falla la actualización del vehículo
    }

    // Hacer populate del aprobada_por para enviar en la respuesta
    await revision.populate('aprobada_por.admin_id', 'nombre email');

    res.json({
      success: true,
      message: 'Revisión aprobada exitosamente',
      revision,
      pdfGenerado: !!revision.pdf_url,
      aprobada_por: {
        nombre: revision.aprobada_por.nombre,
        fecha: revision.fecha_aprobacion
      }
    });

  } catch (error) {
    console.error('Error al aprobar revisión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar la revisión',
      error: error.message
    });
  }
};

// ==========================================
// DESCARGAR PDF DE REVISIÓN
// ==========================================

// @desc    Descargar PDF de una revisión
// @route   GET /api/admin/revisiones/:id/pdf
// @access  Private (Admin)
export const descargarPDFRevision = async (req, res) => {
  try {
    const { id } = req.params;

    const revision = await Revision.findById(id);

    if (!revision) {
      return res.status(404).json({
        success: false,
        message: 'Revisión no encontrada'
      });
    }

    if (!revision.pdf_url) {
      return res.status(404).json({
        success: false,
        message: 'Esta revisión no tiene PDF generado'
      });
    }

    // Construir ruta absoluta del archivo
    const filePath = path.join(process.cwd(), revision.pdf_url);

    // Verificar que existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo PDF no encontrado'
      });
    }

    // Nombre del archivo para descarga
    const fileName = `Revision_${revision.placa}_${new Date(revision.fecha).toISOString().split('T')[0]}.pdf`;

    // Enviar archivo
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error al enviar PDF:', err);
        res.status(500).json({
          success: false,
          message: 'Error al descargar el PDF'
        });
      }
    });

  } catch (error) {
    console.error('Error en descargarPDFRevision:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar PDF',
      error: error.message
    });
  }
};

// ==========================================
// REGENERAR PDF DE REVISIÓN
// ==========================================

// @desc    Regenerar PDF de una revisión ya aprobada
// @route   POST /api/admin/revisiones/:id/regenerar-pdf
// @access  Private (Admin)
export const regenerarPDFRevision = async (req, res) => {
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

    if (!revision.aprobada) {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden regenerar PDFs de revisiones aprobadas'
      });
    }

    // Generar PDF
    const pdfUrl = await generarPDFRevision(revision);
    
    revision.pdf_url = pdfUrl;
    revision.pdf_generado_en = new Date();
    await revision.save();

    // ⭐ REGISTRAR ACTIVIDAD
    await registrarActividad(
      'actualizar_revision',
      'admin',
      req.admin.nombre,
      `Regeneró PDF de revisión del vehículo ${revision.vehiculo.numero_economico}`
    );

    res.json({
      success: true,
      message: 'PDF regenerado exitosamente',
      pdf_url: pdfUrl
    });

  } catch (error) {
    console.error('Error al regenerar PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al regenerar PDF',
      error: error.message
    });
  }
};