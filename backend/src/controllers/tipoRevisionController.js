// src/controllers/tipoRevisionController.js

import TipoRevision from '../models/tipoRevision.js';
import registrarActividad from '../utils/activityLogger.js';

// ===== OBTENER TODOS LOS TIPOS DE REVISIÓN =====
export const getTiposRevision = async (req, res) => {
  try {
    console.log("========================================");
    console.log("📥 GET /api/admin/tipos-revision");
    console.log("Query params:", req.query);
    
    const { tipo_vehiculo, frecuencia, activo } = req.query;

    const filtros = {};

    if (tipo_vehiculo) filtros.tipo_vehiculo = tipo_vehiculo;
    if (frecuencia) filtros.frecuencia = frecuencia;
    
    if (activo !== undefined && activo !== '') {
      filtros.activo = activo === 'true';
    }

    console.log("🔍 Filtros construidos:", filtros);

    const tipos = await TipoRevision.find(filtros).sort({ tipo_vehiculo: 1, frecuencia: 1 });
    console.log("📊 Total con filtros:", tipos.length);
    console.log("========================================");
    
    res.json({
      success: true,
      tiposRevision: tipos,
      total: tipos.length
    });

  } catch (error) {
    console.error('❌ Error en getTiposRevision:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener tipos de revisión',
      error: error.message 
    });
  }
};

// ===== OBTENER UN TIPO DE REVISIÓN POR ID =====
export const getTipoRevisionById = async (req, res) => {
  try {
    const { id } = req.params;

    const tipo = await TipoRevision.findById(id);

    if (!tipo) {
      return res.status(404).json({ message: 'Tipo de revisión no encontrado' });
    }

    res.json(tipo);

  } catch (error) {
    console.error('Error en getTipoRevisionById:', error);
    res.status(500).json({ 
      message: 'Error al obtener tipo de revisión',
      error: error.message 
    });
  }
};

// ===== OBTENER TIPO DE REVISIÓN POR CÓDIGO =====
export const getTipoRevisionByCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;

    const tipo = await TipoRevision.findOne({ codigo });

    if (!tipo) {
      return res.status(404).json({ message: 'Tipo de revisión no encontrado' });
    }

    res.json(tipo);

  } catch (error) {
    console.error('Error en getTipoRevisionByCodigo:', error);
    res.status(500).json({ 
      message: 'Error al obtener tipo de revisión',
      error: error.message 
    });
  }
};

// ===== OBTENER TIPO DE REVISIÓN POR VEHÍCULO Y FRECUENCIA =====
export const getTipoRevisionPorVehiculo = async (req, res) => {
  try {
    const { tipo_vehiculo, frecuencia } = req.params;

    const tipo = await TipoRevision.findOne({ 
      tipo_vehiculo, 
      frecuencia,
      activo: true 
    });

    if (!tipo) {
      return res.status(404).json({ 
        message: `No existe revisión ${frecuencia} para ${tipo_vehiculo}` 
      });
    }

    res.json(tipo);

  } catch (error) {
    console.error('Error en getTipoRevisionPorVehiculo:', error);
    res.status(500).json({ 
      message: 'Error al obtener tipo de revisión',
      error: error.message 
    });
  }
};

// ===== CREAR TIPO DE REVISIÓN (SIMPLIFICADO) =====
export const createTipoRevision = async (req, res) => {
  try {
    const {
      nombre,
      codigo,
      tipo_vehiculo,
      frecuencia,
      secciones,
      revision_llantas,
      requiere_licencia_vigente,
      permite_comentarios,
      anexos  // 🆕 Permitir crear con anexos
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !codigo || !tipo_vehiculo || !frecuencia) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos: nombre, codigo, tipo_vehiculo, frecuencia' 
      });
    }

    // Verificar que no exista el código
    const existeCodigo = await TipoRevision.findOne({ codigo });
    if (existeCodigo) {
      return res.status(400).json({ 
        message: 'Ya existe un tipo de revisión con ese código' 
      });
    }

    // Crear tipo de revisión
    const tipoRevision = new TipoRevision({
      nombre,
      codigo,
      tipo_vehiculo,
      frecuencia,
      secciones: secciones || [],
      revision_llantas: revision_llantas || {
        activa: true,
        campos: [
          {
            nombre: 'presion_medida',
            label: 'Presión',
            tipo: 'numero',
            unidad: 'PSI',
            rango_min: 80,
            rango_max: 120
          },
          {
            nombre: 'presion_estado',
            label: 'Estado de Presión',
            tipo: 'bien_mal'
          },
          {
            nombre: 'callo_medida',
            label: 'Profundidad del Callo',
            tipo: 'numero',
            unidad: 'mm',
            rango_min: 3,
            rango_max: 15
          },
          {
            nombre: 'callo_estado',
            label: 'Estado del Callo',
            tipo: 'bien_mal'
          }
        ],
        permite_comentarios: true,
        placeholder_comentarios: 'Comentarios adicionales sobre los neumáticos...'
      },
      requiere_licencia_vigente: requiere_licencia_vigente !== undefined ? requiere_licencia_vigente : true,
      permite_comentarios: permite_comentarios !== undefined ? permite_comentarios : true,
      anexos: anexos || ''  // 🆕 Anexos vacío por defecto
    });

    await tipoRevision.save();

    await registrarActividad(
      'crear_tipo_revision',
      'admin',
      req.admin.nombre,
      `Creó tipo de revisión ${nombre} (${frecuencia}) para ${tipo_vehiculo}`
    );

    res.status(201).json({
      message: 'Tipo de revisión creado exitosamente',
      tipoRevision
    });

  } catch (error) {
    console.error('Error en createTipoRevision:', error);
    res.status(500).json({ 
      message: 'Error al crear tipo de revisión',
      error: error.message 
    });
  }
};

