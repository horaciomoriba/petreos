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
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">Petreos</span>
            </div>

            <div className="flex items-center gap-2">
              {/* User info - Desktop only */}
              <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {user?.nombre?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-900">{user?.nombre}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 
                  hover:bg-gray-100 rounded-lg transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Pendientes Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Revisiones pendientes</h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {pendientes.length === 0 
                      ? 'Todo al día' 
                      : `${pendientes.length} pendiente${pendientes.length !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
                {pendientes.length > 0 && (
                  <span className="px-2 py-1 text-xs font-semibold text-orange-700 bg-orange-50 rounded border border-orange-200">
                    {pendientes.length}
                  </span>
                )}
              </div>
              
              {pendientes.length > 0 ? (
                <div className="space-y-3">
                  {pendientes.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900">{item.titulo}</h3>
                            <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                              {item.tipo}
                            </span>
                            {item.urgente && (
                              <span className="px-2 py-0.5 text-xs font-semibold text-red-700 bg-red-50 rounded border border-red-200">
                                Urgente
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1">{item.descripcion}</p>
                        </div>
                        <button
                          onClick={() => navigate('/operador/nueva-revision', { 
                            state: { tipoRevisionId: item.tipoRevisionId } 
                          })}
                          className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 
                            rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!item.tipoRevisionId}
                        >
                          Realizar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Todo al día</p>
                  <p className="text-xs text-gray-500">Sin revisiones pendientes</p>
                </div>
              )}
            </div>

            {/* Historial Desktop */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Historial</h2>
                    <p className="text-xs text-gray-500">Últimas 5 revisiones</p>
                  </div>
                  <button
                    onClick={() => navigate('/operador/mis-revisiones')}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Ver todas
                  </button>
                </div>

                {revisiones.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {revisiones.map((revision, index) => (
                      <div
                        key={revision._id}
                        onClick={() => navigate(`/operador/revisiones/${revision._id}`)}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {revision.tipoRevision?.nombre || 'Revisión'}
                                </h3>
                                <span className="px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded flex-shrink-0">
                                  {revision.frecuencia}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{new Date(revision.fecha).toLocaleDateString('es-MX', {
                                  day: 'numeric',
                                  month: 'short'
                                })}</span>
                                <span className="text-gray-300">·</span>
                                <span>{revision.datosOperacionales?.kilometraje?.toLocaleString() || 'N/A'} km</span>
                                {revision.aprobada && (
                                  <>
                                    <span className="text-gray-300">·</span>
                                    <span className="text-green-700 font-medium">Aprobada</span>
                                  </>
                                )}
                                {!revision.aprobada && revision.tieneProblemas && (
                                  <>
                                    <span className="text-gray-300">·</span>
                                    <span className="text-red-700 font-medium">Problemas</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">Sin revisiones</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Acciones</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/operador/mis-revisiones')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 
                    hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Mis revisiones
                </button>

                <button
                  onClick={() => navigate('/operador/mi-vehiculo')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 
                    hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Mi vehículo
                </button>
              </div>
            </div>

            {/* Vehicle Summary */}
            {vehiculo ? (
              <div className="bg-gray-900 rounded-lg p-4 text-white">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Tu vehículo</div>
                    <div className="text-xl font-bold">{vehiculo.placa}</div>
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-t border-white/10">
                    <span className="text-gray-400">No. Econ</span>
                    <span className="font-medium">{vehiculo.numeroEconomico}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-t border-white/10">
                    <span className="text-gray-400">Km</span>
                    <span className="font-medium">{vehiculo.kilometrajeActual?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-t border-white/10">
                    <span className="text-gray-400">Modelo</span>
                    <span className="font-medium truncate ml-2">{vehiculo.marca} {vehiculo.modelo}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/operador/mi-vehiculo')}
                  className="w-full mt-3 px-3 py-2 text-sm font-medium text-white bg-white/10 
                    hover:bg-white/20 rounded-lg transition-colors"
                >
                  Ver detalles
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Sin vehículo asignado</p>
              </div>
            )}

          </div>

          {/* Historial Mobile */}
          <div className="lg:hidden lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Historial</h2>
                  <p className="text-xs text-gray-500">Últimas 5 revisiones</p>
                </div>
                <button
                  onClick={() => navigate('/operador/mis-revisiones')}
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Ver todas
                </button>
              </div>

              {revisiones.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {revisiones.map((revision, index) => (
                    <div
                      key={revision._id}
                      onClick={() => navigate(`/operador/revisiones/${revision._id}`)}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {revision.tipoRevision?.nombre || 'Revisión'}
                            </h3>
                            <span className="px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                              {revision.frecuencia}
                            </span>
                            {revision.aprobada && (
                              <span className="px-1.5 py-0.5 text-xs font-medium text-green-700 bg-green-50 rounded">
                                Aprobada
                              </span>
                            )}
                            {!revision.aprobada && revision.tieneProblemas && (
                              <span className="px-1.5 py-0.5 text-xs font-medium text-red-700 bg-red-50 rounded">
                                Problemas
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{new Date(revision.fecha).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short'
                            })}</span>
                            <span className="text-gray-300">·</span>
                            <span>{revision.datosOperacionales?.kilometraje?.toLocaleString() || 'N/A'} km</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Sin revisiones</p>
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