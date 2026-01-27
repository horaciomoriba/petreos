import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { operadorService } from '../../services/operadorService';
import toast from 'react-hot-toast';
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
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, tipo) => {
    if (!window.confirm('¿Estás seguro de desactivar este usuario?')) return;
    
    try {
      if (tipo === 'admin') {
        await adminService.delete(id);
        toast.success('Administrador desactivado');
      } else {
        await operadorService.delete(id);
        toast.success('Operador desactivado');
      }
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error(error.response?.data?.msg || 'Error al desactivar usuario');
    }
  };

  const handleReactivar = async (id) => {
    try {
      await adminService.reactivar(id);
      toast.success('Administrador reactivado');
      cargarDatos();
    } catch (error) {
      console.error('Error al reactivar:', error);
      toast.error('Error al reactivar administrador');
    }
  };

  const limpiarFiltros = () => {
    setFiltroRol('');
    setFiltroActivo('');
    setFiltroSede('');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra admins y operadores del sistema</p>
        </div>
        
        <Link
          to={tabActual === 'admins' ? '/usuarios/nuevo-admin' : '/usuarios/nuevo-operador'}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          {tabActual === 'admins' ? 'Nuevo Admin' : 'Nuevo Operador'}
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setTabActual('admins')}
            className={`pb-3 px-4 font-medium transition-colors ${
              tabActual === 'admins'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Administradores
          </button>
          <button
            onClick={() => setTabActual('operadores')}
            className={`pb-3 px-4 font-medium transition-colors ${
              tabActual === 'operadores'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Operadores
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          {tabActual === 'admins' && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="super_admin">Super Admin</option>
                <option value="jefe_mantenimiento">Jefe Mantenimiento</option>
                <option value="mecanico">Mecánico</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
          )}

          <button
            onClick={limpiarFiltros}
            className="mt-6 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Contenido de tabs */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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