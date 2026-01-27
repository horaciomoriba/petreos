// services/reparacionService.js

import api from './authService';

export const reparacionService = {
  // ============================================
  // CREATE - Crear nueva reparación
  // ============================================
  create: async (reparacionData) => {
    const response = await api.post('/reparaciones', reparacionData);
    return response.data;
  },

  // ============================================
  // READ ALL - Obtener todas las reparaciones
  // ============================================
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.vehiculo) params.append('vehiculo', filtros.vehiculo);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);

    const response = await api.get(`/reparaciones?${params.toString()}`);
    return response.data;
  },

  // ============================================
  // READ ONE - Obtener una reparación específica
  // ============================================
  getById: async (id) => {
    const response = await api.get(`/reparaciones/${id}`);
    return response.data;
  },

  // ============================================
  // UPDATE - Actualizar reparación
  // ============================================
  update: async (id, reparacionData) => {
    const response = await api.put(`/reparaciones/${id}`, reparacionData);
    return response.data;
  },

  // ============================================
  // DELETE - Eliminar reparación
  // ============================================
  delete: async (id) => {
    const response = await api.delete(`/reparaciones/${id}`);
    return response.data;
  },

  // ============================================
  // HISTORIAL - Obtener reparaciones por vehículo
  // ============================================
  getByVehiculo: async (vehiculoId) => {
    const response = await api.get(`/reparaciones/vehiculo/${vehiculoId}`);
    return response.data;
  },

  // ============================================
  // HELPERS - Funciones auxiliares
  // ============================================
  
  // Calcular costo total de piezas
  calcularCostoPiezas: (piezas) => {
    if (!piezas || piezas.length === 0) return 0;
    return piezas.reduce((total, pieza) => {
      const costoTotal = (pieza.cantidad || 0) * (pieza.costo_unitario || 0);
      return total + costoTotal;
    }, 0);
  },

  // Calcular costo total (piezas + mano de obra)
  calcularCostoTotal: (piezas, manoObra) => {
    const costoPiezas = reparacionService.calcularCostoPiezas(piezas);
    return costoPiezas + (manoObra || 0);
  },

  // Formatear datos para envío
  formatearParaEnvio: (formData) => {
    const piezasFormateadas = formData.piezas?.map(pieza => ({
      nombre: pieza.nombre,
      cantidad: Number(pieza.cantidad),
      costo_unitario: Number(pieza.costo_unitario),
      costo_total: Number(pieza.cantidad) * Number(pieza.costo_unitario)
    })) || [];

    return {
      vehiculo_id: formData.vehiculo_id,
      categoria: formData.categoria,
      fecha_realizacion: formData.fecha_realizacion,
      descripcion: formData.descripcion,
      notas_adicionales: formData.notas_adicionales || '',
      piezas: piezasFormateadas,
      costo_mano_obra: Number(formData.costo_mano_obra) || 0,
      estado: formData.estado || 'completada',
      kilometraje_al_momento: formData.kilometraje_al_momento ? Number(formData.kilometraje_al_momento) : undefined,
      horas_motor_al_momento: formData.horas_motor_al_momento ? Number(formData.horas_motor_al_momento) : undefined
    };
  },

  // Validar formulario de reparación
  validar: (formData) => {
    const errores = [];

    if (!formData.vehiculo_id) {
      errores.push('Debe seleccionar un vehículo');
    }

    if (!formData.categoria) {
      errores.push('Debe seleccionar una categoría');
    }

    if (!formData.fecha_realizacion) {
      errores.push('Debe indicar la fecha de realización');
    }

    if (!formData.descripcion || formData.descripcion.trim() === '') {
      errores.push('La descripción es requerida');
    }

    // Validar piezas (si hay)
    if (formData.piezas && formData.piezas.length > 0) {
      formData.piezas.forEach((pieza, index) => {
        if (!pieza.nombre || pieza.nombre.trim() === '') {
          errores.push(`La pieza #${index + 1} debe tener un nombre`);
        }
        if (!pieza.cantidad || pieza.cantidad <= 0) {
          errores.push(`La pieza #${index + 1} debe tener una cantidad válida`);
        }
        if (pieza.costo_unitario === undefined || pieza.costo_unitario < 0) {
          errores.push(`La pieza #${index + 1} debe tener un costo unitario válido`);
        }
      });
    }

    // Validar costo de mano de obra
    if (formData.costo_mano_obra !== undefined && formData.costo_mano_obra < 0) {
      errores.push('El costo de mano de obra no puede ser negativo');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  },

  // Obtener badge de categoría
  getBadgeCategoria: (categoria) => {
    const categorias = {
      'Motor': { color: 'red', icon: '🔧' },
      'Transmisión': { color: 'orange', icon: '⚙️' },
      'Frenos': { color: 'yellow', icon: '🛑' },
      'Suspensión': { color: 'blue', icon: '🔩' },
      'Sistema Eléctrico': { color: 'purple', icon: '⚡' },
      'Llantas': { color: 'gray', icon: '⭕' },
      'Carrocería': { color: 'green', icon: '🚗' },
      'Sistema de Enfriamiento': { color: 'cyan', icon: '❄️' },
      'Mantenimiento Preventivo': { color: 'blue', icon: '🔍' },
      'Mantenimiento Correctivo': { color: 'orange', icon: '🔨' },
      'Otro': { color: 'gray', icon: '📋' }
    };

    return categorias[categoria] || { color: 'gray', icon: '📋' };
  },

  // Obtener badge de estado
  getBadgeEstado: (estado) => {
    const estados = {
      'completada': { 
        texto: 'Completada',
        bgClass: 'bg-green-50',
        textClass: 'text-green-700',
        borderClass: 'border-green-200'
      },
      'en_progreso': { 
        texto: 'En Progreso',
        bgClass: 'bg-orange-50',
        textClass: 'text-orange-700',
        borderClass: 'border-orange-200'
      },
      'cancelada': { 
        texto: 'Cancelada',
        bgClass: 'bg-red-50',
        textClass: 'text-red-700',
        borderClass: 'border-red-200'
      }
    };

    return estados[estado] || estados['completada'];
  },

  // Formatear moneda
  formatearMoneda: (valor) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(valor || 0);
  },

  // Formatear fecha
  formatearFecha: (fecha) => {
    if (!fecha) return '-';
    
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(fecha));
  },

  // Formatear fecha corta
  formatearFechaCorta: (fecha) => {
    if (!fecha) return '-';
    
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(fecha));
  }
};

// ============================================
// CONSTANTES
// ============================================
export const CATEGORIAS_REPARACION = [
  'Motor',
  'Transmisión',
  'Frenos',
  'Suspensión',
  'Sistema Eléctrico',
  'Llantas',
  'Carrocería',
  'Sistema de Enfriamiento',
  'Mantenimiento Preventivo',
  'Mantenimiento Correctivo',
  'Otro'
];

export const ESTADOS_REPARACION = [
  { value: 'completada', label: 'Completada' },
  { value: 'en_progreso', label: 'En Progreso' },
  { value: 'cancelada', label: 'Cancelada' }
];

export default reparacionService;