// src/pages/operator/DetalleRevisionOperador.jsx
// Actualizado con comentarios de sección, medidas de neumáticos y comentarios de neumáticos

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import operadorService from '../../services/operator/operadorService';
import { showToast } from '../../utils/toast';

const DetalleRevisionOperador = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevision();
  }, [id]);

  const loadRevision = async () => {
    try {
      setLoading(true);
      const response = await operadorService.getRevisionDetalle(id);
      setRevision(response.revision);
    } catch (error) {
      console.error('Error al cargar revisión:', error);
      showToast.error('Error al cargar la revisión');
      navigate('/operador/mis-revisiones');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCIÓN HELPER: Agrupar respuestas por sección
  const agruparPorSeccion = (respuestas) => {
    if (!respuestas || respuestas.length === 0) return [];

    const grupos = {};
    
    respuestas.forEach(resp => {
      const nombreSeccion = resp.seccion_nombre || 'General';
      const ordenSeccion = resp.seccion_orden ?? 999;
      
      if (!grupos[nombreSeccion]) {
        grupos[nombreSeccion] = {
          nombre: nombreSeccion,
          orden: ordenSeccion,
          respuestas: []
        };
      }
      grupos[nombreSeccion].respuestas.push(resp);
    });
    
    // Ordenar por seccion_orden
    return Object.values(grupos).sort((a, b) => a.orden - b.orden);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm font-medium text-gray-600">Cargando revisión</p>
        </div>
      </div>
    );
  }

  if (!revision) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-50 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Revisión no encontrada</h3>
          <p className="text-sm text-gray-600 mb-8">No se pudo cargar la información de esta revisión</p>
          <button 
            onClick={() => navigate('/operador/mis-revisiones')} 
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            Volver a Mis Revisiones
          </button>
        </div>
      </div>
    );
  }

  // ✅ Agrupar respuestas por sección
  const seccionesAgrupadas = agruparPorSeccion(revision.respuestas);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/operador/mis-revisiones')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Volver</span>
              </button>
              <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900">
                  {revision.tipo_revision?.nombre || 'Revisión'}
                </h1>
                <p className="text-xs text-gray-500">
                  {new Date(revision.fecha).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Estado Badge */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded capitalize">
                {revision.frecuencia}
              </span>
              {revision.aprobada ? (
                <span className="px-2.5 py-1 text-xs font-semibold text-green-700 bg-green-50 rounded border border-green-200 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Aprobada
                </span>
              ) : revision.tiene_problemas ? (
                <span className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 rounded border border-red-200 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Con problemas
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-semibold text-yellow-700 bg-yellow-50 rounded border border-yellow-200 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Pendiente
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sidebar - Info Rápida */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Card de Vehículo */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl p-5 text-white shadow-lg">
              <h3 className="text-sm font-semibold mb-4 opacity-90">Vehículo</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold">{revision.placa}</div>
                  <div className="text-sm opacity-75">#{revision.numero_economico}</div>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <div className="text-xs opacity-75 mb-1">Tipo</div>
                  <div className="text-sm font-medium capitalize">{revision.tipo_vehiculo}</div>
                </div>
              </div>
            </div>

            {/* Card de Operador */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Operador</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {revision.operador?.nombre}
                    </div>
                    <div className="text-xs text-gray-500">
                      {revision.operador?.licencia_vigente ? 'Licencia vigente' : 'Sin licencia'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats de Problemas */}
            {revision.tiene_problemas && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Problemas detectados</h3>
                <div className="space-y-3">
                  {revision.items_mal && revision.items_mal.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Items checklist</span>
                      <span className="text-lg font-bold text-red-600">{revision.items_mal.length}</span>
                    </div>
                  )}
                  {revision.llantas_mal && revision.llantas_mal.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Neumáticos</span>
                      <span className="text-lg font-bold text-red-600">{revision.llantas_mal.length}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info de Aprobación */}
            {revision.aprobada && revision.aprobada_por && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Aprobación</h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-500">Aprobada por</div>
                    <div className="text-sm font-medium text-gray-900">{revision.aprobada_por.nombre}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Fecha</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(revision.fecha_aprobacion).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Datos Operacionales */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-transparent">
                <h2 className="text-base font-semibold text-gray-900">Datos operacionales</h2>
                <p className="text-xs text-gray-500 mt-0.5">Al momento de la revisión</p>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      {revision.kilometraje_al_momento?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Kilometraje</div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      {revision.horas_motor_al_momento?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Horas motor</div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 capitalize">
                      {revision.nivel_combustible}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Combustible</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ CHECKLIST AGRUPADO POR SECCIONES */}
            {seccionesAgrupadas && seccionesAgrupadas.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-transparent">
                  <h2 className="text-base font-semibold text-gray-900">Checklist de inspección</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {revision.respuestas.length} items revisados en {seccionesAgrupadas.length} secciones
                  </p>
                </div>
                
                <div className="p-4 sm:p-6 space-y-6">
                  {seccionesAgrupadas.map((seccion, seccionIdx) => {
                    // 🆕 NUEVO - Buscar comentario de esta sección
                    const comentarioSeccion = revision.comentarios_secciones?.find(
                      cs => cs.seccion_nombre === seccion.nombre
                    );

                    return (
                      <div key={seccionIdx}>
                        {/* ✅ Header de Sección */}
                        <div className="mb-4">
                          <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg border border-gray-200">
                            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-white">{seccion.orden}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-900">{seccion.nombre}</h3>
                              <p className="text-xs text-gray-500">{seccion.respuestas.length} items</p>
                            </div>
                          </div>
                        </div>

                        {/* ✅ Items de la Sección */}
                        <div className="space-y-3 pl-0 sm:pl-4">
                          {seccion.respuestas.map((item, itemIdx) => (
                            <div
                              key={itemIdx}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                item.respuesta === 'Mal'
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <span className="flex-shrink-0 w-7 h-7 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center text-xs font-bold text-gray-700">
                                    {item.numero}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      {item.texto_pregunta}
                                    </p>
                                    {item.observaciones && (
                                      <p className="text-xs text-gray-600 mt-2 p-2 bg-white rounded border border-gray-200">
                                        <strong>Observaciones:</strong> {item.observaciones}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 flex-shrink-0 ${
                                  item.respuesta === 'Mal'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-green-600 text-white'
                                }`}>
                                  {item.respuesta === 'Mal' ? (
                                    <>
                                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                      </svg>
                                      Mal
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      Bien
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          ))}

                          {/* 🆕 NUEVO - Comentario de Sección */}
                          {comentarioSeccion?.comentario && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-blue-900 mb-1">Comentario de sección</p>
                                  <p className="text-xs text-blue-800 whitespace-pre-wrap">{comentarioSeccion.comentario}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 🆕 ACTUALIZADO - Neumáticos con medidas */}
            {revision.llantas && revision.llantas.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-transparent">
                  <h2 className="text-base font-semibold text-gray-900">Inspección de neumáticos</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{revision.llantas.length} neumáticos revisados</p>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {revision.llantas.map((llanta, index) => {
                      // 🆕 ACTUALIZADO - Verificar nuevos campos
                      const presionMala = llanta.presion_estado === 'Mal' || llanta.presion === 'Mal';
                      const calloMalo = llanta.callo_estado === 'Mal' || llanta.estado === 'Mal';
                      const tieneProblema = presionMala || calloMalo;

                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            tieneProblema
                              ? 'bg-red-50 border-red-300'
                              : 'bg-green-50 border-green-300'
                          }`}
                        >
                          {/* Header del neumático */}
                          <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                            tieneProblema ? 'bg-red-100' : 'bg-green-100'
                          }`}>
                            <span className="text-lg font-bold text-gray-900">
                              {llanta.posicion}
                            </span>
                          </div>

                          <div className="text-xs text-gray-600 mb-2 capitalize text-center">
                            Eje {llanta.eje_numero} • {llanta.lado}
                          </div>

                          {/* 🆕 NUEVO - Medidas y estados */}
                          <div className="space-y-1.5">
                            {/* Presión */}
                            <div className={`text-xs px-2 py-1 rounded ${
                              presionMala ? 'bg-red-200 text-red-900' : 'bg-green-200 text-green-900'
                            }`}>
                              <div className="font-semibold">Presión</div>
                              {llanta.presion_medida !== undefined && (
                                <div className="text-xs opacity-90">{llanta.presion_medida} PSI</div>
                              )}
                            </div>

                            {/* Callo */}
                            <div className={`text-xs px-2 py-1 rounded ${
                              calloMalo ? 'bg-red-200 text-red-900' : 'bg-green-200 text-green-900'
                            }`}>
                              <div className="font-semibold">Callo</div>
                              {llanta.callo_medida !== undefined && (
                                <div className="text-xs opacity-90">{llanta.callo_medida} mm</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 🆕 NUEVO - Comentarios de Neumáticos */}
                  {revision.comentarios_neumaticos && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-orange-900 mb-1">Comentarios sobre neumáticos</p>
                          <p className="text-xs text-orange-800 whitespace-pre-wrap">{revision.comentarios_neumaticos}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Comentarios Generales */}
            {revision.comentarios && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-transparent">
                  <h2 className="text-base font-semibold text-gray-900">Comentarios generales</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{revision.comentarios}</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
};

export default DetalleRevisionOperador;