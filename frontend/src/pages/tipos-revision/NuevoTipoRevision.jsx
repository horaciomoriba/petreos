// src/pages/tipos-revision/NuevoTipoRevision.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tipoRevisionService from '../../services/tipoRevisionService';
import { showToast } from '../../utils/toast';

const NuevoTipoRevision = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Paso 1: Info básica
    nombre: '',
    tipo_vehiculo: 'olla_revolvedora',
    frecuencia: 'diaria',
    
    // Paso 2: Secciones y preguntas (SIMPLIFICADO)
    secciones: [
      {
        nombre: 'Revisión General',
        orden: 1,
        preguntas: [],
        permite_comentarios: true,  // 🆕 NUEVO
        placeholder_comentarios: 'Comentarios adicionales para esta sección...'  // 🆕 NUEVO
      }
    ],
    
    // Paso 3: Revisión de llantas (ACTUALIZADO)
    revision_llantas: {
      activa: true,
      campos: [
        { nombre: 'presion_medida', label: 'Presión', tipo: 'numero', unidad: 'PSI', rango_min: 80, rango_max: 120 },
        { nombre: 'presion_estado', label: 'Estado de Presión', tipo: 'bien_mal' },
        { nombre: 'callo_medida', label: 'Profundidad del Callo', tipo: 'numero', unidad: 'mm', rango_min: 3, rango_max: 15 },
        { nombre: 'callo_estado', label: 'Estado del Callo', tipo: 'bien_mal' }
      ],
      permite_comentarios: true,  // 🆕 NUEVO
      placeholder_comentarios: 'Comentarios adicionales sobre los neumáticos...'  // 🆕 NUEVO
    },
    
    // Paso 4: Configuración (SIMPLIFICADO)
    requiere_licencia_vigente: true,
    permite_comentarios: true
  });

  const [errors, setErrors] = useState({});
  const [seccionActual, setSeccionActual] = useState(0);

  const tiposVehiculo = [
    { value: 'olla_revolvedora', label: 'Olla Revolvedora' },
    { value: 'planta_de_concreto', label: 'Planta de Concreto' },
    { value: 'cargador_frontal', label: 'Cargador Frontal' },
    { value: 'camioneta_pickup', label: 'Camioneta Pickup' },
    { value: 'grua', label: 'Grúa' },
    { value: 'bomba_de_concreto', label: 'Bomba de Concreto' },
    { value: 'automovil', label: 'Automóvil' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ===== SECCIONES (SIMPLIFICADO) =====
  const agregarSeccion = () => {
    setFormData(prev => ({
      ...prev,
      secciones: [
        ...prev.secciones,
        {
          nombre: `Sección ${prev.secciones.length + 1}`,
          orden: prev.secciones.length + 1,
          preguntas: [],
          permite_comentarios: true,  // 🆕 NUEVO
          placeholder_comentarios: 'Comentarios adicionales para esta sección...'  // 🆕 NUEVO
        }
      ]
    }));
    setSeccionActual(formData.secciones.length);
  };

  const eliminarSeccion = (index) => {
    if (formData.secciones.length === 1) {
      showToast.error('Debe haber al menos una sección');
      return;
    }
    const nuevasSecciones = formData.secciones.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, secciones: nuevasSecciones }));
    setSeccionActual(0);
  };

  const actualizarSeccion = (index, campo, valor) => {
    const nuevasSecciones = [...formData.secciones];
    nuevasSecciones[index][campo] = valor;
    setFormData(prev => ({ ...prev, secciones: nuevasSecciones }));
  };

  // ===== PREGUNTAS (SIMPLIFICADO) =====
  const agregarPregunta = (seccionIndex) => {
    const nuevasSecciones = [...formData.secciones];
    const totalPreguntas = formData.secciones.reduce((sum, sec) => sum + sec.preguntas.length, 0);
    
    nuevasSecciones[seccionIndex].preguntas.push({
      numero: totalPreguntas + 1,
      texto: ''
    });
    
    setFormData(prev => ({ ...prev, secciones: nuevasSecciones }));
  };

  const actualizarPregunta = (seccionIndex, preguntaIndex, campo, valor) => {
    const nuevasSecciones = [...formData.secciones];
    nuevasSecciones[seccionIndex].preguntas[preguntaIndex][campo] = valor;
    setFormData(prev => ({ ...prev, secciones: nuevasSecciones }));
  };

  const eliminarPregunta = (seccionIndex, preguntaIndex) => {
    const nuevasSecciones = [...formData.secciones];
    nuevasSecciones[seccionIndex].preguntas = nuevasSecciones[seccionIndex].preguntas.filter(
      (_, i) => i !== preguntaIndex
    );
    
    // Renumerar todas las preguntas
    let numeroActual = 1;
    nuevasSecciones.forEach(seccion => {
      seccion.preguntas.forEach(pregunta => {
        pregunta.numero = numeroActual++;
      });
    });
    
    setFormData(prev => ({ ...prev, secciones: nuevasSecciones }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
      if (!formData.tipo_vehiculo) newErrors.tipo_vehiculo = 'Selecciona un tipo de vehículo';
      if (!formData.frecuencia) newErrors.frecuencia = 'Selecciona una frecuencia';
    }

    if (step === 2) {
      const totalPreguntas = formData.secciones.reduce((sum, sec) => sum + sec.preguntas.length, 0);
      if (totalPreguntas === 0) {
        newErrors.secciones = 'Debes agregar al menos una pregunta';
      }
      
      formData.secciones.forEach((seccion, si) => {
        if (!seccion.nombre.trim()) {
          newErrors[`seccion_${si}_nombre`] = 'El nombre de la sección es requerido';
        }
        seccion.preguntas.forEach((pregunta, pi) => {
          if (!pregunta.texto.trim()) {
            newErrors[`pregunta_${si}_${pi}`] = 'El texto de la pregunta es requerido';
          }
        });
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);

      // Generar código automático
      const codigo = `${formData.tipo_vehiculo}_${formData.frecuencia}`;
      
      const dataToSend = {
        ...formData,
        codigo
      };

      const response = await tipoRevisionService.create(dataToSend);
      
      showToast.success('Tipo de revisión creado exitosamente');
      navigate(`/tipos-revision/${response.tipoRevision._id}`);

    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al crear tipo de revisión');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Información Básica' },
    { number: 2, title: 'Secciones y Preguntas' },
    { number: 3, title: 'Revisión de Llantas' },
    { number: 4, title: 'Configuración' }
  ];

  const totalPreguntas = formData.secciones.reduce((sum, sec) => sum + sec.preguntas.length, 0);

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/tipos-revision')}
          className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a tipos de revisión
        </button>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nuevo Tipo de Revisión</h1>
        <p className="text-sm text-gray-600 mt-1">Crea un nuevo checklist para revisiones de vehículos</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                  currentStep >= step.number 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {currentStep > step.number ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="font-semibold">{step.number}</span>
                  )}
                </div>
                <p className={`text-xs font-medium text-center ${
                  currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-4 mb-8 ${
                  currentStep > step.number ? 'bg-gray-900' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 shadow-sm">
        
        {/* PASO 1: INFORMACIÓN BÁSICA */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Información Básica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Nombre del Checklist <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all ${
                    errors.nombre ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Ej: Bitácora Diaria - Olla Revolvedora"
                />
                {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
              </div>

              {/* Tipo de vehículo */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Tipo de Vehículo <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipo_vehiculo"
                  value={formData.tipo_vehiculo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                >
                  {tiposVehiculo.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>

              {/* Frecuencia */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Frecuencia <span className="text-red-500">*</span>
                </label>
                <select
                  name="frecuencia"
                  value={formData.frecuencia}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                >
                  <option value="diaria">Diaria</option>
                  <option value="mensual">Mensual</option>
                  <option value="bimestral">Bimestral</option>
                </select>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Código automático</p>
                  <p>El código se generará automáticamente: <strong>{formData.tipo_vehiculo}_{formData.frecuencia}</strong></p>
                  <p className="mt-2 text-xs">Este código debe ser único en el sistema.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: SECCIONES Y PREGUNTAS (SIMPLIFICADO) */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Secciones y Preguntas</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Total: {formData.secciones.length} sección(es), {totalPreguntas} pregunta(s)
                </p>
              </div>
              <button
                onClick={agregarSeccion}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Sección
              </button>
            </div>

            {errors.secciones && (
              <p className="text-sm text-red-600">{errors.secciones}</p>
            )}

            {/* Tabs de secciones */}
            <div className="border-b border-gray-200">
              <div className="flex gap-2 overflow-x-auto">
                {formData.secciones.map((seccion, index) => (
                  <button
                    key={index}
                    onClick={() => setSeccionActual(index)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      seccionActual === index
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {seccion.nombre} ({seccion.preguntas.length})
                  </button>
                ))}
              </div>
            </div>

            {/* Editor de sección actual */}
            {formData.secciones[seccionActual] && (
              <div className="space-y-4">
                {/* Header de sección */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="space-y-4 mb-4">
                    {/* Nombre de sección */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Nombre de la Sección</label>
                      <input
                        type="text"
                        value={formData.secciones[seccionActual].nombre}
                        onChange={(e) => actualizarSeccion(seccionActual, 'nombre', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* 🆕 NUEVO - Permitir comentarios */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`comentarios_seccion_${seccionActual}`}
                        checked={formData.secciones[seccionActual].permite_comentarios}
                        onChange={(e) => actualizarSeccion(seccionActual, 'permite_comentarios', e.target.checked)}
                        className="w-4 h-4 text-gray-600 rounded"
                      />
                      <label htmlFor={`comentarios_seccion_${seccionActual}`} className="text-xs font-medium text-gray-700">
                        Permitir comentarios en esta sección
                      </label>
                    </div>

                    {/* 🆕 NUEVO - Placeholder de comentarios */}
                    {formData.secciones[seccionActual].permite_comentarios && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Texto de ayuda para comentarios</label>
                        <input
                          type="text"
                          value={formData.secciones[seccionActual].placeholder_comentarios}
                          onChange={(e) => actualizarSeccion(seccionActual, 'placeholder_comentarios', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                          placeholder="Ej: Comentarios adicionales para esta sección..."
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => agregarPregunta(seccionActual)}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar Pregunta
                    </button>

                    {formData.secciones.length > 1 && (
                      <button
                        onClick={() => eliminarSeccion(seccionActual)}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all border border-red-200"
                      >
                        Eliminar Sección
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de preguntas */}
                <div className="space-y-2">
                  {formData.secciones[seccionActual].preguntas.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-600">
                      No hay preguntas. Click en "Agregar Pregunta" para comenzar.
                    </div>
                  ) : (
                    formData.secciones[seccionActual].preguntas.map((pregunta, pIndex) => (
                      <div key={pIndex} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-900">
                            {pregunta.numero}
                          </div>

                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Texto de la Pregunta</label>
                            <textarea
                              value={pregunta.texto}
                              onChange={(e) => actualizarPregunta(seccionActual, pIndex, 'texto', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                              rows="2"
                              placeholder="Ej: ¿El nivel de aceite está correcto?"
                            />
                          </div>

                          <button
                            onClick={() => eliminarPregunta(seccionActual, pIndex)}
                            className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 3: REVISIÓN DE LLANTAS (ACTUALIZADO) */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Revisión de Llantas</h2>
            
            <div className="space-y-4">
              {/* Activar/Desactivar */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="revision_llantas_activa"
                  checked={formData.revision_llantas.activa}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    revision_llantas: {
                      ...prev.revision_llantas,
                      activa: e.target.checked
                    }
                  }))}
                  className="w-4 h-4 text-gray-600 rounded"
                />
                <label htmlFor="revision_llantas_activa" className="text-sm font-medium text-gray-900">
                  Incluir revisión de llantas en este checklist
                </label>
              </div>

              {formData.revision_llantas.activa && (
                <>
                  {/* 🆕 NUEVO - Permitir comentarios en neumáticos */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="comentarios_neumaticos"
                      checked={formData.revision_llantas.permite_comentarios}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        revision_llantas: {
                          ...prev.revision_llantas,
                          permite_comentarios: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 text-gray-600 rounded"
                    />
                    <label htmlFor="comentarios_neumaticos" className="text-xs font-medium text-gray-700">
                      Permitir comentarios en la inspección de neumáticos
                    </label>
                  </div>

                  {/* 🆕 NUEVO - Placeholder de comentarios */}
                  {formData.revision_llantas.permite_comentarios && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Texto de ayuda para comentarios</label>
                      <input
                        type="text"
                        value={formData.revision_llantas.placeholder_comentarios}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          revision_llantas: {
                            ...prev.revision_llantas,
                            placeholder_comentarios: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        placeholder="Ej: Comentarios adicionales sobre los neumáticos..."
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Campos de inspección</p>
                        <p>La revisión de llantas incluye:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Presión medida (PSI) + Estado (Bien/Mal)</li>
                          <li>Profundidad del callo medida (mm) + Estado (Bien/Mal)</li>
                        </ul>
                        <p className="mt-2 text-xs">El operador revisará cada llanta según la configuración del vehículo.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* PASO 4: CONFIGURACIÓN (SIMPLIFICADO) */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuración</h2>
            
            <div className="space-y-4">
              {/* Licencia vigente */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="requiere_licencia"
                  name="requiere_licencia_vigente"
                  checked={formData.requiere_licencia_vigente}
                  onChange={handleChange}
                  className="w-4 h-4 text-gray-600 rounded"
                />
                <label htmlFor="requiere_licencia" className="text-sm font-medium text-gray-900">
                  Requiere licencia de conducir vigente
                </label>
              </div>

              {/* Permitir comentarios generales */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="permite_comentarios"
                  name="permite_comentarios"
                  checked={formData.permite_comentarios}
                  onChange={handleChange}
                  className="w-4 h-4 text-gray-600 rounded"
                />
                <label htmlFor="permite_comentarios" className="text-sm font-medium text-gray-900">
                  Permitir comentarios generales en la revisión
                </label>
              </div>

              {/* Resumen */}
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Resumen del Checklist</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium text-gray-900">{formData.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo de vehículo:</span>
                    <span className="font-medium text-gray-900 capitalize">{formData.tipo_vehiculo.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frecuencia:</span>
                    <span className="font-medium text-gray-900 capitalize">{formData.frecuencia}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Secciones:</span>
                    <span className="font-medium text-gray-900">{formData.secciones.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preguntas:</span>
                    <span className="font-medium text-gray-900">{totalPreguntas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revisión de llantas:</span>
                    <span className="font-medium text-gray-900">{formData.revision_llantas.activa ? 'Sí' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={currentStep === 1 ? () => navigate('/tipos-revision') : handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
            disabled={loading}
          >
            {currentStep === 1 ? 'Cancelar' : 'Atrás'}
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creando...
                </>
              ) : (
                'Crear Tipo de Revisión'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NuevoTipoRevision;