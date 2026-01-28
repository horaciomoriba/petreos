import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import operadorService from '../../services/operator/operadorService';
import { showToast } from '../../utils/toast';

const MisRevisiones = () => {
  const navigate = useNavigate();

  const [revisiones, setRevisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
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
    setMostrarFiltros(false);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Contar filtros activos
  const contarFiltrosActivos = () => {
    let count = 0;
    if (filtroFrecuencia) count++;
    if (filtroEstado) count++;
    return count;
  };

  const filtrosActivos = contarFiltrosActivos();

  // Stats calculados
  const stats = {
    aprobadas: revisiones.filter(r => r.aprobada).length,
    problemas: revisiones.filter(r => r.tiene_problemas && !r.aprobada).length,
    pendientes: revisiones.filter(r => !r.aprobada && !r.tiene_problemas).length
  };

  if (loading && revisiones.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 border-3 border-gray-100 rounded-full"></div>
            <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header compacto */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/operador/dashboard')}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>
              <div className="w-px h-5 bg-gray-200"></div>
              <div>
                <h1 className="text-base font-bold text-gray-900">Mis Revisiones</h1>
                <p className="text-xs text-gray-500">{pagination.total} total</p>
              </div>
            </div>

            {/* Stats inline - Desktop */}
            <div className="hidden md:flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600">Aprobadas:</span>
                <span className="font-semibold text-green-700">{stats.aprobadas}</span>
              </div>
              <div className="w-px h-4 bg-gray-200"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600">Problemas:</span>
                <span className="font-semibold text-red-700">{stats.problemas}</span>
              </div>
              <div className="w-px h-4 bg-gray-200"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600">Pendientes:</span>
                <span className="font-semibold text-yellow-700">{stats.pendientes}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        
        {/* Stats mobile */}
        <div className="md:hidden grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Aprobadas</p>
            <p className="text-xl font-bold text-green-700">{stats.aprobadas}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Problemas</p>
            <p className="text-xl font-bold text-red-700">{stats.problemas}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Pendientes</p>
            <p className="text-xl font-bold text-yellow-700">{stats.pendientes}</p>
          </div>
        </div>

        {/* Filtros colapsables */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
          <div className="p-3">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="relative px-3 py-2 text-sm font-medium text-gray-700 
                bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200
                flex items-center gap-1.5"
            >
              <svg 
                className={`w-4 h-4 transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">Filtros</span>
              {filtrosActivos > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {filtrosActivos}
                </span>
              )}
            </button>
          </div>

          {/* Sección colapsable */}
          <div 
            className={`border-t border-gray-100 transition-all duration-300 ease-in-out ${
              mostrarFiltros ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <div className="p-3 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Frecuencia
                  </label>
                  <select
                    value={filtroFrecuencia}
                    onChange={(e) => {
                      setFiltroFrecuencia(e.target.value);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                      focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="">Todas</option>
                    <option value="diaria">Diarias</option>
                    <option value="mensual">Mensuales</option>
                    <option value="bimestral">Bimestrales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Estado
                  </label>
                  <select
                    value={filtroEstado}
                    onChange={(e) => {
                      setFiltroEstado(e.target.value);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                      focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="">Todos</option>
                    <option value="aprobada">Aprobadas</option>
                    <option value="problemas">Con problemas</option>
                    <option value="pendiente">Pendientes</option>
                  </select>
                </div>
              </div>

              {filtrosActivos > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={limpiarFiltros}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de revisiones */}
        {revisiones.length > 0 ? (
          <>
            <div className="space-y-3">
              {revisiones.map((revision) => (
                <div
                  key={revision._id}
                  onClick={() => navigate(`/operador/revisiones/${revision._id}`)}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden 
                    hover:border-gray-300 transition-colors cursor-pointer"
                >
                  {/* Header compacto con estado */}
                  <div className={`px-4 py-2 border-b flex items-center justify-between ${
                    revision.aprobada 
                      ? 'bg-green-50 border-green-200' 
                      : revision.tiene_problemas 
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {revision.tipo_revision?.nombre || 'Revisión'}
                      </h3>
                      <span className="px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-white rounded flex-shrink-0">
                        {revision.frecuencia}
                      </span>
                    </div>

                    {/* Badge de estado */}
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded flex-shrink-0 ${
                      revision.aprobada 
                        ? 'text-green-700 bg-green-100 border border-green-200'
                        : revision.tiene_problemas
                        ? 'text-red-700 bg-red-100 border border-red-200'
                        : 'text-yellow-700 bg-yellow-100 border border-yellow-200'
                    }`}>
                      {revision.aprobada ? 'Aprobada' : revision.tiene_problemas ? 'Problemas' : 'Pendiente'}
                    </span>
                  </div>

                  {/* Body compacto */}
                  <div className="p-4">
                    {/* Metadata en una línea */}
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>{new Date(revision.fecha).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}</span>
                      <span className="text-gray-300">·</span>
                      <span>{revision.kilometraje_al_momento?.toLocaleString()} km</span>
                      <span className="text-gray-300">·</span>
                      <span>{revision.horas_motor_al_momento?.toLocaleString()} hrs</span>
                      <span className="text-gray-300 hidden sm:inline">·</span>
                      <span className="hidden sm:inline capitalize">{revision.nivel_combustible}</span>
                    </div>

                    {/* Problemas - Solo si existen */}
                    {revision.tiene_problemas && (
                      <div className="p-2 bg-red-50 rounded border border-red-200 mb-3">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1 text-xs text-red-900">
                            {revision.items_mal && revision.items_mal.length > 0 && (
                              <span>{revision.items_mal.length} item{revision.items_mal.length !== 1 ? 's' : ''} checklist</span>
                            )}
                            {revision.items_mal && revision.items_mal.length > 0 && revision.llantas_mal && revision.llantas_mal.length > 0 && (
                              <span className="mx-1">·</span>
                            )}
                            {revision.llantas_mal && revision.llantas_mal.length > 0 && (
                              <span>{revision.llantas_mal.length} neumático{revision.llantas_mal.length !== 1 ? 's' : ''}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Comentarios - Solo si existen */}
                    {revision.comentarios && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3 p-2 bg-gray-50 rounded">
                        {revision.comentarios}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {revision.aprobada && revision.fecha_aprobacion
                          ? `Aprobada ${new Date(revision.fecha_aprobacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`
                          : 'Pendiente de aprobación'
                        }
                      </span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación compacta */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 
                    rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                
                <div className="flex items-center gap-1">
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
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            pagination.page === pageNum
                              ? 'bg-gray-900 text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                      return <span key={pageNum} className="text-gray-400 px-1">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 
                    rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Sin revisiones</p>
            <p className="text-xs text-gray-500">
              {filtrosActivos > 0 
                ? 'No se encontraron revisiones' 
                : 'Aún no has realizado ninguna revisión'}
            </p>
          </div>
        )}

      </main>
    </div>
  );
};

export default MisRevisiones;