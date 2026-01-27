// pages/Actividades.jsx
import { useState, useEffect } from 'react';
import actividadService from '../../services/actividadService';
import toast from 'react-hot-toast';

const Actividades = () => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const [filtros, setFiltros] = useState({
    tipo: '',
    usuario_tipo: '',
    fecha_desde: '',
    fecha_hasta: ''
  });

  useEffect(() => {
    cargarActividades();
  }, [pagination.page]);

  const cargarActividades = async () => {
    try {
      setLoading(true);
      const response = await actividadService.getAll({
        ...filtros,
        page: pagination.page,
        limit: pagination.limit
      });

      if (response.success) {
        setActividades(response.data);
        setPagination(prev => ({
          ...prev,
          ...response.pagination
        }));
      }
    } catch (error) {
      console.error('Error cargando actividades:', error);
      toast.error('Error al cargar actividades');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const aplicarFiltros = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    cargarActividades();
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipo: '',
      usuario_tipo: '',
      fecha_desde: '',
      fecha_hasta: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(() => cargarActividades(), 100);
  };

  const cambiarPagina = (nuevaPagina) => {
    setPagination(prev => ({ ...prev, page: nuevaPagina }));
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeTipo = (tipo) => {
    const tipoFormateado = tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (tipo.includes('crear')) {
      return <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-50 rounded border border-green-200">{tipoFormateado}</span>;
    }
    if (tipo.includes('actualizar')) {
      return <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 rounded border border-blue-200">{tipoFormateado}</span>;
    }
    if (tipo.includes('eliminar')) {
      return <span className="px-2 py-0.5 text-xs font-medium text-red-700 bg-red-50 rounded border border-red-200">{tipoFormateado}</span>;
    }
    if (tipo.includes('aprobar')) {
      return <span className="px-2 py-0.5 text-xs font-medium text-purple-700 bg-purple-50 rounded border border-purple-200">{tipoFormateado}</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 rounded">{tipoFormateado}</span>;
  };

  const getBadgeUsuario = (tipo) => {
    if (tipo === 'admin') {
      return <span className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 rounded">Admin</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 rounded border border-blue-200">Operador</span>;
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Historial de Actividades</h1>
        <p className="text-sm text-gray-600">Registro completo de acciones del sistema</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Filtros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Tipo de Actividad */}
          <div>
            <label className="label">Tipo de Actividad</label>
            <select
              name="tipo"
              value={filtros.tipo}
              onChange={handleFiltroChange}
              className="input"
            >
              <option value="">Todos</option>
              <option value="crear_revision">Crear Revisión</option>
              <option value="aprobar_revision">Aprobar Revisión</option>
              <option value="crear_vehiculo">Crear Vehículo</option>
              <option value="actualizar_vehiculo">Actualizar Vehículo</option>
              <option value="eliminar_vehiculo">Eliminar Vehículo</option>
              <option value="crear_sede">Crear Sede</option>
              <option value="actualizar_sede">Actualizar Sede</option>
              <option value="eliminar_sede">Eliminar Sede</option>
              <option value="crear_admin">Crear Admin</option>
              <option value="actualizar_admin">Actualizar Admin</option>
              <option value="eliminar_admin">Eliminar Admin</option>
            </select>
          </div>

          {/* Tipo de Usuario */}
          <div>
            <label className="label">Tipo de Usuario</label>
            <select
              name="usuario_tipo"
              value={filtros.usuario_tipo}
              onChange={handleFiltroChange}
              className="input"
            >
              <option value="">Todos</option>
              <option value="admin">Admin</option>
              <option value="operador">Operador</option>
            </select>
          </div>

          {/* Fecha Desde */}
          <div>
            <label className="label">Fecha Desde</label>
            <input
              type="date"
              name="fecha_desde"
              value={filtros.fecha_desde}
              onChange={handleFiltroChange}
              className="input"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="label">Fecha Hasta</label>
            <input
              type="date"
              name="fecha_hasta"
              value={filtros.fecha_hasta}
              onChange={handleFiltroChange}
              className="input"
            />
          </div>
        </div>

        {/* Botones de filtro */}
        <div className="flex gap-3">
          <button
            onClick={aplicarFiltros}
            className="btn-primary"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={limpiarFiltros}
            className="btn-secondary"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total de Actividades</p>
            <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Mostrando</p>
            <p className="text-lg font-semibold text-gray-900">
              {actividades.length} de {pagination.total}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Actividades */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="relative inline-block">
              <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="text-sm font-medium text-gray-600 mt-4">Cargando actividades...</p>
          </div>
        ) : actividades.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-3 bg-gray-50 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">No hay actividades</p>
            <p className="text-xs text-gray-400">Intenta ajustar los filtros</p>
          </div>
        ) : (
          <>
            {/* Tabla Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Descripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {actividades.map((actividad) => (
                    <tr key={actividad._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">{formatearFecha(actividad.fecha)}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getBadgeTipo(actividad.tipo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-gray-900">
                              {actividad.usuario_nombre.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{actividad.usuario_nombre}</p>
                            {getBadgeUsuario(actividad.usuario_tipo)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{actividad.descripcion}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards Mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {actividades.map((actividad) => (
                <div key={actividad._id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    {getBadgeTipo(actividad.tipo)}
                    <span className="text-xs text-gray-500">{formatearFecha(actividad.fecha)}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-900">
                        {actividad.usuario_nombre.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{actividad.usuario_nombre}</p>
                      {getBadgeUsuario(actividad.usuario_tipo)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{actividad.descripcion}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Paginación */}
      {!loading && actividades.length > 0 && pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Página {pagination.page} de {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => cambiarPagina(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => cambiarPagina(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Actividades;