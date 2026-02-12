import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import Revision from '../models/revision.js';
import Reparacion from '../models/reparacion.js';
import CargaCombustible from '../models/cargacombustible.js';
import Vehiculo from '../models/vehiculo.js';

// ============================================
// 🌍 CONFIGURACIÓN DE ZONA HORARIA
// ============================================
const TIMEZONE_MEXICO = 'America/Mexico_City';

/**
 * 🎯 GENERADOR INTELIGENTE DE REPORTES
 * Maneja CUALQUIER tipo de reporte personalizado
 */
export async function generateSmartReport(params) {
  try {
    console.log('[SmartReport] Parámetros recibidos:', JSON.stringify(params, null, 2));

    // 1. VALIDAR Y NORMALIZAR PARÁMETROS
    const config = normalizeParams(params);
    
    // 2. VALIDAR QUE TENGA SENTIDO
    const validation = validateConfig(config);
    if (!validation.valid) {
      return {
        needs_clarification: true,
        message: validation.message,
        suggestions: validation.suggestions
      };
    }

    // 3. OBTENER DATOS
    const data = await fetchData(config);
    
    if (!data || data.length === 0) {
      return {
        success: false,
        message: 'No se encontraron datos con los filtros especificados',
        totalRegistros: 0
      };
    }

    // 4. GENERAR EXCEL
    const workbook = new ExcelJS.Workbook();
    
    // Configuración del workbook
    workbook.creator = 'Fortya Fleet Management';
    workbook.created = new Date();
    
    // 5. CREAR HOJAS SEGÚN CONFIGURACIÓN
    if (config.opciones.incluir_dashboard) {
      await createDashboardSheet(workbook, data, config);
    }
    
    await createDataSheet(workbook, data, config);
    
    if (config.opciones.incluir_graficas) {
      await createChartsSheet(workbook, data, config);
    }

    // 6. GUARDAR ARCHIVO
    const fileName = generateFileName(config);
    const filePath = path.join(process.cwd(), 'uploads', 'reports', 'excel', fileName);
    
    // Asegurar que existe el directorio
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    await workbook.xlsx.writeFile(filePath);
    
    const fileUrl = `/uploads/reports/excel/${fileName}`;
    
    return {
      success: true,
      fileName,
      url: fileUrl,
      totalRegistros: data.length,
      hojas: workbook.worksheets.map(ws => ws.name),
      mensaje: generateSuccessMessage(config, data.length)
    };

  } catch (error) {
    console.error('[SmartReport] Error:', error);
    return {
      success: false,
      message: 'Error al generar el reporte: ' + error.message
    };
  }
}

/**
 * 📝 NORMALIZAR PARÁMETROS
 */
function normalizeParams(params) {
  return {
    tipo_datos: params.tipo_datos || 'revisiones',
    formato: params.formato || 'excel',
    
    filtros: {
      mes: params.filtros?.mes || null,
      año: params.filtros?.año || new Date().getFullYear(),
      vehiculo: params.filtros?.vehiculo || null,
      categoria: params.filtros?.categoria || null,
      estado: params.filtros?.estado || null,
      tiene_problemas: params.filtros?.tiene_problemas || null,
      operador: params.filtros?.operador || null,
      fecha_inicio: params.filtros?.fecha_inicio || null,
      fecha_fin: params.filtros?.fecha_fin || null
    },
    
    opciones: {
      incluir_graficas: params.opciones?.incluir_graficas ?? false,
      tipos_grafica: params.opciones?.tipos_grafica || ['barras'], // 'barras', 'lineas', 'pie', 'area', 'scatter'
      agrupar_por: params.opciones?.agrupar_por || 'mes', // 'vehiculo', 'mes', 'categoria', 'operador'
      incluir_resumen: params.opciones?.incluir_resumen ?? true,
      incluir_dashboard: params.opciones?.incluir_dashboard ?? true,
      columnas_custom: params.opciones?.columnas_custom || null,
      ordenar_por: params.opciones?.ordenar_por || 'fecha',
      orden: params.opciones?.orden || 'desc',
      limite: params.opciones?.limite || 500,
      incluir_metricas: params.opciones?.incluir_metricas ?? true,
      incluir_comparativas: params.opciones?.incluir_comparativas ?? false,
      estilo: params.opciones?.estilo || 'profesional' // 'profesional', 'compacto', 'detallado'
    }
  };
}

/**
 * ✅ VALIDAR CONFIGURACIÓN
 */
