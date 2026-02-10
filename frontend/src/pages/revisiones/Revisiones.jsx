import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import revisionService from '../../services/revisionService';
import vehiculoService from '../../services/vehiculoService';
import { showToast } from '../../utils/toast';

const Revisiones = () => {
  const navigate = useNavigate();
  const [revisiones, setRevisiones] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    vehiculo: '',
    tipo_vehiculo: '',
    frecuencia: '',
    fecha_desde: '',
    fecha_hasta: '',
    tiene_problemas: '',
    estado: '',
    page: 1,
    limit: 100
  });

  useEffect(() => {
    loadRevisiones();
    loadVehiculos();
  }, []);

  const loadRevisiones = async () => {
    try {
      setLoading(true);
      const response = await revisionService.getAllAdmin(filtros);
      setRevisiones(response.revisiones);
      setPagination(response.pagination);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al cargar revisiones');
    } finally {
      setLoading(false);
    }
  };

  const loadVehiculos = async () => {
    try {
      const response = await vehiculoService.getAll({ limit: 100 });
      setVehiculos(response.vehiculos || []);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    }
  };

  const handleFiltrar = () => {
    setFiltros({ ...filtros, page: 1 });
    setMostrarFiltros(false);
    loadRevisiones();
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      vehiculo: '',
      tipo_vehiculo: '',
      frecuencia: '',
      fecha_desde: '',
      fecha_hasta: '',
      tiene_problemas: '',
      estado: '',
      page: 1,
      limit: 100
    });
    setMostrarFiltros(false);
    setTimeout(() => loadRevisiones(), 0);
  };

  // Contar filtros activos
  const contarFiltrosActivos = () => {
    let count = 0;
    if (filtros.vehiculo) count++;
    if (filtros.frecuencia) count++;
    if (filtros.fecha_desde) count++;
    if (filtros.fecha_hasta) count++;
    if (filtros.tiene_problemas) count++;
    if (filtros.estado) count++;
    return count;
  };

  const filtrosActivos = contarFiltrosActivos();

  // Agrupar revisiones por frecuencia
  const revisionesPorFrecuencia = revisiones.reduce((acc, revision) => {
    const frecuencia = revision.frecuencia;
    if (!acc[frecuencia]) {
      acc[frecuencia] = [];
    }
    acc[frecuencia].push(revision);
    return acc;
  }, {});

  const frecuencias = {
    diaria: 'Revisiones Diarias',
    mensual: 'Revisiones Mensuales',
    bimestral: 'Revisiones Bimestrales'
  };

  const getBadgeFrecuencia = (frecuencia) => {
    const badges = {
      diaria: 'text-blue-700 bg-blue-50 border border-blue-200',
      mensual: 'text-purple-700 bg-purple-50 border border-purple-200',
      bimestral: 'text-indigo-700 bg-indigo-50 border border-indigo-200'
    };
    return badges[frecuencia] || 'text-gray-700 bg-gray-100 border border-gray-200';
  };

  const getBadgeEstado = (revision) => {
    if (revision.tiene_problemas) {
      return 'text-red-700 bg-red-50 border border-red-200';
    }
    if (revision.aprobada) {
      return 'text-green-700 bg-green-50 border border-green-200';
    }
    if (revision.estado === 'pendiente_revision') {
      return 'text-orange-700 bg-orange-50 border border-orange-200';
    }
    return 'text-gray-600 bg-gray-100 border border-gray-200';
  };

  const getTextoEstado = (revision) => {
    if (revision.tiene_problemas) return 'Problemas';
    if (revision.aprobada) return 'Aprobada';
    if (revision.estado === 'pendiente_revision') return 'Pendiente';
    if (revision.estado === 'completada') return 'Completada';
    return revision.estado.replace('_', ' ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Revisiones</h1>
        <p className="text-xs text-gray-600 mt-0.5">Historial de revisiones de vehículos</p>
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
              Filtros
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
                rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Buscar</span>
            </button>

            {/* Stats compactos */}
            {!loading && revisiones.length > 0 && (
              <div className="ml-auto hidden md:flex items-center gap-4 text-xs text-gray-600">
                <span className="font-medium">
                  {revisiones.length} revisión{revisiones.length !== 1 ? 'es' : ''}
                </span>
                {revisiones.filter(r => r.tiene_problemas).length > 0 && (
                  <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded border border-red-200 font-medium">
                    {revisiones.filter(r => r.tiene_problemas).length} con problemas
                  </span>
                )}
                {revisiones.filter(r => r.estado === 'pendiente_revision').length > 0 && (
                  <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded border border-orange-200 font-medium">
                    {revisiones.filter(r => r.estado === 'pendiente_revision').length} pendientes
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sección de filtros colapsable */}
        <div 
          className={`border-t border-gray-100 transition-all duration-300 ease-in-out ${
            mostrarFiltros ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
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
                      {/* ⭐ CAMBIO: numero_economico primero en el selector */}
                      {v.numero_economico} ({v.placa})
                    </option>
                  ))}
                </select>
              </div>

              {/* Frecuencia */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Frecuencia
                </label>
                <select
                  value={filtros.frecuencia}
                  onChange={(e) => setFiltros({ ...filtros, frecuencia: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                    focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Todas las frecuencias</option>
                  <option value="diaria">Diaria</option>
                  <option value="mensual">Mensual</option>
                  <option value="bimestral">Bimestral</option>
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
                  <option value="en_progreso">En Progreso</option>
                  <option value="completada">Completada</option>
                  <option value="pendiente_revision">Pendiente Revisión</option>
                  <option value="cerrada">Cerrada</option>
                </select>
              </div>

              {/* Problemas */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Problemas
                </label>
                <select
                  value={filtros.tiene_problemas}
                  onChange={(e) => setFiltros({ ...filtros, tiene_problemas: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                    focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Todas</option>
                  <option value="true">Con problemas</option>
                  <option value="false">Sin problemas</option>
                </select>
              </div>

              {/* Fecha desde */}
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

              {/* Fecha hasta */}
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

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-10 h-10 border-3 border-gray-100 rounded-full"></div>
            <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm text-gray-600 mt-3">Cargando revisiones...</p>
        </div>
      ) : revisiones.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            No se encontraron revisiones
          </p>
          <p className="text-xs text-gray-400">
            {filtrosActivos > 0 ? 'Intenta ajustar los filtros' : 'Las revisiones aparecerán aquí'}
          </p>
        </div>
      ) : (
        /* Revisiones agrupadas por frecuencia */
        <div className="space-y-4">
          {Object.entries(revisionesPorFrecuencia).map(([frecuencia, revisionesFrecuencia]) => (
            <div key={frecuencia} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Header de cada grupo */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-900">
                  {frecuencias[frecuencia] || frecuencia}
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({revisionesFrecuencia.length})
                  </span>
                  {revisionesFrecuencia.filter(r => r.tiene_problemas).length > 0 && (
                    <span className="ml-2 text-xs text-red-600">
                      · {revisionesFrecuencia.filter(r => r.tiene_problemas).length} con problemas
                    </span>
                  )}
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
                        Fecha
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden sm:table-cell">
                        Operador
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden md:table-cell">
                        Km
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden lg:table-cell">
                        Combustible
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden md:table-cell">
                        Problemas
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {revisionesFrecuencia.map((revision) => (
                      <tr
                        key={revision._id}
                        onClick={() => navigate(`/revisiones/${revision._id}`)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {/* Vehículo - ⭐ CAMBIO: numero_economico primero */}
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {revision.numero_economico}
                          </div>
                          <div className="text-xs text-gray-500">
                            {revision.placa}
                          </div>
                        </td>

                        {/* Fecha */}
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {new Date(revision.fecha).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(revision.fecha).toLocaleDateString('es-MX', {
                              year: 'numeric'
                            })}
                          </div>
                        </td>

                        {/* Operador */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-sm text-gray-700 truncate max-w-[120px] block">
                            {revision.operador.nombre}
                          </span>
                        </td>

                        {/* Kilometraje */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="text-sm text-gray-700">
                            {revision.kilometraje_al_momento?.toLocaleString()} km
                          </div>
                          {revision.horas_motor_al_momento > 0 && (
                            <div className="text-xs text-gray-500">
                              {revision.horas_motor_al_momento?.toLocaleString()} hrs
                            </div>
                          )}
                        </td>

                        {/* Combustible */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-gray-700 capitalize">
                            {revision.nivel_combustible}
                          </span>
                        </td>

                        {/* Problemas */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          {revision.tiene_problemas ? (
                            <div className="text-sm font-medium text-red-700">
                              {(revision.items_mal?.length || 0) + (revision.llantas_mal?.length || 0)}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getBadgeEstado(revision)}`}>
                            {getTextoEstado(revision)}
                          </span>
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

      {/* Stats mobile (solo visible cuando hay revisiones) */}
      {!loading && revisiones.length > 0 && (
        <div className="mt-4 md:hidden">
          <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
            <span className="font-medium">
              {revisiones.length} revisión{revisiones.length !== 1 ? 'es' : ''}
            </span>
            {revisiones.filter(r => r.tiene_problemas).length > 0 && (
              <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded border border-red-200 font-medium">
                {revisiones.filter(r => r.tiene_problemas).length} problemas
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Revisiones;