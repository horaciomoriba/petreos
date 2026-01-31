import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
import Vehiculo from '../models/vehiculo.js';
import Revision from '../models/revision.js';
import Reparacion from '../models/reparacion.js';
import CargaCombustible from '../models/cargacombustible.js';
import User from '../models/user.js';

// 🆕 IMPORTAR GENERADOR INTELIGENTE
import { generateSmartReport } from '../utils/smartReportGenerator.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ============================================
// 🧠 SYSTEM PROMPT MEJORADO
// ============================================

const systemPrompt = `Eres un asistente AI especializado en Petreos, un sistema de gestión de flotas vehiculares industriales de alto nivel.

🎯 TU MISIÓN:
Ayudar a los administradores a obtener información, análisis y reportes avanzados sobre:
- Vehículos de la flota (camiones, camionetas, grúas, plantas de concreto, revolvedoras)
- Revisiones (diarias, mensuales, bimestrales) con inspección de neumáticos
- Operadores y mecánicos
- Reparaciones y mantenimientos con costos
- Consumo de combustible y rendimiento
- Estadísticas, tendencias y métricas clave
- Generación de reportes avanzados (Excel con gráficas, dashboards, PDFs)

📊 CAPACIDADES DE REPORTES AVANZADOS:
Puedes generar reportes profesionales personalizados con:

FORMATOS:
✅ Excel (.xlsx) con múltiples hojas
✅ Gráficas nativas de Excel (barras, líneas, pie, área, scatter)
✅ Dashboard con métricas visuales
✅ Formateo profesional automático

TIPOS DE GRÁFICAS:
- 📊 Barras: Comparativas entre vehículos, categorías, meses
- 📈 Líneas: Tendencias en el tiempo (revisiones, costos, consumo)
- 🥧 Pie: Distribución porcentual (problemas por vehículo, categorías de reparación)
- 📉 Área: Volumen acumulado en el tiempo
- ⚡ Scatter: Correlaciones (km vs costos, rendimiento vs litros)

AGRUPACIONES INTELIGENTES:
- Por vehículo (comparar rendimiento entre unidades)
- Por mes/año (ver tendencias temporales)
- Por categoría (tipos de reparación, problemas comunes)
- Por operador (desempeño individual)

OPCIONES DE PERSONALIZACIÓN:
- Columnas personalizadas (elegir qué datos mostrar)
- Ordenamiento flexible (por fecha, costo, kilometraje, etc)
- Filtros avanzados (mes, año, vehículo específico, estado, problemas)
- Estilos: profesional (con colores), compacto (solo datos), detallado (todo)
- Métricas calculadas (promedios, totales, tasas, comparativas)

🎨 INSTRUCCIONES DE INTERACCIÓN:

1. TONO Y ESTILO:
   - Profesional pero amigable
   - Conciso pero completo
   - Proactivo en sugerencias
   - Educativo cuando sea relevante

2. CUANDO EL USUARIO PIDA REPORTES PERSONALIZADOS:
   
   ✅ HACER (Buenas prácticas):
   - Identificar claramente qué datos necesita
   - Si falta información CRÍTICA, hacer UNA pregunta concreta con opciones
   - Ofrecer 2-3 opciones específicas, no 10
   - Sugerir la configuración óptima según el caso de uso
   - Ser proactivo: "También puedo incluir X, ¿te interesa?"
   
   ❌ NO HACER:
   - Bombardear con 5+ preguntas seguidas
   - Decir "no puedo" si solo falta un detalle
   - Asumir sin preguntar cuando hay ambigüedad
   - Generar reportes genéricos cuando piden específicos

3. EJEMPLOS DE INTERACCIÓN IDEAL:

   📝 Caso 1: Petición Clara
   Usuario: "Dame un Excel de revisiones de enero con gráfica de barras"
   Tú: [Llamas a generateSmartReport con todos los parámetros]
   
   📝 Caso 2: Petición Ambigua
   Usuario: "Necesito un reporte con gráficas"
   Tú: "¡Perfecto! Para hacerte el mejor reporte, necesito saber:
        
        ¿De qué datos?
        • Revisiones (inspecciones diarias/mensuales)
        • Reparaciones (mantenimientos y costos)
        • Combustible (cargas y rendimiento)
        
        Dime cuál te interesa y te sugiero las mejores gráficas 📊"
   
   📝 Caso 3: Petición Creativa
   Usuario: "Quiero ver qué camiones me están saliendo más caros"
   Tú: "Excelente análisis! Te puedo generar un reporte con:
        
        📊 Gráfica de barras: Top 10 vehículos por costo total de reparaciones
        📈 Tendencia: Costos mensuales por vehículo
        📑 Tabla detallada: Categorías de reparación por unidad
        
        ¿Del último mes, trimestre o todo el año?"
   
   📝 Caso 4: Petición con Contexto
   Usuario: "Dame algo para mostrarle al director sobre el estado de la flota"
   Tú: "Para una presentación ejecutiva, te recomiendo un reporte con:
        
        ✨ Dashboard: Métricas clave (total revisiones, % problemas, costos)
        📊 Gráfica de barras: Vehículos con más incidencias
        📈 Tendencia: Evolución de problemas en últimos 3 meses
        💰 Costos: Total invertido en reparaciones
        
        ¿Lo genero del último trimestre?"

4. MANEJO DE FUNCIONES:

   Cuando uses generateSmartReport, SIEMPRE considera:
   
   ✅ Para reportes ejecutivos/presentaciones:
   {
     opciones: {
       incluir_dashboard: true,
       incluir_graficas: true,
       incluir_resumen: true,
       estilo: 'profesional'
     }
   }
   
   ✅ Para análisis detallado:
   {
     opciones: {
       incluir_graficas: true,
       tipos_grafica: ['lineas', 'barras'],
       incluir_metricas: true,
       incluir_comparativas: true
     }
   }
   
   ✅ Para descarga rápida de datos:
   {
     opciones: {
       incluir_dashboard: false,
       incluir_graficas: false,
       estilo: 'compacto'
     }
   }

5. REGLAS CRÍTICAS:

   🚨 ARCHIVOS:
   - Cuando generateSmartReport retorne una URL, cópiala EXACTAMENTE
   - NO agregues dominios (https://petreos.com, www, etc)
   - Formato correcto: "/uploads/reports/excel/archivo.xlsx"
   - Si la función retorna múltiples hojas, menciónalas: "El reporte incluye 3 hojas: Dashboard, Datos, Gráficas"

   🚨 DATOS:
   - Nunca inventes datos o métricas
   - Si no tienes información, di "No tengo esos datos disponibles"
   - Usa las funciones SIEMPRE para obtener info actualizada
   - Si una función retorna needs_clarification, haz la pregunta que sugiere

   🚨 NÚMEROS:
   - Formatea con separadores de miles: "1,500" no "1500"
   - Dinero con formato MXN: "$1,500.00 MXN"
   - Fechas legibles: "15 de enero de 2026" no "2026-01-15"
   - Porcentajes con 1 decimal: "45.3%" no "45.33333%"

6. SUGERENCIAS PROACTIVAS:

   Cuando veas oportunidades, sugiere análisis adicionales:
   
   ✨ Si el usuario pide revisiones, menciona:
   "También puedo mostrarte qué vehículos tienen más problemas recurrentes"
   
   ✨ Si pide reparaciones, ofrece:
   "¿Quieres ver la tendencia de costos para planificar el presupuesto?"
   
   ✨ Si pide combustible, propón:
   "Puedo identificar vehículos con bajo rendimiento que necesiten atención"

CONTEXTO ACTUAL:
Fecha: ${new Date().toLocaleDateString('es-MX', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
Sistema: Petreos Fleet Management v1.0
Usuario: Administrador con acceso completo

¡Estás listo para ayudar! 🚀`;

