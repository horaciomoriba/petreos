// src/pages/tipos-revision/EditarTipoRevision.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tipoRevisionService from '../../services/tipoRevisionService';
import { showToast } from '../../utils/toast';

const EditarTipoRevision = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    secciones: [],
    revision_llantas: {
      activa: false,
      permite_comentarios: false,
      placeholder_comentarios: ''
    },
    requiere_licencia_vigente: false,
    permite_comentarios: false,
    anexos: '',
    activo: true
  });

  // Estados originales para comparación (opcional)
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    loadTipoRevision();
  }, [id]);

  const loadTipoRevision = async () => {
    try {
      setLoading(true);
      const data = await tipoRevisionService.getById(id);
      
      // Preparar datos para el formulario
      const formattedData = {
        nombre: data.nombre || '',
        secciones: data.secciones || [],
        revision_llantas: {
          activa: data.revision_llantas?.activa || false,
          permite_comentarios: data.revision_llantas?.permite_comentarios || false,
          placeholder_comentarios: data.revision_llantas?.placeholder_comentarios || ''
        },
        requiere_licencia_vigente: data.requiere_licencia_vigente || false,
        permite_comentarios: data.permite_comentarios || false,
        anexos: data.anexos || '',
        activo: data.activo !== undefined ? data.activo : true
      };

      setFormData(formattedData);
      setOriginalData(data); // Guardar datos originales

    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al cargar tipo de revisión');
      navigate('/tipos-revision');
    } finally {
      setLoading(false);
    }
  };

  const insertarTemplateAnexos = () => {
    const template = `Notas Generales:

  • Los trabajos se realizarán en lo posible con equipo en paro cumpliendo las medidas de seguridad correspondientes (candadeo).

  • Las purgas de trampas de agua en filtros de aire se harán con frecuencias de acuerdo a necesidades en sitio.

  • Limpieza puntual y colocación de pintura en donde se requiera para evitar puntos y propagación de corrosión.

  • En caso de anomalías en cualquiera de los puntos revisados se tendrán que corregir de acuerdo a su importancia de funcionamiento, así como de su programación si fuera el caso.

  IMPORTANTE: Reportar de inmediato cualquier condición insegura o falla crítica al supervisor.`;
    
    setFormData(prev => ({ ...prev, anexos: template }));
    showToast.success('Template insertado');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre.trim()) {
      showToast.error('El nombre es requerido');
      return;
    }

    if (formData.secciones.length === 0) {
      showToast.error('Debe agregar al menos una sección');
      return;
    }

    // Validar que cada sección tenga al menos una pregunta
    for (let i = 0; i < formData.secciones.length; i++) {
      const seccion = formData.secciones[i];
      if (!seccion.nombre.trim()) {
        showToast.error(`La sección ${i + 1} debe tener un nombre`);
        return;
      }
      if (!seccion.preguntas || seccion.preguntas.length === 0) {
        showToast.error(`La sección "${seccion.nombre}" debe tener al menos una pregunta`);
        return;
      }
    }

    try {
      setSubmitting(true);

      await tipoRevisionService.update(id, formData);

      showToast.success('Tipo de revisión actualizado exitosamente');
      navigate(`/tipos-revision/${id}`);

    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al actualizar tipo de revisión');
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // HANDLERS PARA SECCIONES
  // ==========================================

  const agregarSeccion = () => {
    setFormData(prev => ({
      ...prev,
      secciones: [
        ...prev.secciones,
        {
          nombre: '',
          preguntas: [],
          permite_comentarios: false,
          placeholder_comentarios: ''
        }
      ]
    }));
  };

  const eliminarSeccion = (index) => {
    setFormData(prev => ({
      ...prev,
      secciones: prev.secciones.filter((_, i) => i !== index)
    }));
  };

  const actualizarSeccion = (index, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      secciones: prev.secciones.map((sec, i) =>
        i === index ? { ...sec, [campo]: valor } : sec
      )
    }));
  };

  // ==========================================
  // HANDLERS PARA PREGUNTAS
  // ==========================================

  const agregarPregunta = (seccionIndex) => {
    setFormData(prev => {
      const nuevasSecciones = [...prev.secciones];
      const seccion = { ...nuevasSecciones[seccionIndex] };
      
      const nuevoNumero = (seccion.preguntas?.length || 0) + 1;
      
      seccion.preguntas = [
        ...(seccion.preguntas || []),
        {
          numero: nuevoNumero,
          texto: ''
        }
      ];
      
      nuevasSecciones[seccionIndex] = seccion;
      
      return { ...prev, secciones: nuevasSecciones };
    });
  };

  const actualizarPregunta = (seccionIndex, preguntaIndex, valor) => {
    setFormData(prev => {
      const nuevasSecciones = [...prev.secciones];
      const seccion = { ...nuevasSecciones[seccionIndex] };
      
      seccion.preguntas = seccion.preguntas.map((p, i) =>
        i === preguntaIndex ? { ...p, texto: valor } : p
      );
      
      nuevasSecciones[seccionIndex] = seccion;
      
      return { ...prev, secciones: nuevasSecciones };
    });
  };

  const eliminarPregunta = (seccionIndex, preguntaIndex) => {
    setFormData(prev => {
      const nuevasSecciones = [...prev.secciones];
      const seccion = { ...nuevasSecciones[seccionIndex] };
      
      // Eliminar pregunta
      seccion.preguntas = seccion.preguntas.filter((_, i) => i !== preguntaIndex);
      
      // Renumerar
      seccion.preguntas = seccion.preguntas.map((p, i) => ({
        ...p,
        numero: i + 1
      }));
      
      nuevasSecciones[seccionIndex] = seccion;
      
      return { ...prev, secciones: nuevasSecciones };
    });
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-sm font-medium text-gray-600 mt-4">Cargando tipo de revisión</p>
      </div>
    );
  }

  const getTipoVehiculoTexto = (tipo) => {
    const textos = {
      olla_revolvedora: 'Olla Revolvedora',
      planta_de_concreto: 'Planta de Concreto',
      cargador_frontal: 'Cargador Frontal',
      camioneta_pickup: 'Camioneta Pickup',
      grua: 'Grúa',
      bomba_de_concreto: 'Bomba de Concreto',
      automovil: 'Automóvil'
    };
    return textos[tipo] || tipo;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/tipos-revision/${id}`)}
          className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Cancelar y volver
        </button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
              Editar Tipo de Revisión
            </h1>
            <p className="text-sm text-gray-600">
              Modifica la configuración de este tipo de revisión
            </p>
          </div>
        </div>
      </div>

      {/* Info Card - NO EDITABLE */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 mb-2">Información del tipo de revisión</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-blue-700">Código:</span>
                <p className="font-semibold text-blue-900 mt-0.5">{originalData?.codigo}</p>
              </div>
              <div>
                <span className="text-blue-700">Tipo de vehículo:</span>
                <p className="font-semibold text-blue-900 mt-0.5">
                  {getTipoVehiculoTexto(originalData?.tipo_vehiculo)}
                </p>
              </div>
              <div>
                <span className="text-blue-700">Frecuencia:</span>
                <p className="font-semibold text-blue-900 mt-0.5 capitalize">
                  {originalData?.frecuencia}
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-3">
              ℹ️ Estos campos no se pueden modificar una vez creado el tipo de revisión
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Información Básica */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Información Básica</h2>
          
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Nombre del tipo de revisión <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Ej: Revisión Diaria Olla"
                required
              />
            </div>

            {/* Opciones Generales */}
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-900 mb-3">Opciones</label>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.requiere_licencia_vigente}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      requiere_licencia_vigente: e.target.checked 
                    }))}
                    className="mt-0.5 w-4 h-4 text-gray-900 rounded focus:ring-gray-900 transition-all"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      Requiere licencia vigente
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      El operador debe tener licencia de conducir vigente para realizar esta revisión
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.permite_comentarios}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      permite_comentarios: e.target.checked 
                    }))}
                    className="mt-0.5 w-4 h-4 text-gray-900 rounded focus:ring-gray-900 transition-all"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      Permite comentarios generales
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      El operador podrá agregar comentarios adicionales al finalizar la revisión
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      activo: e.target.checked 
                    }))}
                    className="mt-0.5 w-4 h-4 text-gray-900 rounded focus:ring-gray-900 transition-all"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      Tipo de revisión activo
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Si está desactivado, no estará disponible para crear nuevas revisiones
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Secciones y Preguntas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Secciones y Preguntas
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                {formData.secciones.length} {formData.secciones.length === 1 ? 'sección' : 'secciones'} • {' '}
                {formData.secciones.reduce((sum, sec) => sum + (sec.preguntas?.length || 0), 0)} preguntas
              </p>
            </div>
            <button
              type="button"
              onClick={agregarSeccion}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nueva Sección
            </button>
          </div>

          {formData.secciones.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto mb-3 bg-gray-50 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">No hay secciones agregadas</p>
              <p className="text-xs text-gray-400">Agrega al menos una sección con preguntas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.secciones.map((seccion, sIndex) => (
                <div key={sIndex} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                  
                  {/* Header de Sección */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={seccion.nombre}
                        onChange={(e) => actualizarSeccion(sIndex, 'nombre', e.target.value)}
                        className="w-full px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                        placeholder="Nombre de la sección"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarSeccion(sIndex)}
                      className="px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all border border-red-200"
                    >
                      Eliminar
                    </button>
                  </div>

                  {/* Opciones de Sección */}
                  <div className="mb-4">
                    <label className="flex items-start gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={seccion.permite_comentarios || false}
                        onChange={(e) => actualizarSeccion(sIndex, 'permite_comentarios', e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-gray-900 rounded focus:ring-gray-900"
                      />
                      <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                        Permite comentarios en esta sección
                      </span>
                    </label>
                    
                    {seccion.permite_comentarios && (
                      <input
                        type="text"
                        value={seccion.placeholder_comentarios || ''}
                        onChange={(e) => actualizarSeccion(sIndex, 'placeholder_comentarios', e.target.value)}
                        className="w-full mt-2 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                        placeholder="Texto de ayuda para el campo de comentarios"
                      />
                    )}
                  </div>

                  {/* Preguntas */}
                  <div className="space-y-2">
                    {seccion.preguntas?.map((pregunta, pIndex) => (
                      <div key={pIndex} className="flex items-start gap-2 bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
                          {pregunta.numero}
                        </div>
                        <input
                          type="text"
                          value={pregunta.texto}
                          onChange={(e) => actualizarPregunta(sIndex, pIndex, e.target.value)}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          placeholder="Texto de la pregunta"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => eliminarPregunta(sIndex, pIndex)}
                          className="px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => agregarPregunta(sIndex)}
                      className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-all border border-gray-300 border-dashed flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar pregunta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revisión de Llantas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Revisión de Neumáticos</h2>
          
          <label className="flex items-start gap-3 cursor-pointer group mb-4">
            <input
              type="checkbox"
              checked={formData.revision_llantas.activa}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                revision_llantas: {
                  ...prev.revision_llantas,
                  activa: e.target.checked
                }
              }))}
              className="mt-0.5 w-4 h-4 text-gray-900 rounded focus:ring-gray-900 transition-all"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                Incluir revisión de neumáticos
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                El operador deberá inspeccionar todos los neumáticos del vehículo (presión, profundidad de callo, estado)
              </p>
            </div>
          </label>

          {formData.revision_llantas.activa && (
            <div className="pl-7 space-y-3">
              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.revision_llantas.permite_comentarios}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    revision_llantas: {
                      ...prev.revision_llantas,
                      permite_comentarios: e.target.checked
                    }
                  }))}
                  className="mt-0.5 w-4 h-4 text-gray-900 rounded focus:ring-gray-900"
                />
                <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                  Permite comentarios en neumáticos
                </span>
              </label>

              {formData.revision_llantas.permite_comentarios && (
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
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Texto de ayuda para comentarios de neumáticos"
                />
              )}
            </div>
          )}
        </div>

        {/* 🆕 ANEXOS - Notas Importantes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Anexos / Notas Importantes
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Instrucciones que el operador debe leer antes de completar la revisión
              </p>
            </div>
            <button
              type="button"
              onClick={insertarTemplateAnexos}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Insertar Template
            </button>
          </div>

          <textarea
            value={formData.anexos}
            onChange={(e) => setFormData(prev => ({ ...prev, anexos: e.target.value }))}
            rows={8}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all font-mono resize-y"
            placeholder="Notas Generales:

• Los trabajos se realizarán con equipo en paro...
• Las purgas de trampas de agua...

IMPORTANTE: Reportar cualquier anomalía..."
          />

          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-2">
              <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-800">
                Los anexos se mostrarán al operador al final del formulario de revisión. 
                No se guardan en la revisión, solo son informativos.
              </p>
            </div>
          </div>

          {/* Vista previa (si hay contenido) */}
          {formData.anexos && formData.anexos.trim() !== '' && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Vista Previa:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="bg-white border border-blue-100 rounded-lg p-3">
                  <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {formData.anexos}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(`/tipos-revision/${id}`)}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando cambios...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarTipoRevision;