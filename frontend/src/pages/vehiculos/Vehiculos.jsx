import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import vehiculoService from '../../services/vehiculoService';
import { showToast } from '../../utils/toast';

const Vehiculos = () => {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo_vehiculo: '',
    disponibilidad: '',
    sede: '',
    page: 1,
    limit: 100
  });

  useEffect(() => {
    loadVehiculos();
  }, []);

  const loadVehiculos = async () => {
    try {
      setLoading(true);
      const response = await vehiculoService.getAll(filtros);
      setVehiculos(response.vehiculos);
      setPagination(response.pagination);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = () => {
    setFiltros({ ...filtros, page: 1 });
    loadVehiculos();
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      tipo_vehiculo: '',
      disponibilidad: '',
      sede: '',
      page: 1,
      limit: 100
    });
    setTimeout(() => loadVehiculos(), 0);
  };

  // Contar filtros activos (excluyendo búsqueda)
  const contarFiltrosActivos = () => {
    let count = 0;
    if (filtros.tipo_vehiculo) count++;
    if (filtros.disponibilidad) count++;
    if (filtros.sede) count++;
    return count;
  };

  const filtrosActivos = contarFiltrosActivos();

  // Agrupar vehículos por tipo
  const vehiculosPorTipo = vehiculos.reduce((acc, vehiculo) => {
    const tipo = vehiculo.tipo_vehiculo;
    if (!acc[tipo]) {
      acc[tipo] = [];
    }
    acc[tipo].push(vehiculo);
    return acc;
  }, {});

  const tiposVehiculo = {
    olla_revolvedora: 'Ollas Revolvedoras',
    planta_de_concreto: 'Plantas de Concreto',
    camion_carga_frontal: 'Camiones de Carga Frontal',
    camioneta_pickup: 'Camionetas Pickup',
    grua: 'Grúas'
  };

  const getDisponibilidadBadge = (disponibilidad) => {
    const badges = {
      disponible: 'text-green-700 bg-green-50 border border-green-200',
      en_servicio: 'text-gray-700 bg-gray-100 border border-gray-200',
      mantenimiento: 'text-orange-700 bg-orange-50 border border-orange-200',
      fuera_servicio: 'text-red-700 bg-red-50 border border-red-200'
    };
    return badges[disponibilidad] || 'text-gray-600 bg-gray-100 border border-gray-200';
  };

  const getDisponibilidadTexto = (disponibilidad) => {
    const textos = {
      disponible: 'Disponible',
      en_servicio: 'En Servicio',
      mantenimiento: 'Mantenimiento',
      fuera_servicio: 'Fuera de Servicio'
    };
    return textos[disponibilidad] || disponibilidad;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Vehículos</h1>
        <p className="text-xs text-gray-600 mt-0.5">Gestión de vehículos de la flota</p>
      </div>

      {/* Barra de búsqueda y acciones compacta */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
        {/* Primera fila: Búsqueda y acciones principales */}
        <div className="p-3">
          <div className="flex items-center gap-2">
            {/* Input de búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <svg 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar placa, no. económico..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleFiltrar()}
                />
              </div>
            </div>

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

            {/* Botón Nuevo (Desktop) */}
            <button 
              onClick={() => navigate('/vehiculos/nuevo')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold 
                text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo
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
              {/* Tipo de Vehículo */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Tipo de Vehículo
                </label>
                <select
                  value={filtros.tipo_vehiculo}
                  onChange={(e) => setFiltros({ ...filtros, tipo_vehiculo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                    focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Todos los tipos</option>
                  <option value="olla_revolvedora">Olla Revolvedora</option>
                  <option value="planta_de_concreto">Planta de Concreto</option>
                  <option value="camion_carga_frontal">Camión Carga Frontal</option>
                  <option value="camioneta_pickup">Camioneta Pickup</option>
                  <option value="grua">Grúa</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Estado
                </label>
                <select
                  value={filtros.disponibilidad}
                  onChange={(e) => setFiltros({ ...filtros, disponibilidad: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                    focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Todos los estados</option>
                  <option value="disponible">Disponible</option>
                  <option value="en_servicio">En Servicio</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="fuera_servicio">Fuera de Servicio</option>
                </select>
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

      {/* Botón flotante "Nuevo" en mobile */}
      <button
        onClick={() => navigate('/vehiculos/nuevo')}
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
          <p className="text-sm text-gray-600 mt-3">Cargando vehículos...</p>
        </div>
      ) : vehiculos.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            {filtros.busqueda || filtrosActivos > 0
              ? 'No se encontraron vehículos'
              : 'Sin vehículos registrados'}
          </p>
          <p className="text-xs text-gray-400">
            {filtros.busqueda || filtrosActivos > 0
              ? 'Intenta ajustar los filtros'
              : 'Agrega tu primer vehículo'}
          </p>
        </div>
      ) : (
        /* Vehículos agrupados por tipo */
        <div className="space-y-4">
          {Object.entries(vehiculosPorTipo).map(([tipo, vehiculosDelTipo]) => (
            <div key={tipo} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Header de cada grupo */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-900">
                  {tiposVehiculo[tipo] || tipo}
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({vehiculosDelTipo.length})
                  </span>
                </h2>
              </div>

              {/* Tabla responsive */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Placa
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        No. Econ
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden sm:table-cell">
                        Marca/Modelo
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden md:table-cell">
                        Km
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden lg:table-cell">
                        Hrs Motor
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Estado
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden lg:table-cell">
                        Operador
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vehiculosDelTipo.map((vehiculo) => (
                      <tr
                        key={vehiculo._id}
                        onClick={() => navigate(`/vehiculos/${vehiculo._id}`)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {/* Placa */}
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {vehiculo.placa}
                          </div>
                          {vehiculo.year && (
                            <div className="text-xs text-gray-500">
                              {vehiculo.year}
                            </div>
                          )}
                        </td>

                        {/* No. Económico */}
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-700">
                            #{vehiculo.numero_economico}
                          </span>
                        </td>

                        {/* Marca/Modelo */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="text-sm text-gray-900">
                            {vehiculo.marca}
                          </div>
                          <div className="text-xs text-gray-500">
                            {vehiculo.modelo}
                          </div>
                        </td>

                        {/* Kilometraje */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-700">
                            {vehiculo.kilometraje_actual?.toLocaleString() || 0} km
                          </span>
                        </td>

                        {/* Horas Motor */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-gray-700">
                            {vehiculo.horas_motor_actual > 0 
                              ? `${vehiculo.horas_motor_actual?.toLocaleString()} hrs`
                              : '—'
                            }
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getDisponibilidadBadge(vehiculo.disponibilidad)}`}>
                            {getDisponibilidadTexto(vehiculo.disponibilidad).split(' ')[0]}
                          </span>
                        </td>

                        {/* Operador */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {vehiculo.operador_actual ? (
                            <div className="text-sm text-gray-900 truncate max-w-[150px]">
                              {vehiculo.operador_actual.nombre}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
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
      {!loading && vehiculos.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 text-center">
            {vehiculos.length} vehículo{vehiculos.length !== 1 ? 's' : ''} · 
            {' '}{Object.keys(vehiculosPorTipo).length} tipo{Object.keys(vehiculosPorTipo).length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default Vehiculos;