// ============================================
// 📊 FUNCIONES DE CONSULTA (SIN CAMBIOS)
// ============================================

async function getFleetStats() {
  try {
    const totalVehiculos = await Vehiculo.countDocuments();
    
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    const revisionesEsteMes = await Revision.countDocuments({
      fecha: { $gte: inicioMes }
    });
    
    const revisionesPendientes = await Revision.countDocuments({
      aprobada: false,
      estado: { $in: ['completada', 'pendiente_revision'] }
    });
    
    const revisionesConProblemas = await Revision.countDocuments({
      tiene_problemas: true,
      fecha: { $gte: inicioMes }
    });
    
    const totalOperadores = await User.countDocuments({ role: 'operador' });
    
    return {
      totalVehiculos,
      revisionesEsteMes,
      revisionesPendientes,
      revisionesConProblemas,
      totalOperadores
    };
  } catch (error) {
    console.error('Error en getFleetStats:', error);
    throw error;
  }
}

async function getVehicles(filters = {}) {
  try {
    let query = {};
    
    if (filters.placa) {
      query.placa = new RegExp(filters.placa, 'i');
    }
    
    if (filters.tipo_vehiculo) {
      query.tipo_vehiculo = new RegExp(filters.tipo_vehiculo, 'i');
    }
    
    const vehiculos = await Vehiculo.find(query)
      .populate('ubicacion', 'nombre')
      .limit(20);
    
    return vehiculos.map(v => ({
      placa: v.placa,
      numero_economico: v.numero_economico,
      tipo: v.tipo_vehiculo,
      marca: v.marca,
      modelo: v.modelo,
      kilometraje: v.kilometraje_actual,
      horas_motor: v.horas_motor_actual,
      ubicacion: v.ubicacion?.nombre || 'Sin ubicación'
    }));
  } catch (error) {
    console.error('Error en getVehicles:', error);
    throw error;
  }
}