// ===== ACTUALIZAR TIPO DE REVISIÓN (SIMPLIFICADO) =====
export const updateTipoRevision = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const tipoRevision = await TipoRevision.findById(id);

    if (!tipoRevision) {
      return res.status(404).json({ message: 'Tipo de revisión no encontrado' });
    }

    // 🆕 Campos que se pueden actualizar (incluye 'anexos')
    const camposPermitidos = [
      'nombre',
      'secciones',
      'revision_llantas',
      'requiere_licencia_vigente',
      'permite_comentarios',
      'anexos',  // 🆕 Permitir actualizar anexos
      'activo'
    ];

    camposPermitidos.forEach(campo => {
      if (updates[campo] !== undefined) {
        tipoRevision[campo] = updates[campo];
      }
    });

    await tipoRevision.save();

    await registrarActividad(
      'actualizar_tipo_revision',
      'admin',
      req.admin.nombre,
      `Actualizó tipo de revisión ${tipoRevision.nombre}`
    );

    res.json({
      message: 'Tipo de revisión actualizado exitosamente',
      tipoRevision
    });

  } catch (error) {
    console.error('Error en updateTipoRevision:', error);
    res.status(500).json({ 
      message: 'Error al actualizar tipo de revisión',
      error: error.message 
    });
  }
};

// ===== AGREGAR SECCIÓN (SIMPLIFICADO) =====
export const agregarSeccion = async (req, res) => {
  try {
    const { id } = req.params;
    const { seccion } = req.body;

    if (!seccion || !seccion.nombre || !seccion.orden) {
      return res.status(400).json({ 
        message: 'Faltan datos de la sección: nombre, orden' 
      });
    }

    const tipoRevision = await TipoRevision.findById(id);

    if (!tipoRevision) {
      return res.status(404).json({ message: 'Tipo de revisión no encontrado' });
    }

    tipoRevision.secciones.push({
      nombre: seccion.nombre,
      orden: seccion.orden,
      preguntas: seccion.preguntas || [],
      permite_comentarios: seccion.permite_comentarios !== undefined ? seccion.permite_comentarios : true,
      placeholder_comentarios: seccion.placeholder_comentarios || 'Comentarios adicionales para esta sección...'
    });

    await tipoRevision.save();

    await registrarActividad(
      'actualizar_tipo_revision',
      'admin',
      req.admin.nombre,
      `Agregó sección "${seccion.nombre}" al tipo de revisión ${tipoRevision.nombre}`
    );

    res.json({
      message: 'Sección agregada exitosamente',
      tipoRevision
    });

  } catch (error) {
    console.error('Error en agregarSeccion:', error);
    res.status(500).json({ 
      message: 'Error al agregar sección',
      error: error.message 
    });
  }
};

// ===== AGREGAR PREGUNTA A SECCIÓN (SIMPLIFICADO) =====
export const agregarPregunta = async (req, res) => {
  try {
    const { id, seccionIndex } = req.params;
    const { pregunta } = req.body;

    if (!pregunta || !pregunta.numero || !pregunta.texto) {
      return res.status(400).json({ 
        message: 'Faltan datos de la pregunta: numero, texto' 
      });
    }

    const tipoRevision = await TipoRevision.findById(id);

    if (!tipoRevision) {
      return res.status(404).json({ message: 'Tipo de revisión no encontrado' });
    }

    if (!tipoRevision.secciones[seccionIndex]) {
      return res.status(404).json({ message: 'Sección no encontrada' });
    }

    const nombreSeccion = tipoRevision.secciones[seccionIndex].nombre;

    tipoRevision.secciones[seccionIndex].preguntas.push({
      numero: pregunta.numero,
      texto: pregunta.texto
    });

    await tipoRevision.save();

    await registrarActividad(
      'actualizar_tipo_revision',
      'admin',
      req.admin.nombre,
      `Agregó pregunta #${pregunta.numero} a sección "${nombreSeccion}" en tipo de revisión ${tipoRevision.nombre}`
    );

    res.json({
      message: 'Pregunta agregada exitosamente',
      tipoRevision
    });

  } catch (error) {
    console.error('Error en agregarPregunta:', error);
    res.status(500).json({ 
      message: 'Error al agregar pregunta',
      error: error.message 
    });
  }
};

// ===== ELIMINAR TIPO DE REVISIÓN =====
export const deleteTipoRevision = async (req, res) => {
  try {
    const { id } = req.params;

    const tipoRevision = await TipoRevision.findById(id);

    if (!tipoRevision) {
      return res.status(404).json({ message: 'Tipo de revisión no encontrado' });
    }

    // Soft delete - marcar como inactivo
    tipoRevision.activo = false;
    await tipoRevision.save();

    await registrarActividad(
      'eliminar_tipo_revision',
      'admin',
      req.admin.nombre,
      `Desactivó tipo de revisión ${tipoRevision.nombre}`
    );

    res.json({ 
      message: 'Tipo de revisión desactivado exitosamente' 
    });

  } catch (error) {
    console.error('Error en deleteTipoRevision:', error);
    res.status(500).json({ 
      message: 'Error al eliminar tipo de revisión',
      error: error.message 
    });
  }
};