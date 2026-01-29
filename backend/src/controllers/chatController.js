import OpenAI from 'openai';
import Vehiculo from '../models/vehiculo.js';
import Revision from '../models/revision.js';
import User from '../models/user.js';
import Reparacion from '../models/reparacion.js';
import CargaCombustible from '../models/cargacombustible.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ============================================
// FUNCIONES DISPONIBLES PARA EL CHATBOT
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

INSTRUCCIONES:
- Responde de manera concisa y profesional en español
- Usa las funciones disponibles cuando necesites datos específicos
- Presenta los datos de forma clara, usando listas cuando sea apropiado
- Si no tienes datos suficientes, pregunta al usuario por más detalles
- Mantén un tono amigable pero profesional
- No inventes datos, usa solo lo que te dan las funciones

FORMATO DE RESPUESTAS:
- Para listas: usa viñetas o numeración
- Para números: formatea con separadores de miles
- Para fechas: usa formato legible (ej: "15 de enero de 2026")
- Para dinero: usa formato MXN (ej: "$1,500.00 MXN")

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
      model: 'gpt-4-turbo-preview', // o 'gpt-3.5-turbo' para más económico
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
        default:
          functionResult = { error: 'Función no reconocida' };
      }

      // Segunda llamada a OpenAI con el resultado de la función
      const secondResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
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
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        success: false,
        message: 'Límite de uso de OpenAI alcanzado. Intenta más tarde.' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Error al procesar tu mensaje. Por favor intenta de nuevo.' 
    });
  }
};