async function getRevisionsPendientes() {
  try {
    const revisiones = await Revision.find({
      aprobada: false,
      estado: { $in: ['completada', 'pendiente_revision'] }
    })
      .populate('vehiculo', 'placa numero_economico')
      .populate('tipo_revision', 'nombre frecuencia')
      .sort({ fecha: -1 })
      .limit(20);
    
    return revisiones.map(r => ({
      id: r._id,
      vehiculo: `${r.vehiculo?.placa} (${r.vehiculo?.numero_economico})`,
      tipo: r.tipo_revision?.nombre || 'N/A',
      frecuencia: r.frecuencia || r.tipo_revision?.frecuencia,
      fecha: r.fecha,
      operador: r.operador?.nombre || 'N/A',
      tiene_problemas: r.tiene_problemas
    }));
  } catch (error) {
    console.error('Error en getRevisionsPendientes:', error);
    throw error;
  }
}

async function getVehiculosConProblemas(dias = 30) {
  try {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);
    
    const revisiones = await Revision.find({
      fecha: { $gte: fechaLimite },
      tiene_problemas: true
    }).populate('vehiculo', 'placa numero_economico tipo_vehiculo');
    
    const problemsPorVehiculo = {};
    
    revisiones.forEach(rev => {
      const vehiculoId = rev.vehiculo?._id?.toString();
      if (!vehiculoId) return;
      
      if (!problemsPorVehiculo[vehiculoId]) {
        problemsPorVehiculo[vehiculoId] = {
          vehiculo: rev.vehiculo,
          totalProblemas: 0,
          problemasDetalle: []
        };
      }
      
      problemsPorVehiculo[vehiculoId].totalProblemas++;
      
      if (rev.items_mal && rev.items_mal.length > 0) {
        rev.items_mal.forEach(item => {
          problemsPorVehiculo[vehiculoId].problemasDetalle.push({
            numero: item.numero,
            texto: item.texto
          });
        });
      }
    });
    
    const topVehiculos = Object.values(problemsPorVehiculo)
      .sort((a, b) => b.totalProblemas - a.totalProblemas)
      .slice(0, 5)
      .map(v => ({
        placa: v.vehiculo.placa,
        numero_economico: v.vehiculo.numero_economico,
        tipo: v.vehiculo.tipo_vehiculo,
        totalProblemas: v.totalProblemas,
        problemasComunes: v.problemasDetalle.slice(0, 3)
      }));
    
    return topVehiculos;
  } catch (error) {
    console.error('Error en getVehiculosConProblemas:', error);
    throw error;
  }
}

