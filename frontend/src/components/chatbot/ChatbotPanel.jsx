import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import chatService, { QUICK_SUGGESTIONS, ERROR_MESSAGES, CHAT_STATUS } from '../../services/chatService';

export default function ChatbotPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([chatService.getWelcomeMessage()]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState(CHAT_STATUS.IDLE);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  // ============================================
  // EFFECTS
  // ============================================

  // Scroll to bottom cuando hay mensajes nuevos
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Cargar conversación guardada al abrir
  useEffect(() => {
    if (isOpen) {
      const savedMessages = chatService.loadConversation();
      if (savedMessages && savedMessages.length > 1) {
        setMessages(savedMessages);
        setShowSuggestions(false);
      }
    }
  }, [isOpen]);

  // Auto-guardar conversación cada 30 segundos
  useEffect(() => {
    if (messages.length > 1) {
      autoSaveTimerRef.current = setTimeout(() => {
        chatService.saveConversation(messages);
      }, 30000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [messages]);

  // ============================================
  // HANDLERS
  // ============================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || status === CHAT_STATUS.LOADING) return;

    // Validar mensaje
    const validation = chatService.validateMessage(messageText);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }

    // Ocultar sugerencias después del primer mensaje
    setShowSuggestions(false);

    // Agregar mensaje del usuario
    const userMessage = chatService.createUserMessage(messageText);
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStatus(CHAT_STATUS.LOADING);

    try {
      // Preparar historial (últimos 10 mensajes)
      const history = chatService.limitHistory(messages, 10);

      // Enviar a la API
      const response = await chatService.sendMessage(messageText, history);

      if (response.success) {
        // Agregar respuesta del asistente
        const assistantMessage = chatService.createAssistantMessage(response.message);
        setMessages(prev => [...prev, assistantMessage]);
        setStatus(CHAT_STATUS.SUCCESS);

        // Guardar conversación
        chatService.saveConversation([...messages, userMessage, assistantMessage]);
      } else {
        throw new Error(response.message || ERROR_MESSAGES.GENERIC);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setStatus(CHAT_STATUS.ERROR);

      // Determinar tipo de error
      let errorMessage = ERROR_MESSAGES.GENERIC;
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = ERROR_MESSAGES.TIMEOUT;
      } else if (error.response?.status === 401) {
        errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
      } else if (error.response?.status === 429) {
        errorMessage = ERROR_MESSAGES.RATE_LIMIT;
      } else if (error.response?.status >= 500) {
        errorMessage = ERROR_MESSAGES.SERVER_ERROR;
      } else if (!navigator.onLine) {
        errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
      }

      // Mostrar error en el chat
      const errorAssistantMessage = chatService.createAssistantMessage(errorMessage);
      setMessages(prev => [...prev, errorAssistantMessage]);

      toast.error('Error al procesar tu mensaje');
    } finally {
      setStatus(CHAT_STATUS.IDLE);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion.text);
    sendMessage(suggestion.text);
  };

  const clearChat = () => {
    setMessages([chatService.getWelcomeMessage()]);
    setShowSuggestions(true);
    setInput('');
    chatService.clearSavedConversation();
    toast.success('Conversación reiniciada');
  };

  const handleClose = () => {
    // Guardar antes de cerrar
    chatService.saveConversation(messages);
    setIsOpen(false);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-gray-900 to-gray-700 
          text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 
          flex items-center justify-center z-50 hover:scale-110 group"
          title="Abrir Asistente AI"
        >
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Panel de chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl 
        border border-gray-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-4 
          flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Petreos Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-300">En línea</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="hover:bg-white/10 rounded-lg p-2 transition-colors"
                title="Reiniciar conversación"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="hover:bg-white/10 rounded-lg p-2 transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                  {msg.timestamp && (
                    <p className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-gray-300' : 'text-gray-400'
                    }`}>
                      {chatService.formatTimestamp(msg.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {status === CHAT_STATUS.LOADING && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 
                flex items-center gap-2 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                  <span className="text-sm text-gray-600">Pensando...</span>
                </div>
              </div>
            )}

            {/* Sugerencias rápidas */}
            {showSuggestions && messages.length === 1 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-medium text-gray-500 px-1">
                  Sugerencias rápidas:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {QUICK_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left px-3 py-2 text-sm bg-white border border-gray-200 
                      rounded-lg hover:border-gray-300 hover:shadow-sm transition-all text-gray-700
                      hover:text-gray-900"
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta..."
                disabled={status === CHAT_STATUS.LOADING}
                className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 
                text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                disabled:bg-gray-50 disabled:text-gray-400 max-h-[120px]"
                rows={1}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || status === CHAT_STATUS.LOADING}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center flex-shrink-0 min-w-[44px] min-h-[44px]"
              >
                {status === CHAT_STATUS.LOADING ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">
                Enter para enviar · Shift + Enter para nueva línea
              </p>
              <p className="text-xs text-gray-400">
                {input.length}/2000
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}