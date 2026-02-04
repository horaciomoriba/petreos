import dotenv from 'dotenv';
dotenv.config();

import moment from 'moment-timezone';
import OpenAI from 'openai';

import Vehiculo from '../models/vehiculo.js';
import Revision from '../models/revision.js';
import Reparacion from '../models/reparacion.js';
import CargaCombustible from '../models/cargacombustible.js';
import User from '../models/user.js';

// 🆕 IMPORTAR GENERADOR INTELIGENTE
import { generateSmartReport } from '../utils/smartReportGenerator.js';

// ============================================
// 🌍 HELPER: Formatear fechas a zona horaria de México
// ============================================

const TIMEZONE_MEXICO = 'America/Mexico_City';

/**
 * Convierte una fecha UTC a formato legible en zona horaria de México
 */
function formatearFechaMexico(fecha, formato = 'D [de] MMMM [de] YYYY [a las] HH:mm') {
  if (!fecha) return 'N/A';
  return moment(fecha).tz(TIMEZONE_MEXICO).locale('es').format(formato);
}

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
  
  📊 FUNCIONES DISPONIBLES Y CUÁNDO USARLAS:

  INFORMACIÓN GENERAL:
  - getFleetStats() - Panorama general de toda la flota
  - getVehicles() - Listar vehículos con filtros básicos

  INFORMACIÓN ESPECÍFICA DE VEHÍCULOS:
  - getVehiculoDetalle(identificador) - Info completa de UN vehículo
    Úsala cuando pregunten por UN vehículo específico por placa o número económico
    Ejemplo: "datos del DEMO1", "info del ABC-123"

  REVISIONES - ⚠️ IMPORTANTE DIFERENCIAR DOS TIPOS DE "PENDIENTES":

  ❗ 1️⃣ REVISIONES COMPLETADAS PENDIENTES DE APROBACIÓN:
    Función: getRevisionsPendientes()
    
    Usa cuando pregunten:
    • "¿Qué revisiones debo aprobar?"
    • "Revisiones sin aprobar"
    • "Revisiones completadas pendientes"
    • "Revisiones por revisar"
    
    Son revisiones YA REALIZADAS por operadores esperando aprobación del admin.

  ❗ 2️⃣ VEHÍCULOS SIN BITÁCORA HOY:
   Función: getVehiculosSinBitacoraHoy()
   
   🚨 SIEMPRE USA ESTA FUNCIÓN cuando pregunten:
   • "¿Quién no ha hecho bitácora?"
   • "¿Quién no ha hecho bitácora hoy?"
   • "Vehículos sin revisión hoy"
   • "¿Quién falta por hacer bitácora?"
   • "Pendientes del día"
   • "¿Qué vehículos no han hecho su revisión diaria?"
   • "¿Quiénes la realizaron hoy?"
   • "¿Quién hizo bitácora hoy?"
   
   📊 CÓMO INTERPRETAR LA RESPUESTA:
   - Si "vehiculos_sin_bitacora_hoy" > 0 → HAY VEHÍCULOS PENDIENTES
   - Si "vehiculos_sin_bitacora_hoy" = 0 → TODOS COMPLETARON
   - Lee el campo "mensaje_resumen" primero
   - Si hay vehículos sin bitácora, lista los detalles del array "detalles_vehiculos_sin_bitacora" 2️⃣ VEHÍCULOS SIN BITÁCORA HOY:
    Función: getVehiculosSinBitacoraHoy()
    
    🚨 SIEMPRE USA ESTA FUNCIÓN cuando pregunten:
    • "¿Quién no ha hecho bitácora?"
    • "¿Quién no ha hecho bitácora hoy?"
    • "Vehículos sin revisión hoy"
    • "¿Quién falta por hacer bitácora?"
    • "Pendientes del día"
    • "¿Qué vehículos no han hecho su revisión diaria?"
    • "¿Quiénes la realizaron hoy?"
    • "¿Quién hizo bitácora hoy?"
    
    Esta función muestra:
    - Vehículos que AÚN NO HAN HECHO su revisión diaria HOY
    - Vehículos que SÍ la hicieron HOY
    - Total de vehículos activos
    - Días desde última bitácora de cada vehículo

  ⚠️ CUANDO EL USUARIO DIGA SOLO "REVISIONES PENDIENTES":
  Pregunta cuál de los dos tipos le interesa:
  "Puedo mostrarte dos cosas:
  1️⃣ Revisiones ya realizadas que necesitan tu aprobación
  2️⃣ Vehículos que aún no han hecho su bitácora diaria hoy
  ¿Cuál te interesa?"

  OTRAS FUNCIONES DE REVISIONES:

  - getUltimasRevisionesDiarias() - Última revisión diaria de TODOS los vehículos (histórico)
    ⚠️ NO USAR para "¿quién no ha hecho bitácora HOY?"
    Úsala SOLO para: "historial de revisiones", "últimas revisiones de todos"
  - getUltimaRevisionPorTipo(identificador, tipo) - Última revisión de UN vehículo
    Úsala cuando pregunten: "cuándo fue la última revisión de X", "última diaria del DEMO1"
  - buscarRevisiones(filtros) - Búsqueda flexible con múltiples filtros
    Úsala para consultas complejas: "revisiones con problemas del mes pasado"

  ANÁLISIS:
  - getVehiculosConProblemas() - Top vehículos problemáticos
  - getReparacionesRecientes() - Últimas reparaciones
  - getConsumosCombustible() - Cargas de combustible

  REPORTES:
  - generateSmartReport() - Reportes avanzados con gráficas
  - generateExcel...() - Reportes básicos (mantener compatibilidad)

  🎯 REGLAS DE USO:

  1. Para búsquedas por placa O número económico → SIEMPRE usa getVehiculoDetalle()
  2. Para "última revisión diaria" → usa getUltimaRevisionPorTipo()
  3. Para "quién no ha hecho bitácora" → usa getUltimasRevisionesDiarias()
  4. Para búsquedas complejas → usa buscarRevisiones()

  EJEMPLOS PRÁCTICOS:

  Usuario: "datos del vehiculo con la serie DEMO1"
  Tú: [llamas getVehiculoDetalle("DEMO1")]

  Usuario: "cuando fue la ultima bitacora diaria?"
  Tú: [llamas getUltimasRevisionesDiarias()]

  Usuario: "ultima revision del ABC-123"
  Tú: [llamas getUltimaRevisionPorTipo("ABC-123", "diaria")]

  Usuario: "revisiones con problemas del mes pasado"
  Tú: [llamas buscarRevisiones({ tiene_problemas: true, dias_atras: 30 })]

  🚨 NO DIGAS "No tengo información disponible" SI EXISTE UNA FUNCIÓN QUE PUEDA AYUDAR
  En su lugar, llama a la función apropiada.

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
    let query = { eliminado: { $ne: true } }; // Solo vehículos no eliminados
    
    if (filters.placa) {
      query.placa = new RegExp(filters.placa, 'i');
    }
    
    if (filters.tipo_vehiculo) {
      query.tipo_vehiculo = new RegExp(filters.tipo_vehiculo, 'i');
    }
    
    // Filtro por disponibilidad/estado
    if (filters.disponibilidad || filters.estado) {
      const estadoFiltro = filters.disponibilidad || filters.estado;
      query.disponibilidad = estadoFiltro;
    }
    
    const vehiculos = await Vehiculo.find(query)
      .limit(20);
    
    return vehiculos.map(v => ({
      placa: v.placa,
      numero_economico: v.numero_economico,
      tipo: v.tipo_vehiculo,
      marca: v.marca,
      modelo: v.modelo,
      kilometraje: v.kilometraje_actual,
      horas_motor: v.horas_motor_actual,
      disponibilidad: v.disponibilidad, // ← AGREGAR ESTE CAMPO
      estado: v.disponibilidad // ← ALIAS para que OpenAI entienda "estado"
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
      fecha: formatearFechaMexico(r.fecha),  // ← CAMBIO AQUÍ
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
      fecha: formatearFechaMexico(r.fecha),  // ← CAMBIO AQUÍ
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
      fecha: formatearFechaMexico(c.fecha),  // ← CAMBIO AQUÍ
      tipo_combustible: c.tipo_combustible
    }));
  } catch (error) {
    console.error('Error en getConsumosCombustible:', error);
    throw error;
  }
}