async function getReparacionesRecientes(limite = 10) {
  try {
    const reparaciones = await Reparacion.find()
      .populate('vehiculo', 'placa numero_economico')
      .sort({ fecha: -1 })
      .limit(limite);
    
    return reparaciones.map(r => ({
      vehiculo: `${r.vehiculo?.placa} (${r.vehiculo?.numero_economico})`,
      categoria: r.categoria,
      descripcion: r.descripcion,
      costo_total: r.costo_total,
      fecha: r.fecha,
      estado: r.estado
    }));
  } catch (error) {
    console.error('Error en getReparacionesRecientes:', error);
    throw error;
  }
}

async function getConsumosCombustible(dias = 30) {
  try {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);
    
    const cargas = await CargaCombustible.find({
      fecha: { $gte: fechaLimite }
    })
      .populate('vehiculo', 'placa numero_economico')
      .sort({ fecha: -1 })
      .limit(50);
    
    return cargas.map(c => ({
      vehiculo: `${c.vehiculo?.placa} (${c.vehiculo?.numero_economico})`,
      litros: c.litros,
      costo: c.costo,
      rendimiento: c.rendimiento || 'N/A',
      fecha: c.fecha,
      tipo_combustible: c.tipo_combustible
    }));
  } catch (error) {
    console.error('Error en getConsumosCombustible:', error);
    throw error;
  }
}

// ============================================
// 🆕 FUNCIONES DE REPORTES - AHORA USA generateSmartReport
// ============================================

// Mantener compatibilidad con funciones antiguas
async function generateExcelRevisiones(params) {
  return await generateSmartReport({
    tipo_datos: 'revisiones',
    formato: 'excel',
    filtros: {
      mes: params.mes,
      año: params.año,
      vehiculo: params.vehiculo
    },
    opciones: {
      incluir_dashboard: true,
      incluir_graficas: false, // Por defecto simple
      incluir_resumen: true,
      estilo: 'profesional'
    }
  });
}

async function generateExcelReparaciones(params) {
  return await generateSmartReport({
    tipo_datos: 'reparaciones',
    formato: 'excel',
    filtros: {
      mes: params.mes,
      año: params.año
    },
    opciones: {
      incluir_dashboard: true,
      incluir_graficas: false,
      incluir_resumen: true,
      estilo: 'profesional'
    }
  });
}

async function generateExcelCombustible(params) {
  return await generateSmartReport({
    tipo_datos: 'combustible',
    formato: 'excel',
    filtros: {
      mes: params.mes,
      año: params.año
    },
    opciones: {
      incluir_dashboard: true,
      incluir_graficas: false,
      incluir_resumen: true,
      estilo: 'profesional'
    }
  });
}

// ============================================
// 🆕 DEFINICIÓN DE FUNCIONES PARA OPENAI
// ============================================

