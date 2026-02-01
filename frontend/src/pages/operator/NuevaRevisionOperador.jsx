// src/pages/operator/NuevaRevisionOperador.jsx
// Actualizado con comentarios de sección, medidas de neumáticos y comentarios de neumáticos

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import operadorService from '../../services/operator/operadorService';
import { showToast } from '../../utils/toast';

const NuevaRevisionOperador = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.userAuth);

  const tipoRevisionId = location.state?.tipoRevisionId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tipoRevision, setTipoRevision] = useState(null);
  const [vehiculo, setVehiculo] = useState(null);
  const [activeSection, setActiveSection] = useState(0);

  // Refs para scroll automático
  const sectionRefs = useRef([]);

  const [formData, setFormData] = useState({
    datosOperacionales: {
      kilometraje: '',
      horas_motor: '',
      nivel_combustible: ''
    },
    items: [],
    comentariosSecciones: [],    // 🆕 NUEVO
    neumaticos: [],
    comentariosNeumaticos: '',   // 🆕 NUEVO
    comentarios: ''
  });

  const [seccionAbierta, setSeccionAbierta] = useState(0);

  useEffect(() => {
    if (!tipoRevisionId) {
      showToast.error('No se especificó el tipo de revisión');
      navigate('/operador/dashboard');
      return;
    }
    loadData();
  }, [tipoRevisionId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [tipoRes, vehiculoRes] = await Promise.all([
        operadorService.getTipoRevision(tipoRevisionId),
        operadorService.getMiVehiculo()
      ]);

      setTipoRevision(tipoRes.tipoRevision);
      setVehiculo(vehiculoRes.vehiculo);

      // Inicializar items PRE-MARCADOS como "bien"
      const todasLasPreguntas = [];
      if (Array.isArray(tipoRes.tipoRevision?.secciones)) {
        tipoRes.tipoRevision.secciones.forEach(seccion => {
          if (Array.isArray(seccion.preguntas)) {
            seccion.preguntas.forEach(pregunta => {
              todasLasPreguntas.push({
                numero: pregunta.numero,
                nombre: pregunta.texto,
                estado: 'bien',
                observaciones: ''
              });
            });
          }
        });
      }

      // 🆕 NUEVO - Inicializar comentarios por sección
      const comentariosSecciones = tipoRes.tipoRevision?.secciones?.map(seccion => ({
        seccion_nombre: seccion.nombre,
        seccion_orden: seccion.orden,
        comentario: ''
      })) || [];

      // 🆕 ACTUALIZADO - Inicializar llantas con medidas numéricas
      const initialLlantas = {};
      if (vehiculoRes.vehiculo?.configuracionNeumaticos?.configurado) {
        vehiculoRes.vehiculo.configuracionNeumaticos.ejes.forEach(eje => {
          eje.neumaticos.forEach(neumatico => {
            initialLlantas[neumatico.posicion_global] = {
              posicion: neumatico.posicion_global,
              eje_numero: eje.numero,
              lado: neumatico.lado,
              presion_medida: 95,        // 🆕 Valor por defecto
              presion_estado: 'Bien',    // 🆕 PRE-MARCADO
              callo_medida: 8,           // 🆕 Valor por defecto
              callo_estado: 'Bien'       // 🆕 PRE-MARCADO
            };
          });
        });
      }

      setFormData(prev => ({
        ...prev,
        datosOperacionales: {
          kilometraje: vehiculoRes.vehiculo?.kilometrajeActual || '',
          horas_motor: vehiculoRes.vehiculo?.horasMotorActual || '',
          nivel_combustible: ''
        },
        items: todasLasPreguntas,
        comentariosSecciones,      // 🆕 NUEVO
        neumaticos: Object.values(initialLlantas),
        comentariosNeumaticos: ''  // 🆕 NUEVO
      }));

    } catch (error) {
      console.error('Error al cargar datos:', error);
      showToast.error('Error al cargar información');
      navigate('/operador/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDatosOperacionalesChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      datosOperacionales: {
        ...prev.datosOperacionales,
        [name]: value
      }
    }));
  };

  const handleItemChange = (index, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [campo]: valor } : item
      )
    }));
  };

  // 🆕 NUEVO - Handler para comentarios de sección
  const handleComentarioSeccionChange = (seccionNombre, comentario) => {
    setFormData(prev => ({
      ...prev,
      comentariosSecciones: prev.comentariosSecciones.map(cs =>
        cs.seccion_nombre === seccionNombre 
          ? { ...cs, comentario }
          : cs
      )
    }));
  };

  // 🆕 ACTUALIZADO - Handler para neumáticos con medidas
  const handleNeumaticoChange = (posicion, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      neumaticos: prev.neumaticos.map(llanta =>
        llanta.posicion === posicion 
          ? { ...llanta, [campo]: valor }
          : llanta
      )
    }));
  };

  const scrollToSection = (index) => {
    setActiveSection(index);
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.datosOperacionales.kilometraje || !formData.datosOperacionales.horas_motor) {
      showToast.error('Por favor completa los datos operacionales');
      return;
    }

    if (!formData.datosOperacionales.nivel_combustible) {
      showToast.error('Por favor indica el nivel de combustible');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        tipoRevisionId: tipoRevisionId,
        datosOperacionales: {
          kilometraje: parseFloat(formData.datosOperacionales.kilometraje),
          horas_motor: parseFloat(formData.datosOperacionales.horas_motor),
          nivel_combustible: formData.datosOperacionales.nivel_combustible
        },
        items: formData.items,
        comentariosSecciones: formData.comentariosSecciones.filter(cs => cs.comentario.trim() !== ''), // 🆕 NUEVO
        neumaticos: formData.neumaticos,       // 🆕 Ya incluye nuevos campos
        comentariosNeumaticos: formData.comentariosNeumaticos, // 🆕 NUEVO
        comentarios: formData.comentarios
      };

      await operadorService.crearRevision(payload);

      showToast.success('Revisión completada exitosamente');
      navigate('/operador/dashboard');

    } catch (error) {
      console.error('Error al crear revisión:', error);
      showToast.error(error.response?.data?.message || 'Error al crear revisión');
    } finally {
      setSubmitting(false);
    }
  };

  const marcarSeccionCompleta = (seccionIdx) => {
    const seccion = tipoRevision.secciones[seccionIdx];
    let itemStartIndex = 0;
    
    // Calcular índice de inicio
    for (let i = 0; i < seccionIdx; i++) {
      itemStartIndex += tipoRevision.secciones[i].preguntas.length;
    }
    
    // Marcar todos los items de esta sección como "bien"
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, idx) => {
        if (idx >= itemStartIndex && idx < itemStartIndex + seccion.preguntas.length) {
          return { ...item, estado: 'bien', observaciones: '' };
        }
        return item;
      })
    }));
    
    showToast.success(`Sección "${seccion.nombre}" marcada como completa`);
  };

  // 🆕 NUEVO - Toggle sección abierta/cerrada
  const toggleSeccion = (seccionIdx) => {
    setSeccionAbierta(prev => prev === seccionIdx ? -1 : seccionIdx);
  };

  // Calcular progreso
  const calcularProgreso = () => {
    const datosOperacionalesCompletos = formData.datosOperacionales.kilometraje && 
                                        formData.datosOperacionales.horas_motor && 
                                        formData.datosOperacionales.nivel_combustible;
    
    const totalSteps = 1 + (tipoRevision?.secciones?.length || 0) + (vehiculo?.configuracionNeumaticos?.configurado ? 1 : 0);
    let completedSteps = datosOperacionalesCompletos ? 1 : 0;
    
    if (tipoRevision?.secciones) {
      completedSteps += tipoRevision.secciones.length;
    }
    
    if (vehiculo?.configuracionNeumaticos?.configurado) {
      completedSteps++;
    }
    
    return { completed: completedSteps, total: totalSteps, percentage: (completedSteps / totalSteps) * 100 };
  };

  // 🆕 ACTUALIZADO - Detección de problemas con nuevos campos
  const tieneProblemas = formData.items.some(item => item.estado === 'mal') ||
                         formData.neumaticos.some(n => n.presion_estado === 'Mal' || n.callo_estado === 'Mal');

  const itemsMal = formData.items.filter(item => item.estado === 'mal').length;
  const neumaticosProblema = formData.neumaticos.filter(n => n.presion_estado === 'Mal' || n.callo_estado === 'Mal').length;
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm font-medium text-gray-600">Cargando formulario</p>
        </div>
      </div>
    );
  }

  if (!tipoRevision || !vehiculo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No se pudo cargar la información</p>
          <button 
            onClick={() => navigate('/operador/dashboard')} 
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progreso = calcularProgreso();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header con Progreso */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/operador/dashboard')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Volver</span>
              </button>
              <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900">{tipoRevision.nombre}</h1>
                <p className="text-xs text-gray-500">{vehiculo.placa}</p>
              </div>
            </div>

            {/* Progreso en Header */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs text-gray-500">Progreso</div>
                <div className="text-sm font-semibold text-gray-900">
                  {progreso.completed}/{progreso.total}
                </div>
              </div>
              <div className="w-16 h-16 sm:w-12 sm:h-12 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progreso.percentage / 100)}`}
                    className="text-green-600 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900">{Math.round(progreso.percentage)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Progreso */}
          <div className="pb-3">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out"
                style={{ width: `${progreso.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar - Navegación (Solo Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Resumen */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Resumen</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total items</span>
                    <span className="font-semibold text-gray-900">{formData.items.length}</span>
                  </div>
                  {tieneProblemas && (
                    <>
                      {itemsMal > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Items mal</span>
                          <span className="font-semibold text-red-600">{itemsMal}</span>
                        </div>
                      )}
                      {neumaticosProblema > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Neumáticos</span>
                          <span className="font-semibold text-red-600">{neumaticosProblema}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Navegación de Secciones */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Secciones</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => scrollToSection(0)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === 0
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Datos operacionales
                  </button>
                  
                  {tipoRevision.secciones?.map((seccion, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToSection(idx + 1)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeSection === idx + 1
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {seccion.nombre}
                    </button>
                  ))}

                  {vehiculo.configuracionNeumaticos?.configurado && (
                    <button
                      onClick={() => scrollToSection((tipoRevision.secciones?.length || 0) + 1)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeSection === (tipoRevision.secciones?.length || 0) + 1
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Neumáticos
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos Operacionales */}
              <div 
                ref={el => sectionRefs.current[0] = el}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-24"
              >
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-transparent">
                  <h2 className="text-base font-semibold text-gray-900">Datos operacionales</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Kilometraje, horas motor y combustible</p>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Kilometraje actual
                      </label>
                      <input
                        type="number"
                        name="kilometraje"
                        value={formData.datosOperacionales.kilometraje}
                        onChange={handleDatosOperacionalesChange}
                        required
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="15000"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Horas del motor
                      </label>
                      <input
                        type="number"
                        name="horas_motor"
                        value={formData.datosOperacionales.horas_motor}
                        onChange={handleDatosOperacionalesChange}
                        required
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="1250"
                      />
                    </div>
                  </div>

                  {/* Nivel de Combustible - Más compacto para mobile */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-3">
                      Nivel de combustible
                    </label>
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
                      {[
                        { value: 'lleno', label: 'Lleno', level: '100%', color: 'green' },
                        { value: '3/4', label: '3/4', level: '75%', color: 'blue' },
                        { value: '1/2', label: '1/2', level: '50%', color: 'yellow' },
                        { value: '1/4', label: '1/4', level: '25%', color: 'orange' },
                        { value: 'reserva', label: 'Rsv', level: '10%', color: 'red' }
                      ].map((option) => {
                        const isSelected = formData.datosOperacionales.nivel_combustible === option.value;
                        
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              datosOperacionales: {
                                ...prev.datosOperacionales,
                                nivel_combustible: option.value
                              }
                            }))}
                            className={`relative p-2 sm:p-4 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-gray-900 bg-gray-900 shadow-md'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:scale-95'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-3.5 h-3.5 sm:w-5 sm:h-5 bg-white rounded-full flex items-center justify-center">
                                <svg className="w-2 h-2 sm:w-3 sm:h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}

                            <div className="flex justify-center mb-1.5 sm:mb-2">
                              <div className="relative w-6 h-10 sm:w-10 sm:h-14 border-2 border-gray-400 rounded-lg overflow-hidden bg-gray-100">
                                <div 
                                  className={`absolute bottom-0 left-0 right-0 transition-all ${
                                    option.color === 'green' ? 'bg-green-500' :
                                    option.color === 'blue' ? 'bg-blue-500' :
                                    option.color === 'yellow' ? 'bg-yellow-400' :
                                    option.color === 'orange' ? 'bg-orange-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ height: option.level }}
                                ></div>
                                <div className="absolute -top-0.5 right-0.5 sm:-top-1 sm:right-1 w-1.5 h-1.5 sm:w-3 sm:h-3 bg-gray-400 rounded-sm"></div>
                              </div>
                            </div>
                            <div className={`text-[10px] sm:text-xs font-medium text-center ${
                              isSelected ? 'text-white' : 'text-gray-900'
                            }`}>
                              {option.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist por Secciones - ACCORDION */}
              {tipoRevision.secciones && tipoRevision.secciones.length > 0 && (
                <>
                  {tipoRevision.secciones
                    .sort((a, b) => a.orden - b.orden)
                    .map((seccion, seccionIdx) => {
                      let itemStartIndex = 0;
                      for (let i = 0; i < seccionIdx; i++) {
                        itemStartIndex += tipoRevision.secciones[i].preguntas.length;
                      }

                      const itemsSeccion = formData.items.slice(itemStartIndex, itemStartIndex + seccion.preguntas.length);
                      const todoBien = itemsSeccion.every(item => item.estado === 'bien');
                      const itemsMal = itemsSeccion.filter(item => item.estado === 'mal').length;
                      const estaAbierta = seccionAbierta === seccionIdx;

                      const comentarioSeccion = formData.comentariosSecciones.find(
                        cs => cs.seccion_nombre === seccion.nombre
                      );

                      return (
                        <div 
                          key={seccionIdx} 
                          ref={el => sectionRefs.current[seccionIdx + 1] = el}
                          className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden scroll-mt-24 transition-all"
                        >
                          {/* 🆕 Header Colapsable con Quick Action */}
                          <button
                            type="button"
                            onClick={() => toggleSeccion(seccionIdx)}
                            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {/* Check visual */}
                              {todoBien ? (
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-bold text-gray-700">{seccion.orden}</span>
                                </div>
                              )}
                              
                              <div className="text-left">
                                <h2 className="text-sm font-semibold text-gray-900">{seccion.nombre}</h2>
                                <p className="text-xs text-gray-500">
                                  {todoBien ? (
                                    <span className="text-green-600 font-medium">✓ Completo</span>
                                  ) : itemsMal > 0 ? (
                                    <span className="text-red-600 font-medium">{itemsMal} problema{itemsMal !== 1 ? 's' : ''}</span>
                                  ) : (
                                    <span>{seccion.preguntas.length} items</span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Quick Action: Marcar Todo Bien */}
                              {!todoBien && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    marcarSeccionCompleta(seccionIdx);
                                  }}
                                  className="px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 
                                    rounded-lg border border-green-200 transition-colors flex items-center gap-1"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Todo Bien
                                </button>
                              )}
                              
                              {/* Icono expandir/contraer */}
                              <svg 
                                className={`w-5 h-5 text-gray-400 transition-transform ${estaAbierta ? 'rotate-180' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor" 
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>

                          {/* 🆕 Body expandible */}
                          {estaAbierta && (
                            <div className="p-4 space-y-2 border-t border-gray-200">
                              {seccion.preguntas.map((pregunta, preguntaIdx) => {
                                const itemIndex = itemStartIndex + preguntaIdx;
                                const item = formData.items[itemIndex];
                                
                                if (!item) return null;

                                const esBien = item.estado === 'bien';

                                return (
                                  <div 
                                    key={preguntaIdx} 
                                    className={`rounded-lg transition-all ${
                                      esBien 
                                        ? 'bg-green-50 border border-green-200 p-2' 
                                        : 'bg-red-50 border-2 border-red-200 p-4'
                                    }`}
                                  >
                                    {esBien ? (
                                      // 🆕 COMPACTO: Item "Bien" en 1 línea
                                      <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="flex-1 text-sm text-gray-700">{pregunta.texto}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleItemChange(itemIndex, 'estado', 'mal')}
                                          className="text-xs text-gray-500 hover:text-gray-700 underline"
                                        >
                                          Marcar mal
                                        </button>
                                      </div>
                                    ) : (
                                      // 🆕 EXPANDIDO: Item "Mal" completo
                                      <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                          <span className="flex-shrink-0 w-6 h-6 bg-red-200 rounded flex items-center justify-center text-xs font-bold text-red-900">
                                            {pregunta.numero}
                                          </span>
                                          <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{pregunta.texto}</p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleItemChange(itemIndex, 'estado', 'bien')}
                                            className="text-xs text-gray-600 hover:text-gray-900 underline"
                                          >
                                            Marcar bien
                                          </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                          <button
                                            type="button"
                                            onClick={() => handleItemChange(itemIndex, 'estado', 'bien')}
                                            className="py-2 px-3 rounded-lg text-sm font-semibold bg-white text-gray-700 
                                              border-2 border-gray-200 hover:bg-gray-50 transition-all"
                                          >
                                            Bien
                                          </button>
                                          <button
                                            type="button"
                                            className="py-2 px-3 rounded-lg text-sm font-semibold bg-red-600 text-white shadow-sm"
                                            disabled
                                          >
                                            Mal
                                          </button>
                                        </div>

                                        <div className="pt-2 border-t border-red-200">
                                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                            Describe el problema
                                          </label>
                                          <input
                                            type="text"
                                            value={item.observaciones}
                                            onChange={(e) => handleItemChange(itemIndex, 'observaciones', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg 
                                              focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Ej: Filtro obstruido, requiere cambio..."
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Comentarios de Sección */}
                              {seccion.permite_comentarios && (
                                <div className="pt-3 border-t-2 border-dashed border-gray-200 mt-3">
                                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Comentarios de esta sección
                                  </label>
                                  <textarea
                                    value={comentarioSeccion?.comentario || ''}
                                    onChange={(e) => handleComentarioSeccionChange(seccion.nombre, e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg 
                                      focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                                    rows="2"
                                    placeholder={seccion.placeholder_comentarios || 'Comentarios adicionales...'}
                                  ></textarea>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </>
              )}

              {/* 🆕 ACTUALIZADO - Neumáticos con medidas */}
              {vehiculo.configuracionNeumaticos?.configurado && (
                <div 
                  ref={el => sectionRefs.current[(tipoRevision.secciones?.length || 0) + 1] = el}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-24"
                >
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-transparent">
                    <h2 className="text-base font-semibold text-gray-900">Inspección de neumáticos</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {vehiculo.configuracionNeumaticos.ejes.reduce((acc, eje) => acc + eje.neumaticos.length, 0)} neumáticos en total
                    </p>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {vehiculo.configuracionNeumaticos.ejes.map((eje) => (
                        <div key={`eje-${eje.numero}`}>
                          {/* Header del Eje */}
                          <div className="flex items-center gap-2 mb-3 px-2">
                            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{eje.numero}</span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{eje.nombre}</div>
                              <div className="text-xs text-gray-500">{eje.neumaticos.length} neumáticos</div>
                            </div>
                          </div>

                          {/* 🆕 Tabla Responsive de Neumáticos - SIN scroll horizontal */}
                          <div className="mb-4">
                            {/* Desktop: Tabla completa */}
                            <div className="hidden md:block overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">Pos</th>
                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">Eje</th>
                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">Presión (PSI)</th>
                                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700">P</th>
                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">Callo (mm)</th>
                                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700">C</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {eje.neumaticos
                                    .sort((a, b) => a.posicion_global - b.posicion_global)
                                    .map((neumatico) => {
                                      const llanta = formData.neumaticos.find(l => l.posicion === neumatico.posicion_global);
                                      const tieneProblema = llanta?.presion_estado === 'Mal' || llanta?.callo_estado === 'Mal';
                                      
                                      return (
                                        <tr 
                                          key={neumatico.posicion_global}
                                          className={`border-b border-gray-100 ${tieneProblema ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                                        >
                                          <td className="px-2 py-3">
                                            <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${
                                              tieneProblema ? 'bg-red-200 text-red-900' : 'bg-gray-200 text-gray-900'
                                            }`}>
                                              {neumatico.posicion_global}
                                            </div>
                                          </td>
                                          <td className="px-2 py-3 text-xs text-gray-600 capitalize">
                                            {eje.numero} • {neumatico.lado}
                                          </td>
                                          <td className="px-2 py-3">
                                            <input
                                              type="number"
                                              value={llanta?.presion_medida || ''}
                                              onChange={(e) => handleNeumaticoChange(neumatico.posicion_global, 'presion_medida', parseFloat(e.target.value) || 0)}
                                              min="0"
                                              max="200"
                                              step="0.5"
                                              className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            />
                                          </td>
                                          <td className="px-2 py-3">
                                            <div className="flex gap-1 justify-center">
                                              <button
                                                type="button"
                                                onClick={() => handleNeumaticoChange(neumatico.posicion_global, 'presion_estado', 'Bien')}
                                                className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                                                  llanta?.presion_estado === 'Bien' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                                                }`}
                                              >
                                                ✓
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleNeumaticoChange(neumatico.posicion_global, 'presion_estado', 'Mal')}
                                                className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                                                  llanta?.presion_estado === 'Mal' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
                                                }`}
                                              >
                                                ✗
                                              </button>
                                            </div>
                                          </td>
                                          <td className="px-2 py-3">
                                            <input
                                              type="number"
                                              value={llanta?.callo_medida || ''}
                                              onChange={(e) => handleNeumaticoChange(neumatico.posicion_global, 'callo_medida', parseFloat(e.target.value) || 0)}
                                              min="0"
                                              max="30"
                                              step="0.1"
                                              className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            />
                                          </td>
                                          <td className="px-2 py-3">
                                            <div className="flex gap-1 justify-center">
                                              <button
                                                type="button"
                                                onClick={() => handleNeumaticoChange(neumatico.posicion_global, 'callo_estado', 'Bien')}
                                                className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                                                  llanta?.callo_estado === 'Bien' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                                                }`}
                                              >
                                                ✓
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleNeumaticoChange(neumatico.posicion_global, 'callo_estado', 'Mal')}
                                                className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                                                  llanta?.callo_estado === 'Mal' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
                                                }`}
                                              >
                                                ✗
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile: Mini-cards compactos */}
                            <div className="md:hidden space-y-2">
                              {eje.neumaticos
                                .sort((a, b) => a.posicion_global - b.posicion_global)
                                .map((neumatico) => {
                                  const llanta = formData.neumaticos.find(l => l.posicion === neumatico.posicion_global);
                                  const tieneProblema = llanta?.presion_estado === 'Mal' || llanta?.callo_estado === 'Mal';
                                  
                                  return (
                                    <div 
                                      key={neumatico.posicion_global}
                                      className={`border-2 rounded-lg p-3 ${
                                        tieneProblema ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                                      }`}
                                    >
                                      {/* Header: Posición + Eje */}
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-10 h-10 rounded flex items-center justify-center font-bold ${
                                          tieneProblema ? 'bg-red-200 text-red-900' : 'bg-gray-200 text-gray-900'
                                        }`}>
                                          {neumatico.posicion_global}
                                        </div>
                                        <div className="text-xs text-gray-600 capitalize">
                                          Eje {eje.numero} • {neumatico.lado}
                                        </div>
                                      </div>

                                      {/* Grid 2x2: Presión y Callo */}
                                      <div className="grid grid-cols-2 gap-3">
                                        {/* Presión */}
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Presión (PSI)
                                          </label>
                                          <div className="flex gap-1">
                                            <input
                                              type="number"
                                              value={llanta?.presion_medida || ''}
                                              onChange={(e) => handleNeumaticoChange(neumatico.posicion_global, 'presion_medida', parseFloat(e.target.value) || 0)}
                                              min="0"
                                              max="200"
                                              step="0.5"
                                              className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                                              placeholder="95"
                                            />
                                            <div className="flex gap-1">
                                              <button
                                                type="button"
                                                onClick={() => handleNeumaticoChange(neumatico.posicion_global, 'presion_estado', 'Bien')}
                                                className={`w-8 h-8 rounded flex items-center justify-center ${
                                                  llanta?.presion_estado === 'Bien' ? 'bg-green-600 text-white' : 'bg-white border-2 border-gray-200'
                                                }`}
                                              >
                                                ✓
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleNeumaticoChange(neumatico.posicion_global, 'presion_estado', 'Mal')}
                                                className={`w-8 h-8 rounded flex items-center justify-center ${
                                                  llanta?.presion_estado === 'Mal' ? 'bg-red-600 text-white' : 'bg-white border-2 border-gray-200'
                                                }`}
                                              >
                                                ✗
                                              </button>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Callo */}
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Callo (mm)
                                          </label>
                                          <div className="flex gap-1">
                                            <input
                                              type="number"
                                              value={llanta?.callo_medida || ''}
                                              onChange={(e) => handleNeumaticoChange(neumatico.posicion_global, 'callo_medida', parseFloat(e.target.value) || 0)}
                                              min="0"
                                              max="30"
                                              step="0.1"
                                              className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                                              placeholder="8"
                                            />
                                            <div className="flex gap-1">
                                              <button
                                                type="button"
                                                onClick={() => handleNeumaticoChange(neumatico.posicion_global, 'callo_estado', 'Bien')}
                                                className={`w-8 h-8 rounded flex items-center justify-center ${
                                                  llanta?.callo_estado === 'Bien' ? 'bg-green-600 text-white' : 'bg-white border-2 border-gray-200'
                                                }`}
                                              >
                                                ✓
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleNeumaticoChange(neumatico.posicion_global, 'callo_estado', 'Mal')}
                                                className={`w-8 h-8 rounded flex items-center justify-center ${
                                                  llanta?.callo_estado === 'Mal' ? 'bg-red-600 text-white' : 'bg-white border-2 border-gray-200'
                                                }`}
                                              >
                                                ✗
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>

                    {/* 🆕 NUEVO - Comentarios de Neumáticos */}
                    {tipoRevision.revision_llantas?.permite_comentarios && (
                      <div className="pt-4 border-t-2 border-dashed border-gray-200 mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          Comentarios sobre los neumáticos
                        </label>
                        <textarea
                          value={formData.comentariosNeumaticos}
                          onChange={(e) => setFormData(prev => ({ ...prev, comentariosNeumaticos: e.target.value }))}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                          rows="3"
                          placeholder={tipoRevision.revision_llantas.placeholder_comentarios || 'Comentarios adicionales sobre los neumáticos...'}
                        ></textarea>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comentarios Generales */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-transparent">
                  <h2 className="text-base font-semibold text-gray-900">Comentarios generales</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Opcional - Observaciones adicionales</p>
                </div>
                <div className="p-4 sm:p-6">
                  <textarea
                    value={formData.comentarios}
                    onChange={(e) => setFormData(prev => ({ ...prev, comentarios: e.target.value }))}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    rows="4"
                    placeholder="Agrega observaciones generales, situaciones especiales, o cualquier detalle relevante..."
                  ></textarea>
                </div>
              </div>

              {/* 🆕 ANEXOS - Notas Importantes */}
              {tipoRevision.anexos && tipoRevision.anexos.trim() !== '' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-transparent">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">Notas Importantes</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Lee atentamente antes de completar la revisión</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="bg-white border border-blue-100 rounded-lg p-4">
                        <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                          {tipoRevision.anexos}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Estas notas son solo informativas y no se guardan en la revisión</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerta si hay problemas */}
              {tieneProblemas && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-900 mb-1">Problemas detectados</p>
                      <p className="text-xs text-yellow-700">
                        Se encontraron {itemsMal + neumaticosProblema} problema(s). Esta revisión requerirá aprobación del administrador.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones Finales - Sticky en Mobile */}
              <div className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 p-4 -mx-4 sm:mx-0 sm:relative sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:p-0">
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/operador/dashboard')}
                    className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-lg transition-all border border-gray-200"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Guardando...
                      </span>
                    ) : (
                      'Completar revisión'
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>

        </div>

      </main>
    </div>
  );
};

export default NuevaRevisionOperador;