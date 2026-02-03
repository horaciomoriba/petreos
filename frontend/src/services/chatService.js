// services/chatService.js

import api from './authService';

export const chatService = {
  // ============================================
  // SEND MESSAGE - Enviar mensaje al chatbot
  // ============================================
  sendMessage: async (message, conversationHistory = []) => {
    const response = await api.post('/chat/message', {
      message,
      conversationHistory
    });
    return response.data;
  },

  // ============================================
  // HELPERS - Funciones auxiliares
  // ============================================

  // Crear mensaje de usuario
  createUserMessage: (content) => {
    return {
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };
  },

  // Crear mensaje del asistente
  createAssistantMessage: (content) => {
    return {
      role: 'assistant',
      content,
      timestamp: new Date().toISOString()
    };
  },

  // Obtener mensaje inicial de bienvenida
  getWelcomeMessage: () => {
    return {
      role: 'assistant',
      content: `¡Hola! Soy el asistente de Petreos 🚗

  ¿En qué puedo ayudarte hoy? Puedo darte información sobre:

  - Estado general de la flota
  - Revisiones pendientes de aprobación ✅
  - Vehículos sin bitácora del día 🚗
  - Vehículos con problemas recurrentes
  - Reparaciones recientes
  - Consumo de combustible
  - Reportes avanzados con gráficas

  ¿Qué te gustaría consultar?`,
      timestamp: new Date().toISOString()
    };
  },

  // Formatear timestamp
  formatTimestamp: (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Menos de 1 minuto
    if (diff < 60000) {
      return 'Ahora';
    }
    
    // Menos de 1 hora
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `Hace ${minutes} min`;
    }
    
    // Hoy
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Ayer
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer ${date.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    
    // Otro día
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Validar mensaje antes de enviar
  validateMessage: (message) => {
    const errors = [];

    if (!message || message.trim() === '') {
      errors.push('El mensaje no puede estar vacío');
    }

    if (message.length > 2000) {
      errors.push('El mensaje es muy largo (máximo 2000 caracteres)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Limitar historial a últimos N mensajes
  limitHistory: (messages, limit = 10) => {
    if (messages.length <= limit) {
      return messages;
    }
    
    // Mantener siempre el mensaje de bienvenida si existe
    const welcomeMessage = messages.find(m => m.role === 'assistant');
    const recentMessages = messages.slice(-limit);
    
    // Si el mensaje de bienvenida no está en los recientes, no incluirlo
    // (para no romper el contexto de la conversación)
    return recentMessages;
  },

  // Detectar si el mensaje es una pregunta
  isQuestion: (message) => {
    const questionWords = [
      '¿', 'qué', 'cuál', 'cuáles', 'cómo', 'cuándo', 
      'dónde', 'quién', 'quiénes', 'por qué', 'cuánto', 'cuánta'
    ];
    
    const lowerMessage = message.toLowerCase();
    return questionWords.some(word => lowerMessage.includes(word));
  },

  // Extraer keywords del mensaje (para analytics futuro)
  extractKeywords: (message) => {
    const keywords = {
      vehiculos: ['vehículo', 'camión', 'camioneta', 'placa', 'flota'],
      revisiones: ['revisión', 'inspección', 'checklist', 'pendiente', 'aprobar'],
      problemas: ['problema', 'falla', 'error', 'mal', 'reparar'],
      combustible: ['combustible', 'gasolina', 'diesel', 'litros', 'rendimiento'],
      reparaciones: ['reparación', 'mantenimiento', 'taller', 'pieza'],
      estadisticas: ['total', 'cuánto', 'resumen', 'estadística', 'métrica']
    };

    const found = [];
    const lowerMessage = message.toLowerCase();

    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => lowerMessage.includes(word))) {
        found.push(category);
      }
    }

    return found;
  },

  // Guardar conversación en localStorage (opcional)
  saveConversation: (messages) => {
    try {
      const key = 'petreos_chat_history';
      const data = {
        messages,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error al guardar conversación:', error);
      return false;
    }
  },

  // Cargar conversación desde localStorage (opcional)
  loadConversation: () => {
    try {
      const key = 'petreos_chat_history';
      const data = localStorage.getItem(key);
      
      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data);
      
      // Validar que no sea muy antigua (máximo 24 horas)
      const timestamp = new Date(parsed.timestamp);
      const now = new Date();
      const hoursDiff = (now - timestamp) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.messages;
    } catch (error) {
      console.error('Error al cargar conversación:', error);
      return null;
    }
  },

  // Limpiar conversación guardada
  clearSavedConversation: () => {
    try {
      localStorage.removeItem('petreos_chat_history');
      return true;
    } catch (error) {
      console.error('Error al limpiar conversación:', error);
      return false;
    }
  }
};

// ============================================
// CONSTANTES
// ============================================

// Sugerencias rápidas para el usuario
export const QUICK_SUGGESTIONS = [
  { 
    id: 1, 
    text: '¿Qué revisiones debo aprobar?',
    icon: '✅'
  },
  { 
    id: 2, 
    text: '¿Quién no ha hecho bitácora hoy?',
    icon: '🚗'
  },
  { 
    id: 3, 
    text: 'Dame estadísticas de la flota',
    icon: '📊' 
  },
  { 
    id: 4, 
    text: 'Vehículos con más problemas',
    icon: '⚠️' 
  },
  { 
    id: 5, 
    text: 'Excel de revisiones con gráficas',
    icon: '📈' 
  },
  { 
    id: 6, 
    text: 'Comparativa de costos por vehículo',
    icon: '💰' 
  }
];

// Mensajes de error personalizados
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'No se pudo conectar con el servidor. Verifica tu conexión.',
  TIMEOUT: 'La solicitud tardó demasiado. Por favor intenta de nuevo.',
  UNAUTHORIZED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
  SERVER_ERROR: 'Hubo un error en el servidor. Por favor intenta más tarde.',
  INVALID_MESSAGE: 'El mensaje no es válido. Por favor verifica e intenta de nuevo.',
  RATE_LIMIT: 'Has enviado demasiados mensajes. Por favor espera un momento.',
  GENERIC: 'Ocurrió un error inesperado. Por favor intenta de nuevo.'
};

// Estados del chatbot
export const CHAT_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Límites
export const CHAT_LIMITS = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_HISTORY_MESSAGES: 10,
  TYPING_DELAY: 500, // ms para simular "typing"
  AUTO_SAVE_INTERVAL: 30000 // Auto-guardar cada 30 segundos
};

export default chatService;