// ============================================
// 🆕 FUNCIONES ADICIONALES INTELIGENTES
// ============================================

/**
 * Buscar vehículo específico por placa O número económico
 */
async function getVehiculoDetalle(identificador) {
  try {
    const vehiculo = await Vehiculo.findOne({
      $or: [
        { placa: new RegExp(identificador, 'i') },
        { numero_economico: new RegExp(identificador, 'i') }
      ]
    });
    
    if (!vehiculo) {
      return {
        encontrado: false,
        mensaje: `No se encontró ningún vehículo con placa o número económico: ${identificador}`
      };
    }
    
    // Obtener estadísticas del vehículo
    const totalRevisiones = await Revision.countDocuments({ vehiculo: vehiculo._id });
    const revisionesConProblemas = await Revision.countDocuments({ 
      vehiculo: vehiculo._id, 
      tiene_problemas: true 
    });
    
    const ultimaRevision = await Revision.findOne({ vehiculo: vehiculo._id })
      .sort({ fecha: -1 })
      .populate('tipo_revision', 'nombre frecuencia');
    
    const reparacionesRecientes = await Reparacion.countDocuments({ 
      vehiculo: vehiculo._id,
      fecha: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    return {
      encontrado: true,
      vehiculo: {
        placa: vehiculo.placa,
        numero_economico: vehiculo.numero_economico,
        tipo: vehiculo.tipo_vehiculo,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        año: vehiculo.year, // ← CAMBIO: era "año" pero en el modelo es "year"
        kilometraje_actual: vehiculo.kilometraje_actual,
        horas_motor_actual: vehiculo.horas_motor_actual,
        disponibilidad: vehiculo.disponibilidad, // ← CAMBIO
        estado: vehiculo.disponibilidad // ← ALIAS
      },
      estadisticas: {
        total_revisiones: totalRevisiones,
        revisiones_con_problemas: revisionesConProblemas,
        reparaciones_ultimo_mes: reparacionesRecientes,
        ultima_revision: ultimaRevision ? {
          fecha: formatearFechaMexico(ultimaRevision.fecha),
          tipo: ultimaRevision.tipo_revision?.nombre,
          frecuencia: ultimaRevision.frecuencia,
          tiene_problemas: ultimaRevision.tiene_problemas,
          aprobada: ultimaRevision.aprobada
        } : null
      }
    };
  } catch (error) {
    console.error('Error en getVehiculoDetalle:', error);
    throw error;
  }
}

/**
 * Obtener última revisión de un tipo específico para UN vehículo
 */
async function getUltimaRevisionPorTipo(identificador, tipoFrecuencia) {
  try {
    // Buscar vehículo
    const vehiculo = await Vehiculo.findOne({
      $or: [
        { placa: new RegExp(identificador, 'i') },
        { numero_economico: new RegExp(identificador, 'i') }
      ]
    });
    
    if (!vehiculo) {
      return {
        encontrado: false,
        mensaje: `No se encontró el vehículo: ${identificador}`
      };
    }
    
    // Buscar última revisión del tipo especificado
    const query = { vehiculo: vehiculo._id };
    
    if (tipoFrecuencia) {
      query.frecuencia = tipoFrecuencia; // 'diaria', 'mensual', 'bimestral'
    }
    
    const ultimaRevision = await Revision.findOne(query)
      .sort({ fecha: -1 })
      .populate('tipo_revision', 'nombre frecuencia')
      .populate('vehiculo', 'placa numero_economico');
    
    if (!ultimaRevision) {
      return {
        encontrado: false,
        mensaje: `No se encontraron revisiones ${tipoFrecuencia || ''} para ${vehiculo.numero_economico}`
      };
    }
    
    // Calcular días desde última revisión
    const diasDesde = Math.floor((Date.now() - new Date(ultimaRevision.fecha)) / (1000 * 60 * 60 * 24));
    
    return {
      encontrado: true,
      vehiculo: `${vehiculo.placa} (${vehiculo.numero_economico})`,
      ultima_revision: {
        fecha: formatearFechaMexico(ultimaRevision.fecha),
        dias_desde_ultima: diasDesde,
        tipo: ultimaRevision.tipo_revision?.nombre,
        frecuencia: ultimaRevision.frecuencia,
        operador: ultimaRevision.operador?.nombre || 'N/A',
        tiene_problemas: ultimaRevision.tiene_problemas,
        aprobada: ultimaRevision.aprobada,
        estado: ultimaRevision.estado
      }
    };
  } catch (error) {
    console.error('Error en getUltimaRevisionPorTipo:', error);
    throw error;
  }
}

/**
 * Obtener TODAS las últimas revisiones por tipo (para todos los vehículos)
 */
async function getUltimasRevisionesDiarias(limite = 20) {
  try {
    const vehiculos = await Vehiculo.find({ estado: 'activo' });
    
    const resultados = await Promise.all(
      vehiculos.map(async (vehiculo) => {
        const ultimaDiaria = await Revision.findOne({
          vehiculo: vehiculo._id,
          frecuencia: 'diaria'
        })
          .sort({ fecha: -1 })
          .populate('tipo_revision', 'nombre');
        
        if (!ultimaDiaria) {
          return {
            vehiculo: `${vehiculo.placa} (${vehiculo.numero_economico})`,
            ultima_revision: null,
            dias_sin_revision: 'Sin revisiones',
            alerta: true
          };
        }
        
        const diasDesde = Math.floor((Date.now() - new Date(ultimaDiaria.fecha)) / (1000 * 60 * 60 * 24));
        
        return {
          vehiculo: `${vehiculo.placa} (${vehiculo.numero_economico})`,
          ultima_revision: {
            fecha: formatearFechaMexico(ultimaDiaria.fecha),
            tiene_problemas: ultimaDiaria.tiene_problemas,
            aprobada: ultimaDiaria.aprobada
          },
          dias_sin_revision: diasDesde,
          alerta: diasDesde > 1 // Alerta si pasó más de 1 día
        };
      })
    );
    
    // Ordenar por días sin revisión (mayor a menor)
    const ordenados = resultados.sort((a, b) => {
      const diasA = typeof a.dias_sin_revision === 'number' ? a.dias_sin_revision : 999;
      const diasB = typeof b.dias_sin_revision === 'number' ? b.dias_sin_revision : 999;
      return diasB - diasA;
    });
    
    return ordenados.slice(0, limite);
  } catch (error) {
    console.error('Error en getUltimasRevisionesDiarias:', error);
    throw error;
  }
}

/**
 * Buscar revisiones con filtros flexibles
 */
async function buscarRevisiones(filtros) {
  try {
    const query = {};
    
    // Filtro por vehículo
    if (filtros.vehiculo) {
      const vehiculos = await Vehiculo.find({
        $or: [
          { placa: new RegExp(filtros.vehiculo, 'i') },
          { numero_economico: new RegExp(filtros.vehiculo, 'i') }
        ]
      });
      if (vehiculos.length > 0) {
        query.vehiculo = { $in: vehiculos.map(v => v._id) };
      }
    }
    
    // Filtro por frecuencia
    if (filtros.frecuencia) {
      query.frecuencia = filtros.frecuencia;
    }
    
    // Filtro por estado
    if (filtros.estado) {
      query.estado = filtros.estado;
    }
    
    // Filtro por aprobada
    if (filtros.aprobada !== undefined) {
      query.aprobada = filtros.aprobada;
    }
    
    // Filtro por problemas
    if (filtros.tiene_problemas !== undefined) {
      query.tiene_problemas = filtros.tiene_problemas;
    }
    
    // Filtro por rango de fechas
    if (filtros.dias_atras) {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - filtros.dias_atras);
      query.fecha = { $gte: fechaLimite };
    }
    
    const revisiones = await Revision.find(query)
      .populate('vehiculo', 'placa numero_economico tipo_vehiculo')
      .populate('tipo_revision', 'nombre frecuencia')
      .sort({ fecha: -1 })
      .limit(filtros.limite || 50);
    
    return revisiones.map(r => ({
      id: r._id,
      vehiculo: `${r.vehiculo?.placa} (${r.vehiculo?.numero_economico})`,
      tipo: r.tipo_revision?.nombre || 'N/A',
      frecuencia: r.frecuencia,
      fecha: formatearFechaMexico(r.fecha),
      operador: r.operador?.nombre || 'N/A',
      estado: r.estado,
      aprobada: r.aprobada,
      tiene_problemas: r.tiene_problemas
    }));
  } catch (error) {
    console.error('Error en buscarRevisiones:', error);
    throw error;
  }
}

/**
 * 🆕 NUEVA: Vehículos que NO han hecho bitácora diaria HOY
 */
async function getVehiculosSinBitacoraHoy() {
  try {
    // 1. Obtener TODOS los vehículos no eliminados
    const vehiculosActivos = await Vehiculo.find({ 
      eliminado: { $ne: true }  // ← CAMBIO AQUÍ
    }).select('placa numero_economico tipo_vehiculo');
    
    // 2. Obtener inicio y fin del día de HOY en zona horaria de México
    const timeZone = 'America/Mexico_City';
    
    const inicioDia = moment.tz(timeZone).startOf('day').toDate();
    const finDia = moment.tz(timeZone).endOf('day').toDate();
    
    const hoy = moment.tz(timeZone).toDate();
    
    console.log('[getVehiculosSinBitacoraHoy] HOY en México:', moment.tz(timeZone).format('YYYY-MM-DD HH:mm:ss'));
    console.log('[getVehiculosSinBitacoraHoy] Buscando desde:', inicioDia);
    console.log('[getVehiculosSinBitacoraHoy] Buscando hasta:', finDia);
    
    // 3. Obtener revisiones diarias de HOY
    const revisionesHoy = await Revision.find({
      frecuencia: 'diaria',
      createdAt: {
        $gte: inicioDia,
        $lte: finDia
      }
    }).select('vehiculo createdAt');
    
    console.log('[getVehiculosSinBitacoraHoy] Revisiones encontradas hoy:', revisionesHoy.length);
    if (revisionesHoy.length > 0) {
      revisionesHoy.forEach(rev => {
        console.log('[getVehiculosSinBitacoraHoy] Revisión creada:', moment(rev.createdAt).tz(timeZone).format('YYYY-MM-DD HH:mm:ss'));
      });
    }
    
    // 4. Crear Set de IDs de vehículos que SÍ hicieron bitácora hoy
    const vehiculosConBitacora = new Set(
      revisionesHoy.map(r => r.vehiculo.toString())
    );
    
    // 5. Filtrar vehículos que NO están en el set
    const vehiculosSinBitacora = vehiculosActivos.filter(
      v => !vehiculosConBitacora.has(v._id.toString())
    );
    
    console.log('[getVehiculosSinBitacoraHoy] Vehículos activos:', vehiculosActivos.length);
    console.log('[getVehiculosSinBitacoraHoy] Con bitácora hoy:', vehiculosConBitacora.size);
    console.log('[getVehiculosSinBitacoraHoy] Sin bitácora hoy:', vehiculosSinBitacora.length);
    
    // 6. Para cada vehículo sin bitácora, obtener su última revisión diaria
    const detalles = await Promise.all(
      vehiculosSinBitacora.map(async (v) => {
        const ultimaBitacora = await Revision.findOne({
          vehiculo: v._id,
          frecuencia: 'diaria'
        })
          .sort({ createdAt: -1 })
          .select('createdAt operador');
        
        let diasSinBitacora = null;
        if (ultimaBitacora) {
          const diffTime = Math.abs(hoy - new Date(ultimaBitacora.createdAt));
          diasSinBitacora = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        
        return {
          placa: v.placa,
          numero_economico: v.numero_economico,
          tipo: v.tipo_vehiculo,
          ultima_bitacora: ultimaBitacora ? {
            fecha: formatearFechaMexico(ultimaBitacora.createdAt),
            operador: ultimaBitacora.operador?.nombre || 'N/A'
          } : null,
          dias_sin_bitacora: diasSinBitacora || 'Sin historial'
        };
      })
    );
    
    // 7. Ordenar por días sin bitácora (mayor a menor)
    detalles.sort((a, b) => {
      const diasA = typeof a.dias_sin_bitacora === 'number' ? a.dias_sin_bitacora : 9999;
      const diasB = typeof b.dias_sin_bitacora === 'number' ? b.dias_sin_bitacora : 9999;
      return diasB - diasA;
    });
    
    // 8. Construir mensaje claro para OpenAI
    const mensaje = vehiculosSinBitacora.length === 0
      ? `✅ TODOS los ${vehiculosActivos.length} vehículos activos HAN COMPLETADO su bitácora diaria hoy.`
      : `⚠️ HAY ${vehiculosSinBitacora.length} VEHÍCULOS SIN BITÁCORA HOY de un total de ${vehiculosActivos.length} vehículos activos.`;
    
    return {
      mensaje_resumen: mensaje,
      total_vehiculos_activos: vehiculosActivos.length,
      vehiculos_con_bitacora_hoy: vehiculosConBitacora.size,
      vehiculos_sin_bitacora_hoy: vehiculosSinBitacora.length,
      fecha_consulta: moment.tz(timeZone).format('dddd, D [de] MMMM [de] YYYY'),
      detalles_vehiculos_sin_bitacora: detalles,
      hay_vehiculos_sin_bitacora: vehiculosSinBitacora.length > 0,
      todos_completaron_bitacora: vehiculosSinBitacora.length === 0
    };
  } catch (error) {
    console.error('Error en getVehiculosSinBitacoraHoy:', error);
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
    description: 'Obtiene lista de vehículos con filtros opcionales por placa, tipo, o disponibilidad/estado',
    parameters: {
      type: 'object',
      properties: {
        placa: {
          type: 'string',
          description: 'Filtrar por placa (búsqueda parcial, case-insensitive)'
        },
        tipo_vehiculo: {
          type: 'string',
          description: 'Filtrar por tipo: olla_revolvedora, planta_de_concreto, cargador_frontal, camioneta_pickup, grua, bomba_de_concreto, automovil'
        },
        disponibilidad: {
          type: 'string',
          enum: ['disponible', 'en_servicio', 'mantenimiento', 'fuera_servicio'],
          description: 'Filtrar por disponibilidad/estado del vehículo'
        },
        estado: {
          type: 'string',
          enum: ['disponible', 'en_servicio', 'mantenimiento', 'fuera_servicio'],
          description: 'Alias de disponibilidad - filtra por estado del vehículo'
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
    name: 'getVehiculosSinBitacoraHoy',
    description: 'FUNCIÓN PRINCIPAL para detectar bitácoras del DÍA DE HOY. Obtiene: (1) Vehículos que NO han hecho bitácora HOY, (2) Vehículos que SÍ la hicieron HOY, (3) Total de vehículos activos. USA SIEMPRE cuando pregunten sobre bitácoras del día actual: "¿Quién no ha hecho bitácora?", "¿Quién no ha hecho bitácora hoy?", "vehículos sin revisión hoy", "¿Quién falta por hacer bitácora?", "pendientes del día", "¿quiénes la realizaron hoy?"',
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
   {
    name: 'getVehiculoDetalle',
    description: 'Obtiene información detallada de un vehículo específico buscando por placa O número económico, incluyendo estadísticas de revisiones',
    parameters: {
      type: 'object',
      properties: {
        identificador: {
          type: 'string',
          description: 'Placa o número económico del vehículo (ejemplo: "ABC-123" o "DEMO1")'
        }
      },
      required: ['identificador']
    }
  },
  {
    name: 'getUltimaRevisionPorTipo',
    description: 'Obtiene la última revisión de un vehículo específico, opcionalmente filtrada por tipo (diaria, mensual, bimestral)',
    parameters: {
      type: 'object',
      properties: {
        identificador: {
          type: 'string',
          description: 'Placa o número económico del vehículo'
        },
        tipoFrecuencia: {
          type: 'string',
          enum: ['diaria', 'mensual', 'bimestral'],
          description: 'Tipo de revisión a buscar (opcional). Si no se especifica, obtiene la última de cualquier tipo'
        }
      },
      required: ['identificador']
    }
  },
  {
    name: 'getUltimasRevisionesDiarias',
    description: 'Obtiene las últimas revisiones diarias de TODOS los vehículos activos, mostrando cuántos días han pasado desde la última. Útil para identificar vehículos sin revisiones recientes',
    parameters: {
      type: 'object',
      properties: {
        limite: {
          type: 'number',
          description: 'Número máximo de resultados (default: 20)',
          default: 20
        }
      }
    }
  },
  {
    name: 'buscarRevisiones',
    description: 'Búsqueda flexible de revisiones con múltiples filtros: vehículo, frecuencia, estado, aprobada, problemas, días atrás',
    parameters: {
      type: 'object',
      properties: {
        vehiculo: {
          type: 'string',
          description: 'Placa o número económico (búsqueda parcial)'
        },
        frecuencia: {
          type: 'string',
          enum: ['diaria', 'mensual', 'bimestral'],
          description: 'Tipo de revisión'
        },
        estado: {
          type: 'string',
          enum: ['en_progreso', 'completada', 'pendiente_revision', 'cerrada'],
          description: 'Estado de la revisión'
        },
        aprobada: {
          type: 'boolean',
          description: 'Filtrar por aprobada (true) o no aprobada (false)'
        },
        tiene_problemas: {
          type: 'boolean',
          description: 'Filtrar por revisiones con problemas'
        },
        dias_atras: {
          type: 'number',
          description: 'Buscar revisiones de los últimos N días'
        },
        limite: {
          type: 'number',
          description: 'Máximo de resultados (default: 50)',
          default: 50
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
        case 'getVehiculosSinBitacoraHoy':
          functionResult = await getVehiculosSinBitacoraHoy();
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
        case 'getVehiculoDetalle':
          functionResult = await getVehiculoDetalle(functionArgs.identificador);
          break;
        case 'getUltimaRevisionPorTipo':
          functionResult = await getUltimaRevisionPorTipo(
            functionArgs.identificador, 
            functionArgs.tipoFrecuencia
          );
          break;
        case 'getUltimasRevisionesDiarias':
          functionResult = await getUltimasRevisionesDiarias(functionArgs.limite);
          break;
        case 'buscarRevisiones':
          functionResult = await buscarRevisiones(functionArgs);
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

