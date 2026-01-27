import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import { showToast } from '../../utils/toast';

const DashboardLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    showToast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  // Navegación principal
  const mainNavigation = [
    { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'usuarios', name: 'Usuarios', path: '/usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'sedes', name: 'Sedes', path: '/sedes', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'areas', name: 'Áreas', path: '/areas', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z' },
  ];

  const secondaryNavigation = [
    { 
      id: 'vehiculos', 
      name: 'Vehículos', 
      path: '/vehiculos', 
      icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2' 
    },
    { 
      id: 'revisiones', 
      name: 'Revisiones', 
      path: '/revisiones', 
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' 
    },
    { 
      id: 'reparaciones', 
      name: 'Reparaciones', 
      path: '/reparaciones', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' 
    },
    { 
      id: 'tipos-revision', 
      name: 'Tipos de Revisión', 
      path: '/tipos-revision', 
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' 
    },
    { 
      id: 'inventario', 
      name: 'Inventario', 
      path: '/inventario', 
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' 
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      
      {/* Sidebar Desktop */}
      <div className={`hidden lg:flex lg:flex-col lg:border-r lg:border-primary-200 lg:bg-white transition-all duration-300 ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'
      }`}>
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className={`flex items-center h-16 px-6 border-b border-primary-200 ${
            sidebarCollapsed ? 'justify-center px-0' : 'justify-between'
          }`}>
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-900 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-primary-900">Petreos</h1>
                    <p className="text-xs text-primary-500 font-mono">Gestión Industrial</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Minimizar sidebar"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
              </>
            ) : (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Expandir sidebar"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-3 space-y-6">
              {/* Main Navigation */}
              <div>
                {!sidebarCollapsed && (
                  <p className="px-3 text-xs font-semibold text-primary-500 uppercase tracking-wider mb-2">
                    Principal
                  </p>
                )}
                <div className="space-y-1">
                  {mainNavigation.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        isActive(item.path)
                          ? 'bg-primary-900 text-white shadow-sm'
                          : 'text-primary-700 hover:bg-primary-50 hover:text-primary-900'
                      } ${sidebarCollapsed ? 'justify-center' : ''}`}
                      title={sidebarCollapsed ? item.name : ''}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      {!sidebarCollapsed && <span>{item.name}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Navigation */}
              <div>
                {!sidebarCollapsed && (
                  <p className="px-3 text-xs font-semibold text-primary-500 uppercase tracking-wider mb-2">
                    Recursos
                  </p>
                )}
                <div className="space-y-1">
                  {secondaryNavigation.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        isActive(item.path)
                          ? 'bg-primary-900 text-white shadow-sm'
                          : 'text-primary-700 hover:bg-primary-50 hover:text-primary-900'
                      } ${sidebarCollapsed ? 'justify-center' : ''}`}
                      title={sidebarCollapsed ? item.name : ''}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      {!sidebarCollapsed && <span>{item.name}</span>}
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          {/* User Section */}
          <div className="border-t border-primary-200 p-4">
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">
                      {user?.nombre?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary-900 truncate">
                      {user?.nombre || 'Admin'}
                    </p>
                    <p className="text-xs text-primary-600 truncate">
                      {user?.username || 'username'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Cerrar sesión"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user?.nombre?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-primary-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
            {/* Mobile Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-primary-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-base font-bold text-primary-900">Petreos</h1>
                  <p className="text-xs text-primary-500 font-mono">Gestión</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="px-3 space-y-6">
                <div>
                  <p className="px-3 text-xs font-semibold text-primary-500 uppercase tracking-wider mb-2">Principal</p>
                  <div className="space-y-1">
                    {mainNavigation.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                          isActive(item.path)
                            ? 'bg-primary-900 text-white shadow-sm'
                            : 'text-primary-700 hover:bg-primary-50 hover:text-primary-900'
                        }`}
                      >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="px-3 text-xs font-semibold text-primary-500 uppercase tracking-wider mb-2">Recursos</p>
                  <div className="space-y-1">
                    {secondaryNavigation.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                          isActive(item.path)
                            ? 'bg-primary-900 text-white shadow-sm'
                            : 'text-primary-700 hover:bg-primary-50 hover:text-primary-900'
                        }`}
                      >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </nav>
            </div>

            {/* Mobile User */}
            <div className="border-t border-primary-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user?.nombre?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary-900 truncate">{user?.nombre || 'Admin'}</p>
                  <p className="text-xs text-primary-600 truncate">{user?.username || 'username'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-primary-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex badge-primary capitalize">
              {user?.rol?.replace('_', ' ')}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;