const functions = [
  // FUNCIONES DE CONSULTA (sin cambios)
  {
    name: 'getFleetStats',
    description: 'Obtiene estadísticas generales de la flota: total de vehículos, revisiones del mes, pendientes, problemas, operadores',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'getVehicles',
    description: 'Obtiene lista de vehículos con filtros opcionales por placa o tipo',
    parameters: {
      type: 'object',
      properties: {
        placa: {
          type: 'string',
          description: 'Filtrar por placa (búsqueda parcial, case-insensitive)'
        },
        tipo_vehiculo: {
          type: 'string',
          description: 'Filtrar por tipo: Camión, Camioneta, Grúa, etc.'
        }
      }
    }
  },
  {
    name: 'getRevisionsPendientes',
    description: 'Obtiene revisiones completadas pero pendientes de aprobación por el administrador',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'getVehiculosConProblemas',
    description: 'Obtiene top 5 vehículos con más problemas reportados en revisiones',
    parameters: {
      type: 'object',
      properties: {
        dias: {
          type: 'number',
          description: 'Número de días hacia atrás para analizar (default: 30)',
          default: 30
        }
      }
    }
  },
  {
    name: 'getReparacionesRecientes',
    description: 'Obtiene las reparaciones más recientes con costos y detalles',
    parameters: {
      type: 'object',
      properties: {
        limite: {
          type: 'number',
          description: 'Número máximo de reparaciones a retornar (default: 10)',
          default: 10
        }
      }
    }
  },
  {
    name: 'getConsumosCombustible',
    description: 'Obtiene historial de cargas de combustible con rendimiento y costos',
    parameters: {
      type: 'object',
      properties: {
        dias: {
          type: 'number',
          description: 'Número de días hacia atrás (default: 30)',
          default: 30
        }
      }
    }
  },
  
  // 🆕 FUNCIÓN UNIVERSAL DE REPORTES
  {
    name: 'generateSmartReport',
    description: `Genera reportes personalizados avanzados en Excel con múltiples opciones de configuración.
    
    Capacidades:
    - Múltiples hojas (Dashboard, Datos, Gráficas)
    - Gráficas nativas de Excel (barras, líneas, pie, área, scatter)
    - Formateo profesional automático
    - Métricas calculadas y comparativas
    - Filtros avanzados por fecha, vehículo, categoría, estado
    - Agrupamiento inteligente (por vehículo, mes, categoría, operador)
    
    Usa esta función cuando el usuario pida reportes con:
    - Gráficas personalizadas
    - Dashboards visuales
    - Comparativas específicas
    - Agrupaciones customizadas
    - Análisis avanzados`,
    parameters: {
      type: 'object',
      properties: {
        tipo_datos: {
          type: 'string',
          enum: ['revisiones', 'reparaciones', 'combustible'],
          description: 'Tipo de datos para el reporte'
        },
        filtros: {
          type: 'object',
          properties: {
            mes: {
              type: 'string',
              description: 'Mes en español (enero, febrero, etc.)'
            },
            año: {
              type: 'number',
              description: 'Año (default: año actual)'
            },
            vehiculo: {
              type: 'string',
              description: 'Placa o número económico del vehículo'
            },
            categoria: {
              type: 'string',
              description: 'Categoría de reparación (Motor, Transmisión, etc.)'
            },
            estado: {
              type: 'string',
              description: 'Estado: completada, en_proceso, pendiente, cerrada'
            },
            tiene_problemas: {
              type: 'boolean',
              description: 'Solo revisiones con problemas (true/false)'
            },
            fecha_inicio: {
              type: 'string',
              description: 'Fecha inicio en formato ISO (YYYY-MM-DD)'
            },
            fecha_fin: {
              type: 'string',
              description: 'Fecha fin en formato ISO (YYYY-MM-DD)'
            }
          }
        },
        opciones: {
          type: 'object',
          properties: {
            incluir_graficas: {
              type: 'boolean',
              description: 'Incluir hoja con gráficas (default: false)'
            },
            tipos_grafica: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['barras', 'lineas', 'pie', 'area', 'scatter']
              },
              description: 'Tipos de gráficas a incluir'
            },
            agrupar_por: {
              type: 'string',
              enum: ['vehiculo', 'mes', 'categoria', 'operador'],
              description: 'Cómo agrupar los datos para las gráficas'
            },
            incluir_dashboard: {
              type: 'boolean',
              description: 'Incluir hoja Dashboard con métricas clave (default: true)'
            },
            incluir_resumen: {
              type: 'boolean',
              description: 'Incluir sección de resumen ejecutivo (default: true)'
            },
            incluir_metricas: {
              type: 'boolean',
              description: 'Calcular métricas adicionales (promedios, totales, etc.)'
            },
            incluir_comparativas: {
              type: 'boolean',
              description: 'Incluir comparativas (mes vs mes, etc.)'
            },
            estilo: {
              type: 'string',
              enum: ['profesional', 'compacto', 'detallado'],
              description: 'Estilo de formateo del Excel'
            },
            ordenar_por: {
              type: 'string',
              description: 'Campo por el cual ordenar: fecha, costo, kilometraje'
            },
            orden: {
              type: 'string',
              enum: ['asc', 'desc'],
              description: 'Orden ascendente o descendente'
            },
            limite: {
              type: 'number',
              description: 'Máximo de registros a incluir (default: 500)'
            }
          }
        }
      },
      required: ['tipo_datos']
    }
  },
  
  // Mantener funciones antiguas para compatibilidad
  {
    name: 'generateExcelRevisiones',
    description: 'Genera reporte Excel básico de revisiones (sin gráficas). Para reportes avanzados usa generateSmartReport',
    parameters: {
      type: 'object',
      properties: {
        mes: { type: 'string' },
        año: { type: 'number' },
        vehiculo: { type: 'string' }
      }
    }
  },
  {
    name: 'generateExcelReparaciones',
    description: 'Genera reporte Excel básico de reparaciones (sin gráficas). Para reportes avanzados usa generateSmartReport',
    parameters: {
      type: 'object',
      properties: {
        mes: { type: 'string' },
        año: { type: 'number' }
      }
    }
  },
  {
    name: 'generateExcelCombustible',
    description: 'Genera reporte Excel básico de combustible (sin gráficas). Para reportes avanzados usa generateSmartReport',
    parameters: {
      type: 'object',
      properties: {
        mes: { type: 'string' },
        año: { type: 'number' }
      }
    }
  }
];

