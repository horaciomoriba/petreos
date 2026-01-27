import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import operadorService from '../../services/operator/operadorService';
import { showToast } from '../../utils/toast';

const MisRevisiones = () => {
  const navigate = useNavigate();

  const [revisiones, setRevisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0, limit: 10 });
  
  // Filtros
  const [filtroFrecuencia, setFiltroFrecuencia] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    loadRevisiones();
  }, [pagination.page, filtroFrecuencia, filtroEstado]);

  const loadRevisiones = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (filtroFrecuencia) params.frecuencia = filtroFrecuencia;
      if (filtroEstado) {
        if (filtroEstado === 'aprobada') params.aprobada = true;
        else if (filtroEstado === 'problemas') params.tiene_problemas = true;
      }

      const response = await operadorService.getMisRevisiones(params);
      
      setRevisiones(response.revisiones || []);
      setPagination(response.pagination || { page: 1, pages: 0, total: 0, limit: 10 });

    } catch (error) {
      console.error('Error al cargar revisiones:', error);
      showToast.error('Error al cargar revisiones');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const limpiarFiltros = () => {
    setFiltroFrecuencia('');
    setFiltroEstado('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading && revisiones.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm font-medium text-gray-600">Cargando revisiones</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/operador/dashboard')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>
              <div className="w-px h-6 bg-gray-200"></div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Mis Revisiones</h1>
                <p className="text-xs text-gray-500">{pagination.total} revisiones encontradas</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column - Filtros y Stats (1/4) */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Resumen</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Total</span>
                    <span className="text-2xl font-bold text-gray-900">{pagination.total}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Aprobadas</span>
                    <span className="text-lg font-bold text-green-600">
                      {revisiones.filter(r => r.aprobada).length}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Con problemas</span>
                    <span className="text-lg font-bold text-red-600">
                      {revisiones.filter(r => r.tiene_problemas && !r.aprobada).length}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Pendientes</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {revisiones.filter(r => !r.aprobada && !r.tiene_problemas).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
                {(filtroFrecuencia || filtroEstado) && (
                  <button
                    onClick={limpiarFiltros}
                    className="text-xs text-gray-600 hover:text-gray-900"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Frecuencia
                  </label>
                  <select
                    value={filtroFrecuencia}
                    onChange={(e) => {
                      setFiltroFrecuencia(e.target.value);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="">Todas</option>
                    <option value="diaria">Diarias</option>
                    <option value="mensual">Mensuales</option>
                    <option value="bimestral">Bimestrales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={filtroEstado}
                    onChange={(e) => {
                      setFiltroEstado(e.target.value);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    <option value="aprobada">Aprobadas</option>
                    <option value="problemas">Con problemas</option>
                    <option value="pendiente">Pendientes</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Lista (3/4) */}
          <div className="lg:col-span-3">
            
            {revisiones.length > 0 ? (
              <>
                <div className="space-y-4">
                  {revisiones.map((revision) => (
                    <div
                      key={revision._id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden"
                    >
                      {/* Header con estado prominente */}
                      <div className={`px-6 py-3 border-b flex items-center justify-between ${
                        revision.aprobada 
                          ? 'bg-gradient-to-r from-green-50 to-transparent border-green-200' 
                          : revision.tiene_problemas 
                          ? 'bg-gradient-to-r from-red-50 to-transparent border-red-200'
                          : 'bg-gradient-to-r from-gray-50 to-transparent border-gray-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            revision.aprobada 
                              ? 'bg-green-100' 
                              : revision.tiene_problemas 
                              ? 'bg-red-100'
                              : 'bg-gray-100'
                          }`}>
                            {revision.aprobada ? (
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : revision.tiene_problemas ? (
                              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              {revision.tipo_revision?.nombre || 'Revisión'}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-600">
                                {new Date(revision.fecha).toLocaleDateString('es-MX', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-white rounded border border-gray-200">
                                {revision.frecuencia}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Badge de estado */}
                        <div className="flex items-center gap-2">
                          {revision.aprobada && (
                            <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-lg border border-green-200">
                              Aprobada
                            </span>
                          )}
                          {!revision.aprobada && revision.tiene_problemas && (
                            <span className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-lg border border-red-200">
                              Con problemas
                            </span>
                          )}
                          {!revision.aprobada && !revision.tiene_problemas && (
                            <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-lg border border-yellow-200">
                              Pendiente
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Body con información detallada */}
                      <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                          {/* Kilometraje */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </div>
                              <div className="text-xs text-gray-500">Kilometraje</div>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {revision.kilometraje_al_momento?.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">kilómetros</div>
                          </div>

                          {/* Horas Motor */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="text-xs text-gray-500">Horas motor</div>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {revision.horas_motor_al_momento?.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">horas</div>
                          </div>

                          {/* Combustible */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                              <div className="text-xs text-gray-500">Combustible</div>
                            </div>
                            <div className="text-lg font-bold text-gray-900 capitalize">
                              {revision.nivel_combustible}
                            </div>
                            <div className="text-xs text-gray-600">nivel</div>
                          </div>

                          {/* Operador */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div className="text-xs text-gray-500">Operador</div>
                            </div>
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {revision.operador?.nombre}
                            </div>
                            <div className="text-xs text-gray-600">
                              {revision.operador?.licencia_vigente ? 'Licencia vigente' : 'Sin licencia'}
                            </div>
                          </div>
                        </div>

                        {/* Problemas detectados */}
                        {revision.tiene_problemas && (
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-6">
                            <div className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-red-900 mb-2">Problemas detectados</div>
                                <div className="space-y-2">
                                  {revision.items_mal && revision.items_mal.length > 0 && (
                                    <div>
                                      <div className="text-xs font-medium text-red-800 mb-1">
                                        Checklist ({revision.items_mal.length} items)
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {revision.items_mal.slice(0, 3).map((item, idx) => (
                                          <span key={idx} className="px-2 py-1 text-xs text-red-700 bg-red-100 rounded border border-red-200">
                                            #{item.numero}
                                          </span>
                                        ))}
                                        {revision.items_mal.length > 3 && (
                                          <span className="px-2 py-1 text-xs text-red-700 bg-red-100 rounded border border-red-200">
                                            +{revision.items_mal.length - 3} más
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {revision.llantas_mal && revision.llantas_mal.length > 0 && (
                                    <div>
                                      <div className="text-xs font-medium text-red-800 mb-1">
                                        Neumáticos ({revision.llantas_mal.length} posiciones)
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {revision.llantas_mal.slice(0, 5).map((llanta, idx) => (
                                          <span key={idx} className="px-2 py-1 text-xs text-red-700 bg-red-100 rounded border border-red-200">
                                            Pos. {llanta.posicion}
                                          </span>
                                        ))}
                                        {revision.llantas_mal.length > 5 && (
                                          <span className="px-2 py-1 text-xs text-red-700 bg-red-100 rounded border border-red-200">
                                            +{revision.llantas_mal.length - 5} más
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Comentarios (si hay) */}
                        {revision.comentarios && (
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                            <div className="text-xs font-medium text-gray-700 mb-1">Comentarios adicionales</div>
                            <p className="text-xs text-gray-600 line-clamp-2">{revision.comentarios}</p>
                          </div>
                        )}

                        {/* Footer con acción */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="text-xs text-gray-500">
                            {revision.aprobada && revision.fecha_aprobacion && (
                              <span>
                                Aprobada el {new Date(revision.fecha_aprobacion).toLocaleDateString('es-MX', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            )}
                            {!revision.aprobada && 'Pendiente de aprobación'}
                          </div>
                          <button
                            onClick={() => navigate(`/operador/revisiones/${revision._id}`)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all border border-gray-200 flex items-center gap-2"
                          >
                            Ver detalles completos
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                {pagination.pages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-lg transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {[...Array(pagination.pages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === pagination.pages ||
                          (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-9 h-9 rounded-lg font-medium text-sm transition-all ${
                                pagination.page === pageNum
                                  ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-sm'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === pagination.page - 2 ||
                          pageNum === pagination.page + 2
                        ) {
                          return <span key={pageNum} className="text-gray-400 px-1">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-lg transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-50 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sin revisiones
                </h3>
                <p className="text-sm text-gray-600 mb-8">
                  {filtroFrecuencia || filtroEstado 
                    ? 'No se encontraron revisiones con los filtros aplicados' 
                    : 'Aún no has realizado ninguna revisión'}
                </p>
                <button
                  onClick={() => navigate('/operador/dashboard')}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  Ir al Dashboard
                </button>
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
};

export default MisRevisiones;