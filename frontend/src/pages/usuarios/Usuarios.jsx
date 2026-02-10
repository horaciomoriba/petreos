import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { operadorService } from '../../services/operadorService';
import { showToast } from '../../utils/toast';
import TablaAdmins from '../../components/usuarios/TablaAdmins';
import TablaOperadores from '../../components/usuarios/TablaOperadores';

const Usuarios = () => {
  const [tabActual, setTabActual] = useState('admins');
  const [admins, setAdmins] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // Filtros
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [filtroSede, setFiltroSede] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [tabActual, filtroRol, filtroActivo, filtroSede]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (tabActual === 'admins') {
        const filtros = {};
        if (filtroRol) filtros.rol = filtroRol;
        if (filtroActivo !== '') filtros.activo = filtroActivo;
        if (filtroSede) filtros.sedeId = filtroSede;
        
        const response = await adminService.getAll(filtros);
        setAdmins(response.data);
      } else {
        const filtros = {};
        if (filtroActivo !== '') filtros.activo = filtroActivo;
        if (filtroSede) filtros.sedeId = filtroSede;
        
        const response = await operadorService.getAll(filtros);
        console.log("response", response)
        setOperadores(response.data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showToast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, tipo) => {
    if (!window.confirm('¿Estás seguro de desactivar este usuario?')) return;
    
    try {
      if (tipo === 'admin') {
        await adminService.delete(id);
        showToast.success('Administrador desactivado');
      } else {
        await operadorService.delete(id);
        showToast.success('Operador desactivado');
      }
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      showToast.error(error.response?.data?.msg || 'Error al desactivar usuario');
    }
  };

  const handleReactivar = async (id) => {
    try {
      await adminService.reactivar(id);
      showToast.success('Administrador reactivado');
      cargarDatos();
    } catch (error) {
      console.error('Error al reactivar:', error);
      showToast.error('Error al reactivar administrador');
    }
  };

  const limpiarFiltros = () => {
    setFiltroRol('');
    setFiltroActivo('');
    setFiltroSede('');
    setMostrarFiltros(false);
  };

  // Contar filtros activos
  const contarFiltrosActivos = () => {
    let count = 0;
    if (filtroRol) count++;
    if (filtroActivo !== '') count++;
    if (filtroSede) count++;
    return count;
  };

  const filtrosActivos = contarFiltrosActivos();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-xs text-gray-600 mt-0.5">Administra admins y operadores del sistema</p>
          </div>
          
          {/* Botón nuevo (Desktop) */}
          <Link
            to={tabActual === 'admins' ? '/usuarios/nuevo-admin' : '/usuarios/nuevo-operador'}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold 
              text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {tabActual === 'admins' ? 'Nuevo Admin' : 'Nuevo Operador'}
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setTabActual('admins')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${
              tabActual === 'admins'
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Administradores
            {tabActual === 'admins' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
            )}
          </button>
          <button
            onClick={() => setTabActual('operadores')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${
              tabActual === 'operadores'
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Operadores
            {tabActual === 'operadores' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
            )}
          </button>
        </div>
      </div>

      {/* Barra de filtros compacta */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
        {/* Primera fila: Acciones principales */}
        <div className="p-3">
          <div className="flex items-center gap-2">
            {/* Botón Filtros con indicador */}
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
        </div>

        {/* Sección de filtros colapsable */}
        <div 
          className={`border-t border-gray-100 transition-all duration-300 ease-in-out ${
            mostrarFiltros ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="p-3 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Filtro Estado */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Estado
                </label>
                <select
                  value={filtroActivo}
                  onChange={(e) => setFiltroActivo(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                    focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Todos los estados</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>

              {/* Filtro Rol (solo admins) */}
              {tabActual === 'admins' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Rol
                  </label>
                  <select
                    value={filtroRol}
                    onChange={(e) => setFiltroRol(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                      focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="">Todos los roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="jefe_mantenimiento">Jefe Mantenimiento</option>
                    <option value="mecanico">Mecánico</option>
                    <option value="supervisor">Supervisor</option>
                  </select>
                </div>
              )}
            </div>

            {/* Acciones de filtros */}
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

      {/* Botón flotante "Nuevo" en mobile */}
      <Link
        to={tabActual === 'admins' ? '/usuarios/nuevo-admin' : '/usuarios/nuevo-operador'}
        className="sm:hidden fixed bottom-6 right-4 w-14 h-14 bg-gray-900 hover:bg-gray-800 
          text-white rounded-full shadow-lg flex items-center justify-center z-30
          transition-all active:scale-95"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </Link>

      {/* Contenido de tabs */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-10 h-10 border-3 border-gray-100 rounded-full"></div>
              <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="text-sm text-gray-600 mt-3">Cargando usuarios...</p>
          </div>
        </div>
      ) : (
        <>
          {tabActual === 'admins' ? (
            <TablaAdmins
              admins={admins}
              onEliminar={(id) => handleEliminar(id, 'admin')}
              onReactivar={handleReactivar}
              onRecargar={cargarDatos}
            />
          ) : (
            <TablaOperadores
              operadores={operadores}
              onEliminar={(id) => handleEliminar(id, 'operador')}
              onRecargar={cargarDatos}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Usuarios;