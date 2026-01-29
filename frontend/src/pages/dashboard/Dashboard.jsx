import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import actividadService from '../../services/actividadService';
import toast from 'react-hot-toast';
import ChatbotPanel from '../../components/chatbot/ChatbotPanel';

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
      const response = await actividadService.getRecientes(5); // ← CAMBIADO DE 10 A 5
      
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
    
    if (diferencia < 60) return 'Ahora';
    if (diferencia < 3600) return `${Math.floor(diferencia / 60)}m`;
    if (diferencia < 86400) return `${Math.floor(diferencia / 3600)}h`;
    if (diferencia < 604800) return `${Math.floor(diferencia / 86400)}d`;
    return fechaActividad.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  const getBadgeUsuario = (tipo) => {
    if (tipo === 'admin') {
      return (
        <span className="px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
          Admin
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 rounded">
        Op
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
      icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z'
    },
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-10 h-10 border-3 border-gray-100 rounded-full"></div>
            <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm text-gray-600 mt-3">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header - Minimalista */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        {stats?.revisionesPendientes > 0 && (
          <Link
            to="/revisiones"
            className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
          >
            {stats.revisionesPendientes} pendiente{stats.revisionesPendientes !== 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* Stats Grid - Compacto */}
      <div className="grid grid-cols-3 gap-3">
        {statsConfig.map((stat) => (
          <div 
            key={stat.name} 
            className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
              </svg>
              <p className="text-xs text-gray-600 font-medium">{stat.name}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Actividad Reciente - Protagonismo */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Actividad Reciente</h2>
          <Link 
            to="/actividades"
            className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            Ver todo
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {loadingActividades ? (
          <div className="p-8 text-center">
            <div className="relative inline-block">
              <div className="w-8 h-8 border-3 border-gray-100 rounded-full"></div>
              <div className="w-8 h-8 border-3 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Cargando...</p>
          </div>
        ) : actividades.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">Sin actividad reciente</p>
            <p className="text-xs text-gray-400 mt-1">Las acciones aparecerán aquí</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {actividades.map((actividad) => (
              <div key={actividad._id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-gray-700">
                      {actividad.usuario_nombre.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {actividad.usuario_nombre}
                      </span>
                      {getBadgeUsuario(actividad.usuario_tipo)}
                      <span className="text-xs text-gray-500 ml-auto flex-shrink-0">
                        {formatearTiempoRelativo(actividad.fecha)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {actividad.descripcion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chatbot AI - Flotante */}
      <ChatbotPanel />
    </div>
  );
};

export default Dashboard;