function validateConfig(config) {
  // Validar que gráficas tengan sentido
  if (config.opciones.incluir_graficas) {
    const tiposValidos = ['barras', 'lineas', 'pie', 'area', 'scatter'];
    const tiposInvalidos = config.opciones.tipos_grafica.filter(t => !tiposValidos.includes(t));
    
    if (tiposInvalidos.length > 0) {
      return {
        valid: false,
        message: `Tipos de gráfica no válidos: ${tiposInvalidos.join(', ')}`,
        suggestions: [`Tipos disponibles: ${tiposValidos.join(', ')}`]
      };
    }
    
    // Validar que el agrupamiento tenga sentido con el tipo de dato
    if (config.tipo_datos === 'combustible' && config.opciones.tipos_grafica.includes('pie')) {
      // Pie chart de combustible puede no tener sentido
      if (!config.opciones.agrupar_por) {
        return {
          valid: false,
          message: 'Para gráfica de pie necesito saber cómo agrupar los datos',
          suggestions: [
            'Agrupar por vehículo',
            'Agrupar por mes',
            'Agrupar por tipo de combustible'
          ]
        };
      }
    }
  }
  
  return { valid: true };
}

/**
 * 📊 OBTENER DATOS
 */
async function fetchData(config) {
  const { tipo_datos, filtros, opciones } = config;
  
  let Model;
  let query = {};
  let populate = [];
  
  // Seleccionar modelo
  switch (tipo_datos) {
    case 'revisiones':
      Model = Revision;
      populate = ['vehiculo', 'tipo_revision'];
      break;
    case 'reparaciones':
      Model = Reparacion;
      populate = ['vehiculo'];
      break;
    case 'combustible':
      Model = CargaCombustible;
      populate = ['vehiculo'];
      break;
    default:
      throw new Error(`Tipo de datos no válido: ${tipo_datos}`);
  }
  
  // Construir query con filtros
  if (filtros.fecha_inicio || filtros.fecha_fin || filtros.mes || filtros.año) {
    const fechaQuery = buildDateQuery(filtros);
    if (fechaQuery) query.fecha = fechaQuery;
  }
  
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
  
  if (filtros.estado && tipo_datos !== 'combustible') {
    query.estado = filtros.estado;
  }
  
  if (filtros.tiene_problemas !== null && tipo_datos === 'revisiones') {
    query.tiene_problemas = filtros.tiene_problemas;
  }
  
  if (filtros.categoria && tipo_datos === 'reparaciones') {
    query.categoria = filtros.categoria;
  }
  
  // Ejecutar query
  let data = await Model.find(query)
    .populate(populate)
    .sort({ [opciones.ordenar_por]: opciones.orden === 'desc' ? -1 : 1 })
    .limit(opciones.limite);
  
  return data;
}

/**
 * 📅 CONSTRUIR QUERY DE FECHAS
 */
function buildDateQuery(filtros) {
  let query = {};
  
  if (filtros.fecha_inicio && filtros.fecha_fin) {
    query.$gte = new Date(filtros.fecha_inicio);
    query.$lte = new Date(filtros.fecha_fin);
  } else if (filtros.mes && filtros.año) {
    const meses = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
      'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
      'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };
    
    const mesNum = meses[filtros.mes.toLowerCase()];
    if (mesNum !== undefined) {
      const inicio = new Date(filtros.año, mesNum, 1);
      const fin = new Date(filtros.año, mesNum + 1, 0, 23, 59, 59);
      query.$gte = inicio;
      query.$lte = fin;
    }
  } else if (filtros.año) {
    const inicio = new Date(filtros.año, 0, 1);
    const fin = new Date(filtros.año, 11, 31, 23, 59, 59);
    query.$gte = inicio;
    query.$lte = fin;
  }
  
  return Object.keys(query).length > 0 ? query : null;
}

/**
 * 📊 CREAR HOJA DASHBOARD
 */
