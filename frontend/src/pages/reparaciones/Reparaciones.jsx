import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import reparacionService, { CATEGORIAS_REPARACION, ESTADOS_REPARACION } from '../../services/reparacionService';
import vehiculoService from '../../services/vehiculoService';
import { showToast } from '../../utils/toast';

const Reparaciones = () => {
  const navigate = useNavigate();
  const [reparaciones, setReparaciones] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 100,
    pages: 0
  });

  const [filtros, setFiltros] = useState({
    vehiculo: '',
    categoria: '',
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
    page: 1,
    limit: 100
  });

  useEffect(() => {
    loadVehiculos();
  }, []);

  useEffect(() => {
    loadReparaciones();
  }, [filtros]);

  const loadVehiculos = async () => {
    try {
      const response = await vehiculoService.getAll();
      setVehiculos(response.vehiculos || []);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    }
  };

  const loadReparaciones = async () => {
    try {
      setLoading(true);
      const response = await reparacionService.getAll(filtros);
      setReparaciones(response.data || []);
      setPagination(response.pagination || {});
    } catch (error) {
      showToast.error('Error al cargar reparaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = () => {
    setFiltros({ ...filtros, page: 1 });
    setMostrarFiltros(false);
    loadReparaciones();
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      vehiculo: '',
      categoria: '',
      estado: '',
      fecha_desde: '',
      fecha_hasta: '',
      page: 1,
      limit: 100
    });
    setMostrarFiltros(false);
    setTimeout(() => loadReparaciones(), 0);
  };

  const handleEliminar = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de eliminar esta reparación?')) return;

    try {
      await reparacionService.delete(id);
      showToast.success('Reparación eliminada exitosamente');
      loadReparaciones();
    } catch (error) {
      showToast.error('Error al eliminar reparación');
    }
  };

  // Contar filtros activos
  const contarFiltrosActivos = () => {
    let count = 0;
    if (filtros.vehiculo) count++;
    if (filtros.categoria) count++;
    if (filtros.estado) count++;
    if (filtros.fecha_desde) count++;
    if (filtros.fecha_hasta) count++;
    return count;
  };

  const filtrosActivos = contarFiltrosActivos();

  // Agrupar reparaciones por categoría
  const reparacionesPorCategoria = reparaciones.reduce((acc, reparacion) => {
    const categoria = reparacion.categoria;
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(reparacion);
    return acc;
  }, {});

  const getEstadoBadge = (estado) => {
    const badges = {
      completada: 'text-green-700 bg-green-50 border border-green-200',
      en_progreso: 'text-orange-700 bg-orange-50 border border-orange-200',
      cancelada: 'text-red-700 bg-red-50 border border-red-200'
    };
    return badges[estado] || 'text-gray-700 bg-gray-100 border border-gray-200';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      completada: 'Completada',
      en_progreso: 'En Progreso',
      cancelada: 'Cancelada'
    };
    return textos[estado] || estado;
  };

  const totalCostos = reparaciones.reduce((sum, r) => sum + r.costo_total, 0);
  const promedioCosto = reparaciones.length > 0 ? totalCostos / reparaciones.length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Reparaciones</h1>
        <p className="text-xs text-gray-600 mt-0.5">Historial completo de mantenimientos</p>
      </div>

      {/* Stats compactos */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-600 mb-1">Total</p>
          <p className="text-xl font-bold text-gray-900">{pagination.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-600 mb-1">Costo Total</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900">
            {reparacionService.formatearMoneda(totalCostos)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-600 mb-1">Promedio</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900">
            {reparacionService.formatearMoneda(promedioCosto)}
          </p>
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

            {/* Botón Buscar */}
            <button 
              onClick={handleFiltrar}
              className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 
                rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">Buscar</span>
              <svg className="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Botón Nueva (Desktop) */}
            <button 
              onClick={() => navigate('/reparaciones/nueva')}
              className="hidden sm:flex items-center gap-1.5 ml-auto px-4 py-2 text-sm font-semibold 
                text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nueva
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Vehículo */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Vehículo
                </label>
                <select
                  value={filtros.vehiculo}
                  onChange={(e) => setFiltros({ ...filtros, vehiculo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                    focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Todos los vehículos</option>
                  {vehiculos.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.numero_economico} - {v.placa}
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Categoría
                </label>
                <select
                  value={filtros.categoria}
                  onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                    focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Todas las categorías</option>
                  {CATEGORIAS_REPARACION.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Estado
                </label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                    focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Todos los estados</option>
                  {ESTADOS_REPARACION.map(est => (
                    <option key={est.value} value={est.value}>{est.label}</option>
                  ))}
                </select>
              </div>

              {/* Fecha Desde */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Fecha desde
                </label>
                <input
                  type="date"
                  value={filtros.fecha_desde}
                  onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                    focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              {/* Fecha Hasta */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Fecha hasta
                </label>
                <input
                  type="date"
                  value={filtros.fecha_hasta}
                  onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                    focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Acciones de filtros */}
            {filtrosActivos > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={handleLimpiarFiltros}
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón flotante "Nueva" en mobile */}
      <button
        onClick={() => navigate('/reparaciones/nueva')}
        className="sm:hidden fixed bottom-6 right-4 w-14 h-14 bg-gray-900 hover:bg-gray-800 
          text-white rounded-full shadow-lg flex items-center justify-center z-30
          transition-all active:scale-95"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-10 h-10 border-3 border-gray-100 rounded-full"></div>
            <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm text-gray-600 mt-3">Cargando reparaciones...</p>
        </div>
      ) : reparaciones.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            {filtrosActivos > 0
              ? 'No se encontraron reparaciones'
              : 'Sin reparaciones registradas'}
          </p>
          <p className="text-xs text-gray-400">
            {filtrosActivos > 0
              ? 'Intenta ajustar los filtros'
              : 'Agrega la primera reparación'}
          </p>
        </div>
      ) : (
        /* Reparaciones agrupadas por categoría */
        <div className="space-y-4">
          {Object.entries(reparacionesPorCategoria).map(([categoria, reparacionesCategoria]) => (
            <div key={categoria} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Header de cada grupo */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-900">
                  {categoria}
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({reparacionesCategoria.length})
                  </span>
                  <span className="ml-2 text-xs text-gray-600">
                    · {reparacionService.formatearMoneda(
                      reparacionesCategoria.reduce((sum, r) => sum + r.costo_total, 0)
                    )}
                  </span>
                </h2>
              </div>

              {/* Tabla responsive */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Vehículo
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Descripción
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden sm:table-cell">
                        Fecha
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden md:table-cell">
                        Piezas
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden lg:table-cell">
                        M. Obra
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Total
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden md:table-cell">
                        Estado
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reparacionesCategoria.map((reparacion) => (
                      <tr
                        key={reparacion._id}
                        onClick={() => navigate(`/reparaciones/${reparacion._id}`)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {/* Vehículo */}
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {reparacion.placa}
                          </div>
                          <div className="text-xs text-gray-500">
                            {reparacion.numero_economico}
                          </div>
                        </td>

                        {/* Descripción */}
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 line-clamp-1 max-w-[200px]">
                            {reparacion.descripcion}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {reparacion.registrado_por?.nombre}
                          </div>
                        </td>

                        {/* Fecha */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-sm text-gray-700">
                            {reparacionService.formatearFechaCorta(reparacion.fecha_realizacion)}
                          </span>
                        </td>

                        {/* Piezas */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="text-sm font-medium text-gray-900">
                            {reparacion.piezas?.length || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            {reparacionService.formatearMoneda(
                              reparacionService.calcularCostoPiezas(reparacion.piezas)
                            )}
                          </div>
                        </td>

                        {/* Mano de Obra */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-gray-700">
                            {reparacionService.formatearMoneda(reparacion.costo_mano_obra)}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold text-gray-900">
                            {reparacionService.formatearMoneda(reparacion.costo_total)}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getEstadoBadge(reparacion.estado)}`}>
                            {getEstadoTexto(reparacion.estado)}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/reparaciones/${reparacion._id}/editar`);
                              }}
                              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => handleEliminar(e, reparacion._id)}
                              className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen total */}
      {!loading && reparaciones.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 text-center">
            {reparaciones.length} reparación{reparaciones.length !== 1 ? 'es' : ''} · 
            {' '}{Object.keys(reparacionesPorCategoria).length} categoría{Object.keys(reparacionesPorCategoria).length !== 1 ? 's' : ''} · 
            {' '}{reparacionService.formatearMoneda(totalCostos)}
          </p>
        </div>
      )}
    </div>
  );
};

export default Reparaciones;