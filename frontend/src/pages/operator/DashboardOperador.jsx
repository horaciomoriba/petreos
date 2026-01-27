import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/slices/userAuthSlice';
import { userAuthService } from '../../services/userAuthService';
import operadorService from '../../services/operator/operadorService';
import { showToast } from '../../utils/toast';

const DashboardOperador = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.userAuth);

  const [vehiculo, setVehiculo] = useState(null);
  const [pendientes, setPendientes] = useState([]);
  const [revisiones, setRevisiones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [vehiculoRes, pendientesRes, revisionesRes] = await Promise.all([
        operadorService.getMiVehiculo().catch(() => ({ vehiculo: null })),
        operadorService.getRevisionesPendientes().catch(() => ({ pendientes: [] })),
        operadorService.getMisRevisiones({ limit: 5 }).catch(() => ({ revisiones: [] }))
      ]);

      setVehiculo(vehiculoRes.vehiculo);
      setPendientes(pendientesRes.pendientes || []);
      setRevisiones(revisionesRes.revisiones || []);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      showToast.error('Error al cargar información');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    userAuthService.logout();
    showToast.success('Sesión cerrada exitosamente');
    navigate('/user/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm font-medium text-gray-600">Cargando información</p>
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
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900">Petreos</span>
                  <span className="hidden sm:inline text-xs text-gray-500 ml-2">Portal Operador</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="w-7 h-7 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {user?.nombre?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-900">{user?.nombre}</p>
                  <p className="text-xs text-gray-500">{user?.username}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Content (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Pendientes Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Revisiones pendientes</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {pendientes.length === 0 
                      ? 'Todo al día' 
                      : `${pendientes.length} ${pendientes.length === 1 ? 'revisión requiere' : 'revisiones requieren'} tu atención`
                    }
                  </p>
                </div>
                {pendientes.length > 0 && (
                  <span className="px-3 py-1.5 text-sm font-semibold text-orange-700 bg-orange-50 rounded-lg border border-orange-200">
                    {pendientes.length}
                  </span>
                )}
              </div>
              
              {pendientes.length > 0 ? (
                <div className="space-y-3">
                  {pendientes.map((item, index) => (
                    <div
                      key={index}
                      className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">{item.titulo}</h3>
                            <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                              {item.tipo}
                            </span>
                            {item.urgente && (
                              <span className="px-2 py-0.5 text-xs font-semibold text-red-700 bg-red-50 rounded border border-red-200 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Urgente
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{item.descripcion}</p>
                        </div>
                        <button
                          onClick={() => navigate('/operador/nueva-revision', { 
                            state: { tipoRevisionId: item.tipoRevisionId } 
                          })}
                          className="sm:ml-4 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          disabled={!item.tipoRevisionId}
                        >
                          Realizar revisión
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Sin revisiones pendientes</p>
                  <p className="text-xs text-gray-500">Todas tus revisiones están al día</p>
                </div>
              )}
            </div>

            {/* Historial Desktop */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Historial de revisiones</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Últimas 5 revisiones realizadas</p>
                    </div>
                    <button
                      onClick={() => navigate('/operador/mis-revisiones')}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
                    >
                      Ver todas
                    </button>
                  </div>
                </div>

                {revisiones.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {revisiones.map((revision, index) => (
                      <div
                        key={revision._id}
                        className="group px-5 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {revision.tipoRevision?.nombre || 'Revisión'}
                                </h3>
                                <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded flex-shrink-0">
                                  {revision.frecuencia}
                                </span>
                                {revision.aprobada && (
                                  <span className="px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-50 rounded border border-green-200 flex items-center gap-1 flex-shrink-0">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Aprobada
                                  </span>
                                )}
                                {!revision.aprobada && revision.tieneProblemas && (
                                  <span className="px-2 py-0.5 text-xs font-semibold text-red-700 bg-red-50 rounded border border-red-200 flex items-center gap-1 flex-shrink-0">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    Con problemas
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {new Date(revision.fecha).toLocaleDateString('es-MX', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  {revision.datosOperacionales?.kilometraje?.toLocaleString() || 'N/A'} km
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => navigate(`/operador/revisiones/${revision._id}`)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 flex items-center gap-1.5 flex-shrink-0"
                          >
                            Ver
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-10 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 bg-gray-50 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Sin revisiones aún</p>
                    <p className="text-xs text-gray-400">Completa tu primera revisión</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Acciones rápidas</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/operador/mis-revisiones')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Mis revisiones
                </button>

                <button
                  onClick={() => navigate('/operador/mi-vehiculo')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Mi vehículo
                </button>
              </div>
            </div>

            {/* Vehicle Summary */}
            {vehiculo ? (
              <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-medium text-gray-300 mb-1">Tu vehículo</div>
                    <div className="text-2xl font-bold tracking-tight">{vehiculo.placa}</div>
                  </div>
                  <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-t border-white/10">
                    <span className="text-gray-300">No. Económico</span>
                    <span className="font-semibold">{vehiculo.numeroEconomico}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-white/10">
                    <span className="text-gray-300">Kilometraje</span>
                    <span className="font-semibold">{vehiculo.kilometrajeActual?.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-white/10">
                    <span className="text-gray-300">Modelo</span>
                    <span className="font-semibold truncate ml-2">{vehiculo.marca} {vehiculo.modelo}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/operador/mi-vehiculo')}
                  className="w-full mt-4 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all backdrop-blur"
                >
                  Ver detalles completos
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Sin vehículo asignado</p>
              </div>
            )}

          </div>

          {/* Historial Mobile */}
          <div className="lg:hidden lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Historial de revisiones</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Últimas 5 revisiones</p>
                  </div>
                  <button
                    onClick={() => navigate('/operador/mis-revisiones')}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
                  >
                    Ver todas
                  </button>
                </div>
              </div>

              {revisiones.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {revisiones.map((revision, index) => (
                    <div
                      key={revision._id}
                      className="px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <h3 className="text-sm font-semibold text-gray-900">
                                {revision.tipoRevision?.nombre || 'Revisión'}
                              </h3>
                              <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                                {revision.frecuencia}
                              </span>
                              {revision.aprobada && (
                                <span className="px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-50 rounded border border-green-200">
                                  Aprobada
                                </span>
                              )}
                              {!revision.aprobada && revision.tieneProblemas && (
                                <span className="px-2 py-0.5 text-xs font-semibold text-red-700 bg-red-50 rounded border border-red-200">
                                  Con problemas
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{new Date(revision.fecha).toLocaleDateString('es-MX', {
                                day: 'numeric',
                                month: 'short'
                              })}</span>
                              <span>{revision.datosOperacionales?.kilometraje?.toLocaleString() || 'N/A'} km</span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => navigate(`/operador/revisiones/${revision._id}`)}
                          className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 bg-gray-50 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Sin revisiones aún</p>
                  <p className="text-xs text-gray-400">Completa tu primera revisión</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default DashboardOperador;