async function createDashboardSheet(workbook, data, config) {
  const sheet = workbook.addWorksheet('Dashboard', {
    properties: { tabColor: { argb: 'FF1F2937' } }
  });
  
  // HEADER
  sheet.mergeCells('A1:F1');
  const headerCell = sheet.getCell('A1');
  headerCell.value = `📊 Dashboard - ${config.tipo_datos.toUpperCase()}`;
  headerCell.font = { size: 18, bold: true, color: { argb: 'FF1F2937' } };
  headerCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 35;
  
  // MÉTRICAS CLAVE
  let row = 3;
  
  const metrics = calculateMetrics(data, config);
  
  // Título de sección
  sheet.getCell(`A${row}`).value = 'Resumen General';
  sheet.getCell(`A${row}`).font = { size: 14, bold: true };
  row += 2;
  
  // Renderizar métricas en cards
  const metricsData = Object.entries(metrics.general);
  for (let i = 0; i < metricsData.length; i += 2) {
    const [key1, val1] = metricsData[i];
    const [key2, val2] = metricsData[i + 1] || [];
    
    // Card 1
    sheet.mergeCells(`A${row}:C${row + 2}`);
    const card1 = sheet.getCell(`A${row}`);
    card1.value = `${formatMetricName(key1)}\n${val1}`;
    card1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    card1.font = { size: 12 };
    card1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF9FAFB' }
    };
    card1.border = {
      top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
    };
    
    // Card 2 (si existe)
    if (key2) {
      sheet.mergeCells(`D${row}:F${row + 2}`);
      const card2 = sheet.getCell(`D${row}`);
      card2.value = `${formatMetricName(key2)}\n${val2}`;
      card2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      card2.font = { size: 12 };
      card2.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF9FAFB' }
      };
      card2.border = card1.border;
    }
    
    row += 4;
  }
  
  // Si hay comparativas
  if (config.opciones.incluir_comparativas && metrics.comparativas) {
    row += 1;
    sheet.getCell(`A${row}`).value = '📈 Comparativas';
    sheet.getCell(`A${row}`).font = { size: 14, bold: true };
    row += 2;
    
    Object.entries(metrics.comparativas).forEach(([key, val]) => {
      sheet.getCell(`A${row}`).value = formatMetricName(key);
      sheet.getCell(`A${row}`).font = { bold: true };
      sheet.getCell(`B${row}`).value = val;
      row++;
    });
  }
  
  // Ajustar anchos
  sheet.getColumn('A').width = 15;
  sheet.getColumn('B').width = 15;
  sheet.getColumn('C').width = 15;
  sheet.getColumn('D').width = 15;
  sheet.getColumn('E').width = 15;
  sheet.getColumn('F').width = 15;
}

/**
 * 📄 CREAR HOJA DE DATOS
 */
async function createDataSheet(workbook, data, config) {
  const sheet = workbook.addWorksheet('Datos');
  
  // Determinar columnas según tipo de dato
  const columns = getColumnsForDataType(config.tipo_datos, config.opciones.columnas_custom);
  
  // Headers
  sheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 15
  }));
  
  // Estilo del header
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F2937' }
  };
  sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 25;
  
  // Agregar datos
  data.forEach(item => {
    const row = {};
    columns.forEach(col => {
      row[col.key] = extractValue(item, col.path, col.format);
    });
    sheet.addRow(row);
  });
  
  // Aplicar formato condicional si se pidió
  if (config.opciones.estilo === 'profesional') {
    applyConditionalFormatting(sheet, config.tipo_datos);
  }
  
  // Auto-filtros
  sheet.autoFilter = {
    from: 'A1',
    to: `${String.fromCharCode(65 + columns.length - 1)}1`
  };
}

/**
 * 📈 CREAR HOJA DE GRÁFICAS
 */
async function createChartsSheet(workbook, data, config) {
  const sheet = workbook.addWorksheet('Gráficas');
  
  // Preparar datos agregados
  const aggregatedData = aggregateData(data, config);
  
  let currentRow = 2;
  
  config.opciones.tipos_grafica.forEach((tipoGrafica, index) => {
    // Título de la gráfica
    sheet.getCell(`A${currentRow}`).value = `Gráfica ${index + 1}: ${getTitleForChart(tipoGrafica, config)}`;
    sheet.getCell(`A${currentRow}`).font = { size: 14, bold: true };
    currentRow += 2;
    
    // Agregar datos para esta gráfica
    const chartData = prepareChartData(aggregatedData, tipoGrafica, config);
    
    // Headers
    chartData.headers.forEach((header, i) => {
      const cell = sheet.getCell(currentRow, i + 1);
      cell.value = header;
      cell.font = { bold: true };
    });
    currentRow++;
    
    // Valores
    chartData.values.forEach(row => {
      row.forEach((val, i) => {
        sheet.getCell(currentRow, i + 1).value = val;
      });
      currentRow++;
    });
    
    // CREAR GRÁFICA (ExcelJS Chart)
    // Nota: ExcelJS tiene soporte limitado de gráficas, aquí un ejemplo básico
    // Para gráficas más complejas, considera generar con Chart.js y agregar como imagen
    
    currentRow += 15; // Espacio para siguiente gráfica
  });
}

/**
 * 🧮 CALCULAR MÉTRICAS
 */
