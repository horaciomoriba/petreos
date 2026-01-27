// src/pages/revisiones/Revisiones.jsx

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
    setTimeout(() => loadRevisiones(), 0);
  };

  // Agrupar revisiones por frecuencia
  const revisionesPorFrecuencia = revisiones.reduce((acc, revision) => {
    const frecuencia = revision.frecuencia;
    if (!acc[frecuencia]) {
      acc[frecuencia] = [];
    }
    acc[frecuencia].push(revision);
    return acc;
  }, {});

  // Nombres amigables
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
    if (revision.tiene_problemas) return 'Con problemas';
    if (revision.aprobada) return 'Aprobada';
    if (revision.estado === 'pendiente_revision') return 'Pendiente';
    if (revision.estado === 'completada') return 'Completada';
    return revision.estado.replace('_', ' ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Revisiones</h1>
        <p className="text-sm text-gray-600 mt-1">Historial de revisiones de vehículos</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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

          {/* Frecuencia */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Frecuencia
            </label>
            <select
              value={filtros.frecuencia}
              onChange={(e) => setFiltros({ ...filtros, frecuencia: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                transition-all"
            >
              <option value="">Todas</option>
              <option value="diaria">Diaria</option>
              <option value="mensual">Mensual</option>
              <option value="bimestral">Bimestral</option>
            </select>
          </div>

          {/* Fecha desde */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Desde
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

          {/* Fecha hasta */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Hasta
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

          {/* Tiene problemas */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Problemas
            </label>
            <select
              value={filtros.tiene_problemas}
              onChange={(e) => setFiltros({ ...filtros, tiene_problemas: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                transition-all"
            >
              <option value="">Todas</option>
              <option value="true">Con problemas</option>
              <option value="false">Sin problemas</option>
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
              <option value="en_progreso">En Progreso</option>
              <option value="completada">Completada</option>
              <option value="pendiente_revision">Pendiente Revisión</option>
              <option value="cerrada">Cerrada</option>
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
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm font-medium text-gray-600 mt-4">Cargando revisiones</p>
        </div>
      ) : revisiones.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-gray-50 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            No se encontraron revisiones
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      ) : (
        /* Revisiones agrupadas por frecuencia */
        <div className="space-y-8">
          {Object.entries(revisionesPorFrecuencia).map(([frecuencia, revisionesFrecuencia]) => (
            <div key={frecuencia} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header de cada grupo */}
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {frecuencias[frecuencia] || frecuencia}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {revisionesFrecuencia.length} revisión{revisionesFrecuencia.length !== 1 ? 'es' : ''} · 
                      {' '}{revisionesFrecuencia.filter(r => r.tiene_problemas).length} con problemas
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
                        Fecha
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Operador
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Datos Operacionales
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Combustible
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Problemas
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {revisionesFrecuencia.map((revision) => (
                      <tr
                        key={revision._id}
                        onClick={() => navigate(`/revisiones/${revision._id}`)}
                        className="group hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {/* Vehículo */}
                        <td className="px-5 py-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                            {revision.placa}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {revision.numero_economico}
                          </div>
                        </td>

                        {/* Fecha */}
                        <td className="px-5 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(revision.fecha).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {new Date(revision.fecha).toLocaleDateString('es-MX', {
                              weekday: 'short'
                            })}
                          </div>
                        </td>

                        {/* Operador */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-700">
                            {revision.operador.nombre}
                          </span>
                        </td>

                        {/* Datos Operacionales */}
                        <td className="px-5 py-4">
                          <div className="text-sm text-gray-700">
                            {revision.kilometraje_al_momento?.toLocaleString()} km
                          </div>
                          {revision.horas_motor_al_momento > 0 && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {revision.horas_motor_al_momento?.toLocaleString()} hrs
                            </div>
                          )}
                        </td>

                        {/* Combustible */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-700 capitalize">
                            {revision.nivel_combustible}
                          </span>
                        </td>

                        {/* Problemas */}
                        <td className="px-5 py-4">
                          {revision.tiene_problemas ? (
                            <div>
                              <div className="text-sm font-medium text-red-700">
                                {(revision.items_mal?.length || 0) + (revision.llantas_mal?.length || 0)} problema{((revision.items_mal?.length || 0) + (revision.llantas_mal?.length || 0)) !== 1 ? 's' : ''}
                              </div>
                              <div className="text-xs text-red-600 mt-0.5">
                                {revision.items_mal?.length || 0} items · {revision.llantas_mal?.length || 0} llantas
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="px-5 py-4">
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

      {/* Resumen total */}
      {!loading && revisiones.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-gray-500 text-center">
            Total: {revisiones.length} revisión{revisiones.length !== 1 ? 'es' : ''} · 
            {' '}{revisiones.filter(r => r.tiene_problemas).length} con problemas · 
            {' '}{Object.keys(revisionesPorFrecuencia).length} frecuencia{Object.keys(revisionesPorFrecuencia).length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default Revisiones;