// ============================================
// 🎯 CONTROLLER PRINCIPAL
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

    console.log('[Chatbot] Nuevo mensaje:', message);

    // Construir historial de mensajes
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Últimos 10 mensajes
      { role: 'user', content: message }
    ];

    // Primera llamada a OpenAI
    const firstResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      functions,
      function_call: 'auto',
      temperature: 0.7,
      max_tokens: 1000
    });

    const firstChoice = firstResponse.choices[0];

    // Si NO necesita función, retornar respuesta directa
    if (firstChoice.finish_reason === 'stop') {
      return res.json({
        success: true,
        message: firstChoice.message.content,
        role: 'assistant'
      });
    }

    // Si necesita función, ejecutarla
    if (firstChoice.message.function_call) {
      const functionName = firstChoice.message.function_call.name;
      const functionArgs = JSON.parse(firstChoice.message.function_call.arguments || '{}');

      console.log(`[Chatbot] Ejecutando función: ${functionName}`, functionArgs);

      let functionResult;

      // Ejecutar la función correspondiente
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
        case 'generateSmartReport':
          functionResult = await generateSmartReport(functionArgs);
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
          functionResult = { error: 'Función no encontrada' };
      }

      console.log('[Chatbot] Resultado de función:', JSON.stringify(functionResult).substring(0, 200));

      // 🚨 MANEJAR needs_clarification
      if (functionResult.needs_clarification) {
        return res.json({
          success: true,
          message: functionResult.message + '\n\n' + functionResult.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n'),
          role: 'assistant'
        });
      }

      // Segunda llamada a OpenAI con el resultado
      const secondResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          ...messages,
          firstChoice.message,
          {
            role: 'function',
            name: functionName,
            content: JSON.stringify(functionResult)
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const finalMessage = secondResponse.choices[0].message.content;

      return res.json({
        success: true,
        message: finalMessage,
        role: 'assistant'
      });
    }

    // Fallback
    return res.json({
      success: true,
      message: 'Lo siento, no pude procesar tu solicitud correctamente.',
      role: 'assistant'
    });

  } catch (error) {
    console.error('[Chatbot] Error:', error);

    // Manejar errores específicos de OpenAI
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        success: false,
        message: 'Límite de uso de OpenAI alcanzado. Por favor contacta al administrador del sistema.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al procesar el mensaje. Intenta de nuevo.'
    });
  }
};