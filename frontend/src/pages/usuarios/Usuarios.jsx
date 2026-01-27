import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { operadorService } from '../../services/operadorService';
import { showToast } from '../../utils/toast';
import TablaAdmins from '../../components/usuarios/TablaAdmins';
import TablaOperadores from '../../components/usuarios/TablaOperadores';

const Usuarios = () => {
  const [tabActual, setTabActual] = useState('admins'); // 'admins' | 'operadores'
  const [admins, setAdmins] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
  };

  const hasFiltrosActivos = filtroRol || filtroActivo !== '' || filtroSede;

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 mb-2">Gestión de Usuarios</h1>
          <p className="text-sm text-primary-600">Administra admins y operadores del sistema</p>
        </div>
        
        <Link
          to={tabActual === 'admins' ? '/usuarios/nuevo-admin' : '/usuarios/nuevo-operador'}
          className="btn-primary flex items-center gap-2 justify-center w-full sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {tabActual === 'admins' ? 'Nuevo Admin' : 'Nuevo Operador'}
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-primary-200 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setTabActual('admins')}
            className={`pb-3 px-4 font-semibold transition-colors relative ${
              tabActual === 'admins'
                ? 'text-primary-900'
                : 'text-primary-500 hover:text-primary-700'
            }`}
          >
            Administradores
            {tabActual === 'admins' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-900"></div>
            )}
          </button>
          <button
            onClick={() => setTabActual('operadores')}
            className={`pb-3 px-4 font-semibold transition-colors relative ${
              tabActual === 'operadores'
                ? 'text-primary-900'
                : 'text-primary-500 hover:text-primary-700'
            }`}
          >
            Operadores
            {tabActual === 'operadores' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-900"></div>
            )}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-primary-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro Estado */}
          <div>
            <label className="label">Estado</label>
            <select
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
              className="input"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          {/* Filtro Rol (solo admins) */}
          {tabActual === 'admins' && (
            <div>
              <label className="label">Rol</label>
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                <option value="super_admin">Super Admin</option>
                <option value="jefe_mantenimiento">Jefe Mantenimiento</option>
                <option value="mecanico">Mecánico</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
          )}

          {/* Botón limpiar filtros */}
          {hasFiltrosActivos && (
            <div className="flex items-end">
              <button
                onClick={limpiarFiltros}
                className="btn-outline w-full"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido de tabs */}
      {loading ? (
        <div className="bg-white rounded-xl border border-primary-200 p-12">
          <div className="flex items-center justify-center">
            <div className="spinner h-8 w-8"></div>
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