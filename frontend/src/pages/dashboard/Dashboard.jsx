import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import actividadService from '../../services/actividadService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActividades, setLoadingActividades] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await Promise.all([
      cargarStats(),
      cargarActividades()
    ]);
  };

  const cargarStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      toast.error('Error al cargar estadísticas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const cargarActividades = async () => {
    try {
      setLoadingActividades(true);
      const response = await actividadService.getRecientes(10);
      
      if (response.success) {
        setActividades(response.data);
      }
    } catch (error) {
      console.error('Error cargando actividades:', error);
    } finally {
      setLoadingActividades(false);
    }
  };

  const formatearTiempoRelativo = (fecha) => {
    const ahora = new Date();
    const fechaActividad = new Date(fecha);
    const diferencia = Math.floor((ahora - fechaActividad) / 1000);
    
    if (diferencia < 60) return 'Hace un momento';
    if (diferencia < 3600) return `Hace ${Math.floor(diferencia / 60)} min`;
    if (diferencia < 86400) return `Hace ${Math.floor(diferencia / 3600)} hora${Math.floor(diferencia / 3600) !== 1 ? 's' : ''}`;
    if (diferencia < 604800) return `Hace ${Math.floor(diferencia / 86400)} día${Math.floor(diferencia / 86400) !== 1 ? 's' : ''}`;
    return fechaActividad.toLocaleDateString('es-MX');
  };

  const getBadgeUsuario = (tipo) => {
    if (tipo === 'admin') {
      return (
        <span className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 rounded">
          Admin
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 rounded border border-blue-200">
        Operador
      </span>
    );
  };

  const statsConfig = [
    { 
      name: 'Administradores', 
      value: stats?.totalAdmins || 0,
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
    { 
      name: 'Sedes Activas', 
      value: stats?.totalSedes || 0,
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    },
    { 
      name: 'Vehículos', 
      value: stats?.totalVehiculos || 0,
      icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16v6 M13 16l4-3m-4 3l-4-3m4 3L9 7m0 0a2 2 0 11-4 0 2 2 0 014 0zM19 7a2 2 0 11-4 0 2 2 0 014 0z'
    },
  ];

  if (loading) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm font-medium text-gray-600 mt-4">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-primary-900 mb-2">Dashboard</h1>
        <p className="text-sm text-primary-600">Bienvenido, {user?.nombre}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsConfig.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl border border-primary-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 bg-primary-50 rounded-lg">
                <svg className="w-5 h-5 text-primary-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-primary-900 mb-1">{stat.value}</p>
            <p className="text-sm text-primary-600">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Actividad Reciente */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-primary-200 overflow-hidden">
          {/* ⭐ HEADER CON BOTÓN "VER TODO" */}
          <div className="px-6 py-4 border-b border-primary-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-900">Actividad Reciente</h2>
            <Link 
              to="/actividades"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5"
            >
              Ver todo
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {loadingActividades ? (
            <div className="p-12 text-center">
              <div className="relative inline-block">
                <div className="w-10 h-10 border-4 border-gray-100 rounded-full"></div>
                <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
              </div>
              <p className="text-sm text-gray-600 mt-3">Cargando actividades...</p>
            </div>
          ) : actividades.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 mx-auto mb-3 bg-gray-50 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Sin actividad reciente
              </p>
              <p className="text-xs text-gray-400">
                Las acciones del sistema aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {actividades.map((actividad) => (
                  <div key={actividad._id} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary-900">
                        {actividad.usuario_nombre.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-primary-900">
                          {actividad.usuario_nombre}
                        </span>
                        {getBadgeUsuario(actividad.usuario_tipo)}
                      </div>
                      <p className="text-sm text-primary-600">
                        {actividad.descripcion}
                      </p>
                      <p className="text-xs text-primary-500 mt-0.5">
                        {formatearTiempoRelativo(actividad.fecha)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="space-y-4">
          {/* User Info Card */}
          <div className="bg-white rounded-xl border border-primary-200 p-5">
            <h3 className="text-sm font-semibold text-primary-900 mb-4">Información de Sesión</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-primary-600 mb-1">Usuario</p>
                <p className="text-sm font-mono text-primary-900">@{user?.username}</p>
              </div>
              <div>
                <p className="text-xs text-primary-600 mb-1">Nombre</p>
                <p className="text-sm font-semibold text-primary-900">{user?.nombre}</p>
              </div>
              <div>
                <p className="text-xs text-primary-600 mb-1">Rol</p>
                <span className="badge-primary capitalize text-xs">
                  {user?.rol?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Revisiones Pendientes (si hay) */}
          {stats?.revisionesPendientes > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-900 mb-1">
                    Revisiones Pendientes
                  </p>
                  <p className="text-xs text-orange-700">
                    Hay {stats.revisionesPendientes} revisión{stats.revisionesPendientes !== 1 ? 'es' : ''} esperando aprobación
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;