function calculateMetrics(data, config) {
  const metrics = {
    general: {
      total_registros: data.length,
      fecha_inicio: data.length > 0 ? formatDate(data[data.length - 1].fecha) : 'N/A',
      fecha_fin: data.length > 0 ? formatDate(data[0].fecha) : 'N/A'
    },
    comparativas: {}
  };
  
  // Métricas específicas por tipo
  switch (config.tipo_datos) {
    case 'revisiones':
      const conProblemas = data.filter(r => r.tiene_problemas).length;
      const aprobadas = data.filter(r => r.aprobada).length;
      metrics.general.con_problemas = conProblemas;
      metrics.general.aprobadas = aprobadas;
      metrics.general.pendientes = data.length - aprobadas;
      metrics.general.tasa_problemas = `${((conProblemas / data.length) * 100).toFixed(1)}%`;
      break;
      
    case 'reparaciones':
      const costoTotal = data.reduce((sum, r) => sum + (r.costo_total || 0), 0);
      const costoPromedio = costoTotal / data.length;
      metrics.general.costo_total = `$${costoTotal.toFixed(2)} MXN`;
      metrics.general.costo_promedio = `$${costoPromedio.toFixed(2)} MXN`;
      
      const completadas = data.filter(r => r.estado === 'completada').length;
      metrics.general.completadas = completadas;
      metrics.general.pendientes = data.length - completadas;
      break;
      
    case 'combustible':
      const litrosTotales = data.reduce((sum, c) => sum + (c.litros || 0), 0);
      const costoTotalComb = data.reduce((sum, c) => sum + (c.costo || 0), 0);
      const precioPromedio = costoTotalComb / litrosTotales;
      
      metrics.general.litros_totales = `${litrosTotales.toFixed(2)} L`;
      metrics.general.costo_total = `$${costoTotalComb.toFixed(2)} MXN`;
      metrics.general.precio_promedio = `$${precioPromedio.toFixed(2)}/L`;
      break;
  }
  
  // Comparativas (si se pidieron)
  if (config.opciones.incluir_comparativas) {
    // Aquí puedes agregar comparativas mes vs mes, etc.
    // Por ahora lo dejamos básico
  }
  
  return metrics;
}

/**
 * 📊 AGREGAR DATOS PARA GRÁFICAS
 */
function aggregateData(data, config) {
  const groupBy = config.opciones.agrupar_por;
  const aggregated = {};
  
  data.forEach(item => {
    let key;
    
    switch (groupBy) {
      case 'mes':
        const fecha = new Date(item.fecha);
        key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'vehiculo':
        key = item.vehiculo?.placa || 'Sin vehículo';
        break;
      case 'categoria':
        key = item.categoria || 'Sin categoría';
        break;
      case 'operador':
        key = item.operador?.nombre || 'Sin operador';
        break;
      default:
        key = 'Total';
    }
    
    if (!aggregated[key]) {
      aggregated[key] = {
        count: 0,
        items: []
      };
    }
    
    aggregated[key].count++;
    aggregated[key].items.push(item);
  });
  
  return aggregated;
}

/**
 * 🎨 UTILIDADES
 */
