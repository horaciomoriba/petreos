// ========================================
// CARGAR DOTENV AQUÍ DIRECTAMENTE ⭐⭐⭐
// ========================================
import dotenv from 'dotenv';
dotenv.config();

// ========================================
// VALIDAR QUE EXISTA LA API KEY
// ========================================
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY no encontrada en .env');
  console.error('Verifica que el archivo .env existe en: backend/.env');
  console.error('Y que contiene: OPENAI_API_KEY=sk-...');
  throw new Error('OPENAI_API_KEY no está configurada');
}

console.log('✅ [chatController] OpenAI API Key cargada correctamente');

// ========================================
// IMPORTS
// ========================================
import OpenAI from 'openai';
import Vehiculo from '../models/vehiculo.js';
import Revision from '../models/revision.js';
import User from '../models/user.js';
import Reparacion from '../models/reparacion.js';
import CargaCombustible from '../models/cargacombustible.js';
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';

// ========================================
// INICIALIZAR OPENAI
// ========================================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log('✅ [chatController] OpenAI inicializado correctamente');

// ============================================
// UTILIDADES
// ============================================

// Asegurar que existan las carpetas de reportes
function ensureReportDirectories() {
  const baseDir = './uploads/reports';
  const dirs = [
    baseDir,
    `${baseDir}/excel`,
    `${baseDir}/pdf`,
    `${baseDir}/csv`
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// ============================================
// FUNCIONES DE CONSULTA (Ya existentes)
// ============================================

// Obtener estadísticas generales de la flota
async function getFleetStats() {
  try {
    const totalVehiculos = await Vehiculo.countDocuments();
    
    const revisionesEsteMes = await Revision.countDocuments({ 
      fecha: { 
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
      }
    });
    
    const revisionesPendientes = await Revision.countDocuments({ 
      aprobada: false,
      estado: 'completada'
    });
    
    const revisionesConProblemas = await Revision.countDocuments({
      tiene_problemas: true,
      fecha: { 
        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
      }
    });

    const totalOperadores = await User.countDocuments({ role: 'user' });

    return {
      totalVehiculos,
      revisionesEsteMes,
      revisionesPendientes,
      revisionesConProblemas,
      totalOperadores
    };
  } catch (error) {
    console.error('Error en getFleetStats:', error);
    return { error: 'No se pudieron obtener las estadísticas' };
  }
}

// Obtener vehículos con filtros
async function getVehicles(filters = {}) {
  try {
    const query = {};
    
    if (filters.placa) {
      query.placa = { $regex: filters.placa, $options: 'i' };
    }
    
    if (filters.tipo_vehiculo) {
      query.tipo_vehiculo = filters.tipo_vehiculo;
    }

    const vehiculos = await Vehiculo.find(query)
      .populate('ubicacion_actual', 'nombre')
      .limit(20)
      .lean();

    return vehiculos.map(v => ({
      placa: v.placa,
      numero_economico: v.numero_economico,
      tipo: v.tipo_vehiculo,
      marca: v.marca,
      modelo: v.modelo,
      kilometraje: v.kilometraje_actual,
      horas_motor: v.horas_motor_actual,
      ubicacion: v.ubicacion_actual?.nombre || 'Sin ubicación'
    }));
  } catch (error) {
    console.error('Error en getVehicles:', error);
    return { error: 'No se pudieron obtener los vehículos' };
  }
}

// Obtener revisiones pendientes de aprobación
async function getRevisionsPendientes() {
  try {
    const revisiones = await Revision.find({
      aprobada: false,
      estado: 'completada'
    })
    .populate('vehiculo', 'placa numero_economico')
    .populate('tipo_revision', 'nombre frecuencia')
    .sort({ fecha: -1 })
    .limit(10)
    .lean();

    return revisiones.map(r => ({
      id: r._id,
      vehiculo: `${r.vehiculo?.placa} (${r.vehiculo?.numero_economico})`,
      tipo: r.tipo_revision?.nombre,
      frecuencia: r.frecuencia,
      fecha: r.fecha,
      operador: r.operador?.nombre,
      tiene_problemas: r.tiene_problemas
    }));
  } catch (error) {
    console.error('Error en getRevisionsPendientes:', error);
    return { error: 'No se pudieron obtener las revisiones pendientes' };
  }
}

// Obtener vehículos con más problemas
async function getVehiculosConProblemas(dias = 30) {
  try {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    const revisiones = await Revision.find({
      tiene_problemas: true,
      fecha: { $gte: fechaLimite }
    })
    .populate('vehiculo', 'placa numero_economico tipo_vehiculo')
    .lean();

    // Agrupar por vehículo
    const problemasPorVehiculo = {};
    
    revisiones.forEach(rev => {
      const vehiculoId = rev.vehiculo?._id?.toString();
      if (!vehiculoId) return;

      if (!problemasPorVehiculo[vehiculoId]) {
        problemasPorVehiculo[vehiculoId] = {
          vehiculo: rev.vehiculo,
          totalProblemas: 0,
          problemas: []
        };
      }

      problemasPorVehiculo[vehiculoId].totalProblemas += rev.items_mal?.length || 0;
      problemasPorVehiculo[vehiculoId].totalProblemas += rev.llantas_mal?.length || 0;
      
      if (rev.items_mal) {
        problemasPorVehiculo[vehiculoId].problemas.push(...rev.items_mal);
      }
      if (rev.llantas_mal) {
        problemasPorVehiculo[vehiculoId].problemas.push(...rev.llantas_mal);
      }
    });

    // Convertir a array y ordenar
    const resultado = Object.values(problemasPorVehiculo)
      .sort((a, b) => b.totalProblemas - a.totalProblemas)
      .slice(0, 5)
      .map(item => ({
        placa: item.vehiculo.placa,
        numero_economico: item.vehiculo.numero_economico,
        tipo: item.vehiculo.tipo_vehiculo,
        totalProblemas: item.totalProblemas,
        problemasComunes: item.problemas.slice(0, 3)
      }));

    return resultado;
  } catch (error) {
    console.error('Error en getVehiculosConProblemas:', error);
    return { error: 'No se pudieron obtener los vehículos con problemas' };
  }
}

// Obtener reparaciones recientes
async function getReparacionesRecientes(limite = 10) {
  try {
    const reparaciones = await Reparacion.find()
      .populate('vehiculo_id', 'placa numero_economico')
      .sort({ fecha_realizacion: -1 })
      .limit(limite)
      .lean();

    return reparaciones.map(r => ({
      vehiculo: `${r.vehiculo_id?.placa} (${r.vehiculo_id?.numero_economico})`,
      categoria: r.categoria,
      descripcion: r.descripcion,
      costo_total: r.costo_total,
      fecha: r.fecha_realizacion,
      estado: r.estado
    }));
  } catch (error) {
    console.error('Error en getReparacionesRecientes:', error);
    return { error: 'No se pudieron obtener las reparaciones' };
  }
}

// Obtener consumo de combustible
async function getConsumosCombustible(dias = 30) {
  try {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    const cargas = await CargaCombustible.find({
      fecha_hora: { $gte: fechaLimite }
    })
    .populate('vehiculo_id', 'placa numero_economico tipo_vehiculo')
    .sort({ fecha_hora: -1 })
    .limit(20)
    .lean();

    return cargas.map(c => ({
      vehiculo: `${c.vehiculo_id?.placa} (${c.vehiculo_id?.numero_economico})`,
      litros: c.litros_cargados,
      costo: c.costo,
      rendimiento: c.rendimiento_estimado,
      fecha: c.fecha_hora,
      tipo_combustible: c.tipo_combustible
    }));
  } catch (error) {
    console.error('Error en getConsumosCombustible:', error);
    return { error: 'No se pudieron obtener los consumos de combustible' };
  }
}

// ============================================
// FUNCIONES DE GENERACIÓN DE REPORTES
// ============================================

// Generar reporte Excel de Revisiones
async function generateExcelRevisiones(params = {}) {
  try {
    ensureReportDirectories();

    const { mes, año, vehiculo } = params;
    
    // Construir query
    const query = {};
    if (mes && año) {
      const mesNum = {
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
        'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
        'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
      }[mes.toLowerCase()] || new Date().getMonth();
      
      const añoNum = año || new Date().getFullYear();
      
      const startDate = new Date(añoNum, mesNum, 1);
      const endDate = new Date(añoNum, mesNum + 1, 0);
      query.fecha = { $gte: startDate, $lte: endDate };
    }
    
    if (vehiculo) {
      const vehiculoDoc = await Vehiculo.findOne({ 
        $or: [
          { placa: { $regex: vehiculo, $options: 'i' } },
          { numero_economico: { $regex: vehiculo, $options: 'i' } }
        ]
      });
      if (vehiculoDoc) {
        query.vehiculo = vehiculoDoc._id;
      }
    }

    // Obtener revisiones
    const revisiones = await Revision.find(query)
      .populate('vehiculo', 'placa numero_economico marca modelo')
      .populate('tipo_revision', 'nombre frecuencia')
      .sort({ fecha: -1 })
      .limit(500)
      .lean();

    // Crear Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Revisiones');

    // Headers
    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Placa', key: 'placa', width: 12 },
      { header: 'No. Económico', key: 'numero_economico', width: 15 },
      { header: 'Tipo Revisión', key: 'tipo', width: 20 },
      { header: 'Frecuencia', key: 'frecuencia', width: 12 },
      { header: 'Operador', key: 'operador', width: 25 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Aprobada', key: 'aprobada', width: 10 },
      { header: 'Problemas', key: 'problemas', width: 10 },
      { header: 'Km', key: 'kilometraje', width: 10 },
      { header: 'Hrs Motor', key: 'horas_motor', width: 10 }
    ];

    // Estilo del header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Agregar datos
    revisiones.forEach(rev => {
      worksheet.addRow({
        fecha: new Date(rev.fecha).toLocaleDateString('es-MX'),
        placa: rev.vehiculo?.placa || '-',
        numero_economico: rev.vehiculo?.numero_economico || '-',
        tipo: rev.tipo_revision?.nombre || '-',
        frecuencia: rev.frecuencia || '-',
        operador: rev.operador?.nombre || '-',
        estado: rev.estado || '-',
        aprobada: rev.aprobada ? 'Sí' : 'No',
        problemas: rev.tiene_problemas ? 'Sí' : 'No',
        kilometraje: rev.kilometraje_al_momento || '-',
        horas_motor: rev.horas_motor_al_momento || '-'
      });
    });

    // Guardar archivo
    const timestamp = Date.now();
    const fileName = `revisiones_${timestamp}.xlsx`;
    const filePath = `./uploads/reports/excel/${fileName}`;
    
    await workbook.xlsx.writeFile(filePath);

    return {
      success: true,
      fileName,
      url: `/uploads/reports/excel/${fileName}`,
      fullUrl: `${process.env.BACKEND_URL || process.env.FRONTEND_URL}/uploads/reports/excel/${fileName}`,
      totalRegistros: revisiones.length
    };

  } catch (error) {
    console.error('Error generando Excel:', error);
    return { 
      success: false,
      error: 'No se pudo generar el reporte Excel' 
    };
  }
}

// Generar reporte Excel de Reparaciones
async function generateExcelReparaciones(params = {}) {
  try {
    ensureReportDirectories();

    const { mes, año, vehiculo } = params;
    
    const query = {};
    if (mes && año) {
      const mesNum = {
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
        'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
        'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
      }[mes.toLowerCase()] || new Date().getMonth();
      
      const añoNum = año || new Date().getFullYear();
      
      const startDate = new Date(añoNum, mesNum, 1);
      const endDate = new Date(añoNum, mesNum + 1, 0);
      query.fecha_realizacion = { $gte: startDate, $lte: endDate };
    }

    const reparaciones = await Reparacion.find(query)
      .populate('vehiculo_id', 'placa numero_economico marca modelo')
      .sort({ fecha_realizacion: -1 })
      .limit(500)
      .lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reparaciones');

    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Placa', key: 'placa', width: 12 },
      { header: 'No. Económico', key: 'numero_economico', width: 15 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Descripción', key: 'descripcion', width: 40 },
      { header: 'Costo Piezas', key: 'costo_piezas', width: 12 },
      { header: 'Costo M.O.', key: 'costo_mo', width: 12 },
      { header: 'Costo Total', key: 'costo_total', width: 12 },
      { header: 'Estado', key: 'estado', width: 12 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    reparaciones.forEach(rep => {
      worksheet.addRow({
        fecha: new Date(rep.fecha_realizacion).toLocaleDateString('es-MX'),
        placa: rep.vehiculo_id?.placa || '-',
        numero_economico: rep.vehiculo_id?.numero_economico || '-',
        categoria: rep.categoria || '-',
        descripcion: rep.descripcion || '-',
        costo_piezas: rep.costo_piezas || 0,
        costo_mo: rep.costo_mano_obra || 0,
        costo_total: rep.costo_total || 0,
        estado: rep.estado || '-'
      });
    });

    const timestamp = Date.now();
    const fileName = `reparaciones_${timestamp}.xlsx`;
    const filePath = `./uploads/reports/excel/${fileName}`;
    
    await workbook.xlsx.writeFile(filePath);

    return {
      success: true,
      fileName,
      url: `/uploads/reports/excel/${fileName}`,
      fullUrl: `${process.env.BACKEND_URL || process.env.FRONTEND_URL}/uploads/reports/excel/${fileName}`,
      totalRegistros: reparaciones.length
    };

  } catch (error) {
    console.error('Error generando Excel reparaciones:', error);
    return { 
      success: false,
      error: 'No se pudo generar el reporte de reparaciones' 
    };
  }
}

// Generar reporte Excel de Combustible
async function generateExcelCombustible(params = {}) {
  try {
    ensureReportDirectories();

    const { mes, año } = params;
    
    const query = {};
    if (mes && año) {
      const mesNum = {
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
        'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
        'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
      }[mes.toLowerCase()] || new Date().getMonth();
      
      const añoNum = año || new Date().getFullYear();
      
      const startDate = new Date(añoNum, mesNum, 1);
      const endDate = new Date(añoNum, mesNum + 1, 0);
      query.fecha_hora = { $gte: startDate, $lte: endDate };
    }

    const cargas = await CargaCombustible.find(query)
      .populate('vehiculo_id', 'placa numero_economico marca modelo')
      .sort({ fecha_hora: -1 })
      .limit(500)
      .lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Combustible');

    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Placa', key: 'placa', width: 12 },
      { header: 'No. Económico', key: 'numero_economico', width: 15 },
      { header: 'Tipo Combustible', key: 'tipo', width: 15 },
      { header: 'Litros', key: 'litros', width: 10 },
      { header: 'Costo', key: 'costo', width: 12 },
      { header: 'Precio/Litro', key: 'precio_litro', width: 12 },
      { header: 'Rendimiento', key: 'rendimiento', width: 12 },
      { header: 'Km Inicial', key: 'km_inicial', width: 10 },
      { header: 'Km Final', key: 'km_final', width: 10 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    cargas.forEach(carga => {
      worksheet.addRow({
        fecha: new Date(carga.fecha_hora).toLocaleDateString('es-MX'),
        placa: carga.vehiculo_id?.placa || '-',
        numero_economico: carga.vehiculo_id?.numero_economico || '-',
        tipo: carga.tipo_combustible || '-',
        litros: carga.litros_cargados || 0,
        costo: carga.costo || 0,
        precio_litro: carga.precio_por_litro || 0,
        rendimiento: carga.rendimiento_estimado || '-',
        km_inicial: carga.kilometraje_al_cargar || '-',
        km_final: carga.kilometraje_final || '-'
      });
    });

    const timestamp = Date.now();
    const fileName = `combustible_${timestamp}.xlsx`;
    const filePath = `./uploads/reports/excel/${fileName}`;
    
    await workbook.xlsx.writeFile(filePath);

    return {
      success: true,
      fileName,
      url: `/uploads/reports/excel/${fileName}`,
      fullUrl: `${process.env.BACKEND_URL || process.env.FRONTEND_URL}/uploads/reports/excel/${fileName}`,
      totalRegistros: cargas.length
    };

  } catch (error) {
    console.error('Error generando Excel combustible:', error);
    return { 
      success: false,
      error: 'No se pudo generar el reporte de combustible' 
    };
  }
}

// ============================================
// DEFINICIÓN DE FUNCIONES PARA OPENAI
// ============================================

const functions = [
  {
    name: 'getFleetStats',
    description: 'Obtiene estadísticas generales de la flota: total de vehículos, revisiones del mes, revisiones pendientes, problemas, operadores',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'getVehicles',
    description: 'Obtiene la lista de vehículos con filtros opcionales',
    parameters: {
      type: 'object',
      properties: {
        placa: {
          type: 'string',
          description: 'Placa del vehículo para filtrar'
        },
        tipo_vehiculo: {
          type: 'string',
          description: 'Tipo de vehículo: Camión, Camioneta, Automóvil, etc.'
        }
      }
    }
  },
  {
    name: 'getRevisionsPendientes',
    description: 'Obtiene las revisiones que están pendientes de aprobación por parte del administrador',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'getVehiculosConProblemas',
    description: 'Obtiene los vehículos que han tenido más problemas en los últimos días',
    parameters: {
      type: 'object',
      properties: {
        dias: {
          type: 'number',
          description: 'Número de días a analizar (default: 30)'
        }
      }
    }
  },
  {
    name: 'getReparacionesRecientes',
    description: 'Obtiene las reparaciones más recientes realizadas en la flota',
    parameters: {
      type: 'object',
      properties: {
        limite: {
          type: 'number',
          description: 'Número de reparaciones a obtener (default: 10)'
        }
      }
    }
  },
  {
    name: 'getConsumosCombustible',
    description: 'Obtiene el historial de cargas de combustible recientes',
    parameters: {
      type: 'object',
      properties: {
        dias: {
          type: 'number',
          description: 'Número de días a analizar (default: 30)'
        }
      }
    }
  },
  {
    name: 'generateExcelRevisiones',
    description: 'Genera un reporte en formato Excel con todas las revisiones. Puede filtrar por mes, año o vehículo específico.',
    parameters: {
      type: 'object',
      properties: {
        mes: {
          type: 'string',
          description: 'Mes a filtrar: enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre'
        },
        año: {
          type: 'number',
          description: 'Año a filtrar (ej: 2026)'
        },
        vehiculo: {
          type: 'string',
          description: 'Placa o número económico del vehículo'
        }
      }
    }
  },
  {
    name: 'generateExcelReparaciones',
    description: 'Genera un reporte en formato Excel con todas las reparaciones y sus costos.',
    parameters: {
      type: 'object',
      properties: {
        mes: {
          type: 'string',
          description: 'Mes a filtrar'
        },
        año: {
          type: 'number',
          description: 'Año a filtrar'
        }
      }
    }
  },
  {
    name: 'generateExcelCombustible',
    description: 'Genera un reporte en formato Excel con el historial de cargas de combustible.',
    parameters: {
      type: 'object',
      properties: {
        mes: {
          type: 'string',
          description: 'Mes a filtrar'
        },
        año: {
          type: 'number',
          description: 'Año a filtrar'
        }
      }
    }
  }
];

// ============================================
// CONTROLLER PRINCIPAL
// ============================================

export const sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'El mensaje no puede estar vacío' 
      });
    }

    // System prompt con contexto de Petreos
    const systemPrompt = `Eres un asistente AI especializado en Petreos, un sistema de gestión de flotas vehiculares industriales.

TU MISIÓN:
Ayudar a los administradores a obtener información rápida y análisis sobre:
- Vehículos de la flota (camiones, camionetas, maquinaria)
- Revisiones (diarias, mensuales, bimestrales)
- Operadores y mecánicos
- Reparaciones y mantenimientos
- Consumo de combustible
- Estadísticas y métricas clave
- Generación de reportes descargables (Excel, PDF)

INSTRUCCIONES:
- Responde de manera concisa y profesional en español
- Usa las funciones disponibles cuando necesites datos específicos
- Presenta los datos de forma clara, usando listas cuando sea apropiado
- Si no tienes datos suficientes, pregunta al usuario por más detalles
- Mantén un tono amigable pero profesional
- No inventes datos, usa solo lo que te dan las funciones
- Cuando generes reportes, incluye la URL completa del archivo en tu respuesta

FORMATO DE RESPUESTAS:
- Para listas: usa viñetas o numeración
- Para números: formatea con separadores de miles
- Para fechas: usa formato legible (ej: "15 de enero de 2026")
- Para dinero: usa formato MXN (ej: "$1,500.00 MXN")
- Para reportes generados: indica claramente la URL del archivo

CONTEXTO ACTUAL:
Fecha: ${new Date().toLocaleDateString('es-MX', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}`;

    // Construir historial de mensajes
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Últimos 10 mensajes
      { role: 'user', content: message }
    ];

    // Primera llamada a OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      functions,
      function_call: 'auto',
      temperature: 0.7,
      max_tokens: 1000
    });

    const assistantMessage = response.choices[0].message;

    // Si OpenAI quiere llamar una función
    if (assistantMessage.function_call) {
      const functionName = assistantMessage.function_call.name;
      const functionArgs = JSON.parse(assistantMessage.function_call.arguments || '{}');

      console.log(`[Chatbot] Ejecutando función: ${functionName}`, functionArgs);

      // Ejecutar la función correspondiente
      let functionResult;
      switch (functionName) {
        case 'getFleetStats':
          functionResult = await getFleetStats();
          break;
        case 'getVehicles':
          functionResult = await getVehicles(functionArgs);
          break;
        case 'getRevisionsPendientes':
          functionResult = await getRevisionsPendientes();
          break;
        case 'getVehiculosConProblemas':
          functionResult = await getVehiculosConProblemas(functionArgs.dias);
          break;
        case 'getReparacionesRecientes':
          functionResult = await getReparacionesRecientes(functionArgs.limite);
          break;
        case 'getConsumosCombustible':
          functionResult = await getConsumosCombustible(functionArgs.dias);
          break;
        case 'generateExcelRevisiones':
          functionResult = await generateExcelRevisiones(functionArgs);
          break;
        case 'generateExcelReparaciones':
          functionResult = await generateExcelReparaciones(functionArgs);
          break;
        case 'generateExcelCombustible':
          functionResult = await generateExcelCombustible(functionArgs);
          break;
        default:
          functionResult = { error: 'Función no reconocida' };
      }

      // Segunda llamada a OpenAI con el resultado de la función
      const secondResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          ...messages,
          assistantMessage,
          {
            role: 'function',
            name: functionName,
            content: JSON.stringify(functionResult)
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return res.json({
        success: true,
        message: secondResponse.choices[0].message.content,
        role: 'assistant'
      });
    }

    // Respuesta directa sin función
    res.json({
      success: true,
      message: assistantMessage.content,
      role: 'assistant'
    });

  } catch (error) {
    console.error('[Chatbot] Error:', error);
    
    // Manejo específico de errores de OpenAI
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        success: false,
        message: 'Error de autenticación con OpenAI. Verifica la API key.' 
      });
    }
    
    if (error.response?.status === 429 || error.code === 'insufficient_quota') {
      return res.status(429).json({ 
        success: false,
        message: 'Límite de uso de OpenAI alcanzado. Por favor verifica tu plan y billing.' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Error al procesar tu mensaje. Por favor intenta de nuevo.' 
    });
  }
};