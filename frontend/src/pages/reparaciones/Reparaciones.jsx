// pages/reparaciones/Reparaciones.jsx

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
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 100, // Aumentado para mostrar más
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
    setTimeout(() => loadReparaciones(), 0);
  };

  const handleEliminar = async (e, id) => {
    e.stopPropagation(); // Evitar que abra el detalle
    if (!window.confirm('¿Estás seguro de eliminar esta reparación?')) return;

    try {
      await reparacionService.delete(id);
      showToast.success('Reparación eliminada exitosamente');
      loadReparaciones();
    } catch (error) {
      showToast.error('Error al eliminar reparación');
    }
  };

  // Agrupar reparaciones por categoría
  const reparacionesPorCategoria = reparaciones.reduce((acc, reparacion) => {
    const categoria = reparacion.categoria;
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(reparacion);
    return acc;
  }, {});

  // Badge de estado
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Reparaciones de Vehículos
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Historial completo de mantenimientos y reparaciones
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Reparaciones</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Costo Total</p>
          <p className="text-2xl font-bold text-gray-900">
            {reparacionService.formatearMoneda(totalCostos)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Promedio por Reparación</p>
          <p className="text-2xl font-bold text-gray-900">
            {reparacionService.formatearMoneda(promedioCosto)}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Vehículo */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Vehículo
            </label>
            <select
              value={filtros.vehiculo}
              onChange={(e) => setFiltros({ ...filtros, vehiculo: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                transition-all"
            >
              <option value="">Todos</option>
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
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                transition-all"
            >
              <option value="">Todas</option>
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
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                transition-all"
            >
              <option value="">Todos</option>
              {ESTADOS_REPARACION.map(est => (
                <option key={est.value} value={est.value}>{est.label}</option>
              ))}
            </select>
          </div>

          {/* Fecha Desde */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Fecha Desde
            </label>
            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                transition-all"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                transition-all"
            />
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleFiltrar} 
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 
              bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
          >
            Aplicar Filtros
          </button>
          <button 
            onClick={handleLimpiarFiltros} 
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 
              transition-colors"
          >
            Limpiar
          </button>
          <div className="ml-auto">
            <button 
              onClick={() => navigate('/reparaciones/nueva')}
              className="px-5 py-2.5 text-sm font-semibold text-white 
                bg-gradient-to-r from-gray-900 to-gray-700 
                hover:from-gray-800 hover:to-gray-600 
                rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Nueva Reparación
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm font-medium text-gray-600 mt-4">Cargando reparaciones</p>
        </div>
      ) : reparaciones.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-gray-50 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            {filtros.vehiculo || filtros.categoria || filtros.estado || filtros.fecha_desde || filtros.fecha_hasta
              ? 'No se encontraron reparaciones'
              : 'Sin reparaciones registradas'}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            {filtros.vehiculo || filtros.categoria || filtros.estado || filtros.fecha_desde || filtros.fecha_hasta
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Agrega la primera reparación para comenzar'}
          </p>
          {!filtros.vehiculo && !filtros.categoria && !filtros.estado && (
            <button
              onClick={() => navigate('/reparaciones/nueva')}
              className="px-5 py-2.5 text-sm font-semibold text-white 
                bg-gradient-to-r from-gray-900 to-gray-700 
                hover:from-gray-800 hover:to-gray-600 
                rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Nueva Reparación
            </button>
          )}
        </div>
      ) : (
        /* Reparaciones agrupadas por categoría */
        <div className="space-y-8">
          {Object.entries(reparacionesPorCategoria).map(([categoria, reparacionesCategoria]) => (
            <div key={categoria} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header de cada grupo */}
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {categoria}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {reparacionesCategoria.length} reparación{reparacionesCategoria.length !== 1 ? 'es' : ''} · 
                      {' '}{reparacionService.formatearMoneda(
                        reparacionesCategoria.reduce((sum, r) => sum + r.costo_total, 0)
                      )} total
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabla responsive */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Vehículo
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Descripción
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Fecha
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Piezas
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Mano Obra
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Total
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Estado
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reparacionesCategoria.map((reparacion) => (
                      <tr
                        key={reparacion._id}
                        onClick={() => navigate(`/reparaciones/${reparacion._id}`)}
                        className="group hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {/* Vehículo */}
                        <td className="px-5 py-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                            {reparacion.placa}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {reparacion.numero_economico}
                          </div>
                        </td>

                        {/* Descripción */}
                        <td className="px-5 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {reparacion.descripcion}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {reparacion.registrado_por?.nombre}
                            {reparacion.modificaciones?.length > 0 && (
                              <span className="ml-2 text-orange-600">
                                • Modificada {reparacion.modificaciones.length}x
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Fecha */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-700">
                            {reparacionService.formatearFechaCorta(reparacion.fecha_realizacion)}
                          </span>
                        </td>

                        {/* Piezas */}
                        <td className="px-5 py-4">
                          <div className="text-sm text-gray-900">
                            {reparacion.piezas?.length || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            {reparacionService.formatearMoneda(
                              reparacionService.calcularCostoPiezas(reparacion.piezas)
                            )}
                          </div>
                        </td>

                        {/* Mano de Obra */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-700">
                            {reparacionService.formatearMoneda(reparacion.costo_mano_obra)}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-5 py-4">
                          <span className="text-sm font-bold text-gray-900">
                            {reparacionService.formatearMoneda(reparacion.costo_total)}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getEstadoBadge(reparacion.estado)}`}>
                            {getEstadoTexto(reparacion.estado)}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/reparaciones/${reparacion._id}/editar`);
                              }}
                              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => handleEliminar(e, reparacion._id)}
                              className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        <div className="mt-6">
          <p className="text-xs text-gray-500 text-center">
            Total: {reparaciones.length} reparación{reparaciones.length !== 1 ? 'es' : ''} · 
            {' '}{Object.keys(reparacionesPorCategoria).length} categoría{Object.keys(reparacionesPorCategoria).length !== 1 ? 's' : ''} · 
            {' '}{reparacionService.formatearMoneda(totalCostos)}
          </p>
        </div>
      )}
    </div>
  );
};

export default Reparaciones;