function formatMetricName(key) {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(date) {
  if (!date) return 'N/A';
  return moment(date).tz(TIMEZONE_MEXICO).locale('es').format('DD MMM YYYY');
}

function extractValue(item, path, format) {
  // Navegar por el path (ej: 'vehiculo.placa')
  const value = path.split('.').reduce((obj, key) => obj?.[key], item);
  
  if (!value && value !== 0 && value !== false) return 'N/A';
  
  // Aplicar formato
  if (format === 'date') {
    return moment(value).tz(TIMEZONE_MEXICO).locale('es').format('DD/MM/YYYY HH:mm');
  }
  if (format === 'currency') return `$${Number(value).toFixed(2)}`;
  if (format === 'boolean') return value ? 'Sí' : 'No';
  
  return value;
}

function getColumnsForDataType(tipo, customColumns) {
  // Si hay columnas custom, usarlas
  if (customColumns && customColumns.length > 0) {
    // Aquí iría lógica para parsear columnas custom
    // Por ahora, usar las default
  }
  
  // Columnas por defecto según tipo
  const columnsMap = {
    revisiones: [
      { header: 'Fecha', key: 'fecha', path: 'fecha', format: 'date', width: 18 },
      { header: 'Placa', key: 'placa', path: 'vehiculo.placa', width: 10 },
      { header: 'No. Económico', key: 'numero_economico', path: 'vehiculo.numero_economico', width: 15 },
      { header: 'Tipo Revisión', key: 'tipo', path: 'tipo_revision.nombre', width: 20 },
      { header: 'Frecuencia', key: 'frecuencia', path: 'frecuencia', width: 12 },
      { header: 'Operador', key: 'operador', path: 'operador.nombre', width: 20 },
      { header: 'Estado', key: 'estado', path: 'estado', width: 12 },
      { header: 'Aprobada', key: 'aprobada', path: 'aprobada', format: 'boolean', width: 10 },
      { header: 'Problemas', key: 'problemas', path: 'tiene_problemas', format: 'boolean', width: 10 },
      { header: 'Kilometraje', key: 'km', path: 'kilometraje_al_momento', width: 12 },
      { header: 'Horas Motor', key: 'hrs', path: 'horas_motor_al_momento', width: 12 }
    ],
    
    reparaciones: [
      { header: 'Fecha', key: 'fecha', path: 'fecha', format: 'date', width: 18 },
      { header: 'Placa', key: 'placa', path: 'vehiculo.placa', width: 10 },
      { header: 'No. Económico', key: 'numero_economico', path: 'vehiculo.numero_economico', width: 15 },
      { header: 'Categoría', key: 'categoria', path: 'categoria', width: 15 },
      { header: 'Descripción', key: 'descripcion', path: 'descripcion', width: 30 },
      { header: 'Costo Piezas', key: 'costo_piezas', path: 'costo_piezas', format: 'currency', width: 12 },
      { header: 'Costo M.O.', key: 'costo_mo', path: 'costo_mano_obra', format: 'currency', width: 12 },
      { header: 'Costo Total', key: 'costo_total', path: 'costo_total', format: 'currency', width: 12 },
      { header: 'Estado', key: 'estado', path: 'estado', width: 12 }
    ],
    
    combustible: [
      { header: 'Fecha', key: 'fecha', path: 'fecha', format: 'date', width: 18 },
      { header: 'Placa', key: 'placa', path: 'vehiculo.placa', width: 10 },
      { header: 'No. Económico', key: 'numero_economico', path: 'vehiculo.numero_economico', width: 15 },
      { header: 'Tipo Combustible', key: 'tipo', path: 'tipo_combustible', width: 15 },
      { header: 'Litros', key: 'litros', path: 'litros', width: 10 },
      { header: 'Costo', key: 'costo', path: 'costo', format: 'currency', width: 12 },
      { header: 'Precio/Litro', key: 'precio_litro', path: 'precio_por_litro', format: 'currency', width: 12 },
      { header: 'Rendimiento', key: 'rendimiento', path: 'rendimiento', width: 12 },
      { header: 'Km Inicial', key: 'km_inicial', path: 'kilometraje_inicial', width: 12 },
      { header: 'Km Final', key: 'km_final', path: 'kilometraje_final', width: 12 }
    ]
  };
  
  return columnsMap[tipo] || [];
}

function applyConditionalFormatting(sheet, tipo) {
  // Aplicar zebra striping
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1 && rowNumber % 2 === 0) {
      row.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' }
        };
      });
    }
  });
  
  // Borders
  const lastRow = sheet.rowCount;
  const lastCol = sheet.columnCount;
  
  for (let row = 1; row <= lastRow; row++) {
    for (let col = 1; col <= lastCol; col++) {
      const cell = sheet.getCell(row, col);
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
    }
  }
}

function prepareChartData(aggregated, tipoGrafica, config) {
  // Transformar datos agregados en formato para gráfica
  const labels = Object.keys(aggregated);
  const values = Object.values(aggregated).map(item => item.count);
  
  return {
    headers: [config.opciones.agrupar_por, 'Cantidad'],
    values: labels.map((label, i) => [label, values[i]])
  };
}

function getTitleForChart(tipoGrafica, config) {
  const titles = {
    barras: `Comparativa por ${config.opciones.agrupar_por}`,
    lineas: `Tendencia por ${config.opciones.agrupar_por}`,
    pie: `Distribución por ${config.opciones.agrupar_por}`,
    area: `Volumen por ${config.opciones.agrupar_por}`,
    scatter: `Dispersión de datos`
  };
  return titles[tipoGrafica] || 'Gráfica';
}

function generateFileName(config) {
  const timestamp = Date.now();
  const tipo = config.tipo_datos;
  const filtro = config.filtros.mes || config.filtros.año || 'all';
  return `${tipo}_${filtro}_${timestamp}.xlsx`;
}

function generateSuccessMessage(config, totalRegistros) {
  const partes = [];
  
  partes.push(`Se generó el reporte con ${totalRegistros} registros`);
  
  if (config.opciones.incluir_dashboard) {
    partes.push('Incluye hoja Dashboard con métricas clave');
  }
  
  if (config.opciones.incluir_graficas) {
    partes.push(`Con ${config.opciones.tipos_grafica.length} gráfica(s)`);
  }
  
  return partes.join('. ') + '.';
}