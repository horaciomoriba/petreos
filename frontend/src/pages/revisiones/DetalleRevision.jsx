// src/pages/revisiones/DetalleRevision.jsx
// Actualizado con nuevos campos: comentarios de sección, medidas de neumáticos

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import revisionService from '../../services/revisionService';
import { showToast } from '../../utils/toast';

const DetalleRevision = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aprobando, setAprobando] = useState(false);
  const [descargandoPDF, setDescargandoPDF] = useState(false);
  const [regenerandoPDF, setRegenerandoPDF] = useState(false);

  useEffect(() => {
    loadRevision();
  }, [id]);

  const loadRevision = async () => {
    try {
      setLoading(true);
      const data = await revisionService.getByIdAdmin(id);
      setRevision(data);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al cargar revisión');
      navigate('/revisiones');
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

  const handleAprobar = async () => {
    if (!window.confirm('¿Aprobar esta revisión? Esto actualizará el kilometraje y horas del vehículo y generará el PDF.')) {
      return;
    }

    try {
      setAprobando(true);
      const response = await revisionService.aprobarRevision(id);
      
      if (response.pdfGenerado) {
        showToast.success('Revisión aprobada, vehículo actualizado y PDF generado');
      } else {
        showToast.success('Revisión aprobada y vehículo actualizado');
      }
      
      loadRevision();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al aprobar revisión');
    } finally {
      setAprobando(false);
    }
  };

  const handleDescargarPDF = async () => {
    try {
      setDescargandoPDF(true);
      await revisionService.descargarPDF(id);
      showToast.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      showToast.error('Error al descargar el PDF');
    } finally {
      setDescargandoPDF(false);
    }
  };

  const handleRegenerarPDF = async () => {
    if (!window.confirm('¿Regenerar el PDF de esta revisión?')) {
      return;
    }

    try {
      setRegenerandoPDF(true);
      await revisionService.regenerarPDF(id);
      showToast.success('PDF regenerado exitosamente');
      loadRevision();
    } catch (error) {
      console.error('Error al regenerar PDF:', error);
      showToast.error(error.response?.data?.message || 'Error al regenerar el PDF');
    } finally {
      setRegenerandoPDF(false);
    }
  };

  // Badge con significado (solo para estado crítico)
  const getBadgeEstado = (revision) => {
    if (revision.tiene_problemas) {
      return 'text-red-700 bg-red-50 border border-red-200';
    }
    if (revision.aprobada) {
      return 'text-green-700 bg-green-50 border border-green-200';
    }
    if (revision.estado === 'pendiente_revision') {
      return 'text-orange-700 bg-orange-50 border border-orange-200';
    }
    return 'text-gray-600 bg-gray-100 border border-gray-200';
  };

  const getTextoEstado = (revision) => {
    if (revision.tiene_problemas) return 'Con problemas';
    if (revision.aprobada) return 'Aprobada';
    if (revision.estado === 'pendiente_revision') return 'Pendiente';
    if (revision.estado === 'completada') return 'Completada';
    return revision.estado.replace('_', ' ');
  };

  // Sin emojis - solo texto
  const getNivelCombustibleTexto = (nivel) => {
    const textos = {
      lleno: 'Lleno (100%)',
      '3/4': '3/4 (75%)',
      '1/2': '1/2 (50%)',
      '1/4': '1/4 (25%)',
      reserva: 'Reserva (<10%)'
    };
    return textos[nivel] || nivel;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-sm font-medium text-gray-600 mt-4">Cargando revisión</p>
      </div>
    );
  }

  if (!revision) return null;

  // ✅ Agrupar respuestas por sección
  const seccionesAgrupadas = agruparPorSeccion(revision.respuestas);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/revisiones')}
        className="text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors inline-flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* Header - Compacto */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight capitalize">
                Revisión {revision.frecuencia}
              </h1>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getBadgeEstado(revision)}`}>
                {getTextoEstado(revision)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {revision.numero_economico}
              {' · '}
              {new Date(revision.fecha).toLocaleDateString('es-MX', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Botón aprobar */}
          {(revision.estado === 'completada' || revision.estado === 'pendiente_revision') && !revision.aprobada && (
            <button
              onClick={handleAprobar}
              disabled={aprobando}
              className="px-5 py-2.5 text-sm font-semibold text-white 
                bg-gradient-to-r from-gray-900 to-gray-700 
                hover:from-gray-800 hover:to-gray-600 
                rounded-lg transition-all shadow-sm hover:shadow-md
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aprobando ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Aprobando
                </span>
              ) : (
                'Aprobar Revisión'
              )}
            </button>
          )}
        </div>

        {/* Alertas - Minimalistas */}
        {revision.tiene_problemas && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-red-900 mb-1">Problemas detectados</p>
            <p className="text-xs text-red-700">
              {revision.items_mal?.length || 0} item{revision.items_mal?.length !== 1 ? 's' : ''} en mal estado
              {revision.llantas_mal?.length > 0 && (
                <> · {revision.llantas_mal.length} neumático{revision.llantas_mal.length !== 1 ? 's' : ''} con problemas</>
              )}
            </p>
          </div>
        )}

        {revision.aprobada && revision.aprobada_por && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-green-900 mb-1">Revisión aprobada</p>
            <p className="text-xs text-green-700">
              Por {revision.aprobada_por.nombre}
              {' · '}
              {new Date(revision.fecha_aprobacion).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>

      {/* Grid de información */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Operador */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Operador</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs font-medium text-gray-700 block mb-1">Nombre</span>
              <p className="text-gray-900">{revision.operador.nombre}</p>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <span className="text-xs font-medium text-gray-700 block mb-1">Licencia vigente</span>
              <p className="text-gray-900">
                {revision.operador.licencia_vigente ? 'Sí' : 'No'}
              </p>
            </div>
          </div>
        </div>

        {/* Datos Operacionales */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Datos Operacionales</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-xs font-medium text-gray-700 block mb-1">Kilometraje</span>
              <p className="text-lg font-bold text-gray-900">
                {revision.kilometraje_al_momento?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500">km</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-700 block mb-1">Horas de motor</span>
              <p className="text-lg font-bold text-gray-900">
                {revision.horas_motor_al_momento?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500">hrs</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-700 block mb-1">Combustible</span>
              <p className="text-gray-900 capitalize">
                {getNivelCombustibleTexto(revision.nivel_combustible)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* ✅ CHECKLIST AGRUPADO POR SECCIONES */}
        {seccionesAgrupadas && seccionesAgrupadas.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Checklist de Inspección
              <span className="text-xs font-normal text-gray-500 ml-2">
                {revision.respuestas.length} items en {seccionesAgrupadas.length} secciones
              </span>
            </h2>
            
            <div className="space-y-6">
              {seccionesAgrupadas.map((seccion, seccionIdx) => {
                // 🆕 NUEVO - Buscar comentario de esta sección
                const comentarioSeccion = revision.comentarios_secciones?.find(
                  cs => cs.seccion_nombre === seccion.nombre
                );

                return (
                  <div key={seccionIdx}>
                    {/* ✅ Header de Sección */}
                    <div className="mb-3">
                      <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-100 rounded-lg border border-gray-200">
                        <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-white">{seccion.orden}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900">{seccion.nombre}</h3>
                          <p className="text-xs text-gray-500">{seccion.respuestas.length} items</p>
                        </div>
                      </div>
                    </div>

                    {/* ✅ Items de la Sección */}
                    <div className="space-y-2 pl-0 sm:pl-4">
                      {seccion.respuestas.map((respuesta, itemIdx) => (
                        <div
                          key={itemIdx}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            respuesta.respuesta === 'Mal' 
                              ? 'bg-red-50 border-red-100' 
                              : 'border-gray-100'
                          }`}
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
                            {respuesta.numero}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{respuesta.texto_pregunta}</p>
                            {respuesta.observaciones && (
                              <p className="text-xs text-gray-600 mt-1">{respuesta.observaciones}</p>
                            )}
                            {respuesta.fecha_reporte_mantenimiento && (
                              <p className="text-xs text-red-700 mt-1">
                                Reportado: {new Date(respuesta.fecha_reporte_mantenimiento).toLocaleDateString('es-MX', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                            )}
                          </div>
                          <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${
                            respuesta.respuesta === 'Bien' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {respuesta.respuesta}
                          </span>
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

        {/* 🆕 ACTUALIZADO - Neumáticos con medidas numéricas */}
        {revision.llantas?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Neumáticos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {revision.llantas.map((llanta) => {
                // 🆕 ACTUALIZADO - Verificar nuevos campos
                const presionMala = llanta.presion_estado === 'Mal' || llanta.presion === 'Mal';
                const calloMalo = llanta.callo_estado === 'Mal' || llanta.estado === 'Mal';
                const tieneProblema = presionMala || calloMalo;
                
                return (
                  <div
                    key={llanta.posicion}
                    className={`p-4 rounded-lg border ${
                      tieneProblema
                        ? 'bg-red-50 border-red-200'
                        : 'border-gray-200'
                    }`}
                  >
                    {/* Header del neumático */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center ${
                        tieneProblema ? 'bg-red-100 border-red-400' : 'bg-gray-100 border-gray-300'
                      }`}>
                        <span className="text-sm font-bold text-gray-900">{llanta.posicion}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Eje {llanta.eje_numero} • {llanta.lado}
                      </div>
                    </div>

                    {/* 🆕 NUEVO - Medidas y estados */}
                    <div className="space-y-2 text-xs">
                      {/* Presión */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600">Presión</span>
                          <span className={`font-semibold ${
                            presionMala ? 'text-red-700' : 'text-gray-900'
                          }`}>
                            {llanta.presion_estado || llanta.presion || 'N/A'}
                          </span>
                        </div>
                        {llanta.presion_medida !== undefined && (
                          <div className="text-gray-500 text-xs">
                            Medida: {llanta.presion_medida} PSI
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-200"></div>

                      {/* Callo/Profundidad */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600">Callo</span>
                          <span className={`font-semibold ${
                            calloMalo ? 'text-red-700' : 'text-gray-900'
                          }`}>
                            {llanta.callo_estado || llanta.estado || 'N/A'}
                          </span>
                        </div>
                        {llanta.callo_medida !== undefined && (
                          <div className="text-gray-500 text-xs">
                            Profundidad: {llanta.callo_medida} mm
                          </div>
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
        )}

        {/* Comentarios Generales */}
        {revision.comentarios && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Comentarios generales</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{revision.comentarios}</p>
          </div>
        )}

        {/* PDF - Minimalista */}
        {revision.aprobada && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-gray-900 mb-1">Documento PDF</p>
                <p className="text-xs text-gray-500">
                  {revision.pdf_url 
                    ? `Generado ${new Date(revision.pdf_generado_en).toLocaleDateString('es-MX', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}`
                    : 'Aún no generado'
                  }
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {revision.pdf_url ? (
                  <>
                    <button
                      onClick={handleDescargarPDF}
                      disabled={descargandoPDF}
                      className="px-4 py-2 text-sm font-semibold text-white 
                        bg-gradient-to-r from-gray-900 to-gray-700 
                        hover:from-gray-800 hover:to-gray-600 
                        rounded-lg transition-all shadow-sm hover:shadow-md
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {descargandoPDF ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Descargando
                        </span>
                      ) : (
                        'Descargar PDF'
                      )}
                    </button>
                    <button
                      onClick={handleRegenerarPDF}
                      disabled={regenerandoPDF}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 
                        bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {regenerandoPDF ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                          Regenerando
                        </span>
                      ) : (
                        'Regenerar'
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleRegenerarPDF}
                    disabled={regenerandoPDF}
                    className="px-4 py-2 text-sm font-semibold text-white 
                      bg-gradient-to-r from-gray-900 to-gray-700 
                      hover:from-gray-800 hover:to-gray-600 
                      rounded-lg transition-all shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {regenerandoPDF ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generando
                      </span>
                    ) : (
                      'Generar PDF'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleRevision;