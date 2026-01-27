// src/pages/vehiculos/Vehiculos.jsx
// Rediseñado con agrupación por tipo de vehículo y formato de tabla

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import vehiculoService from '../../services/vehiculoService';
import { showToast } from '../../utils/toast';

const Vehiculos = () => {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo_vehiculo: '',
    disponibilidad: '',
    sede: '',
    page: 1,
    limit: 100 // Aumentado para mostrar más vehículos
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

  // Agrupar vehículos por tipo
  const vehiculosPorTipo = vehiculos.reduce((acc, vehiculo) => {
    const tipo = vehiculo.tipo_vehiculo;
    if (!acc[tipo]) {
      acc[tipo] = [];
    }
    acc[tipo].push(vehiculo);
    return acc;
  }, {});

  // Nombres amigables para cada tipo
  const tiposVehiculo = {
    olla_revolvedora: 'Ollas Revolvedoras',
    planta_de_concreto: 'Plantas de Concreto',
    camion_carga_frontal: 'Camiones de Carga Frontal',
    camioneta_pickup: 'Camionetas Pickup',
    grua: 'Grúas'
  };

  // Badge de disponibilidad
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vehículos</h1>
        <p className="text-sm text-gray-600 mt-1">Gestión de vehículos de la flota</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Buscar vehículo
            </label>
            <input
              type="text"
              placeholder="Placa, número económico, marca..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                transition-all"
              onKeyPress={(e) => e.key === 'Enter' && handleFiltrar()}
            />
          </div>

          {/* Tipo de Vehículo */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Tipo
            </label>
            <select
              value={filtros.tipo_vehiculo}
              onChange={(e) => setFiltros({ ...filtros, tipo_vehiculo: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                transition-all"
            >
              <option value="">Todos</option>
              <option value="olla_revolvedora">Olla Revolvedora</option>
              <option value="planta_de_concreto">Planta de Concreto</option>
              <option value="camion_carga_frontal">Camión de Carga Frontal</option>
              <option value="camioneta_pickup">Camioneta Pickup</option>
              <option value="grua">Grúa</option>
            </select>
          </div>

          {/* Disponibilidad */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Estado
            </label>
            <select
              value={filtros.disponibilidad}
              onChange={(e) => setFiltros({ ...filtros, disponibilidad: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                transition-all"
            >
              <option value="">Todos</option>
              <option value="disponible">Disponible</option>
              <option value="en_servicio">En Servicio</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="fuera_servicio">Fuera de Servicio</option>
            </select>
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
          <div className="ml-auto flex gap-2">
            <button 
              onClick={() => navigate('/combustible')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 
                bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
            >
              Ver Combustible
            </button>
            <button 
              onClick={() => navigate('/vehiculos/nuevo')}
              className="px-5 py-2.5 text-sm font-semibold text-white 
                bg-gradient-to-r from-gray-900 to-gray-700 
                hover:from-gray-800 hover:to-gray-600 
                rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Nuevo Vehículo
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
          <p className="text-sm font-medium text-gray-600 mt-4">Cargando vehículos</p>
        </div>
      ) : vehiculos.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-gray-50 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1v3m0 0a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v3z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            {filtros.busqueda || filtros.tipo_vehiculo || filtros.disponibilidad
              ? 'No se encontraron vehículos'
              : 'Sin vehículos registrados'}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            {filtros.busqueda || filtros.tipo_vehiculo || filtros.disponibilidad
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Agrega tu primer vehículo para comenzar'}
          </p>
          {!filtros.busqueda && !filtros.tipo_vehiculo && !filtros.disponibilidad && (
            <button
              onClick={() => navigate('/vehiculos/nuevo')}
              className="px-5 py-2.5 text-sm font-semibold text-white 
                bg-gradient-to-r from-gray-900 to-gray-700 
                hover:from-gray-800 hover:to-gray-600 
                rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Agregar Vehículo
            </button>
          )}
        </div>
      ) : (
        /* Vehículos agrupados por tipo */
        <div className="space-y-8">
          {Object.entries(vehiculosPorTipo).map(([tipo, vehiculosDelTipo]) => (
            <div key={tipo} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header de cada grupo */}
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {tiposVehiculo[tipo] || tipo}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {vehiculosDelTipo.length} vehículo{vehiculosDelTipo.length !== 1 ? 's' : ''}
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
                        Placa
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        No. Económico
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Marca/Modelo
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Kilometraje
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Horas Motor
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Estado
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Operador
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vehiculosDelTipo.map((vehiculo) => (
                      <tr
                        key={vehiculo._id}
                        onClick={() => navigate(`/vehiculos/${vehiculo._id}`)}
                        className="group hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {/* Placa */}
                        <td className="px-5 py-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                            {vehiculo.placa}
                          </div>
                          {vehiculo.year && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {vehiculo.year}
                            </div>
                          )}
                        </td>

                        {/* No. Económico */}
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-gray-700">
                            #{vehiculo.numero_economico}
                          </span>
                        </td>

                        {/* Marca/Modelo */}
                        <td className="px-5 py-4">
                          <div className="text-sm text-gray-900">
                            {vehiculo.marca}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {vehiculo.modelo}
                          </div>
                        </td>

                        {/* Kilometraje */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-700">
                            {vehiculo.kilometraje_actual?.toLocaleString() || 0} km
                          </span>
                        </td>

                        {/* Horas Motor */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-700">
                            {vehiculo.horas_motor_actual > 0 
                              ? `${vehiculo.horas_motor_actual?.toLocaleString()} hrs`
                              : '—'
                            }
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getDisponibilidadBadge(vehiculo.disponibilidad)}`}>
                            {getDisponibilidadTexto(vehiculo.disponibilidad)}
                          </span>
                        </td>

                        {/* Operador */}
                        <td className="px-5 py-4">
                          {vehiculo.operador_actual ? (
                            <div>
                              <div className="text-sm text-gray-900">
                                {vehiculo.operador_actual.nombre}
                              </div>
                              {vehiculo.sede_actual && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {vehiculo.sede_actual.nombre}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Sin asignar</span>
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
        <div className="mt-6">
          <p className="text-xs text-gray-500 text-center">
            Total: {vehiculos.length} vehículo{vehiculos.length !== 1 ? 's' : ''} · 
            {' '}{Object.keys(vehiculosPorTipo).length} tipo{Object.keys(vehiculosPorTipo).length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default Vehiculos;