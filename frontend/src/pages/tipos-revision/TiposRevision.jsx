import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tipoRevisionService from '../../services/tipoRevisionService';
import { showToast } from '../../utils/toast';

const TiposRevision = () => {
  const navigate = useNavigate();
  const [tiposRevision, setTiposRevision] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo_vehiculo: '',
    frecuencia: '',
    activo: '',
    limit: 100
  });

  useEffect(() => {
    loadTiposRevision();
  }, []);

  const handleFiltrar = () => {
    const filtrosLimpios = {};
    
    if (filtros.tipo_vehiculo) filtrosLimpios.tipo_vehiculo = filtros.tipo_vehiculo;
    if (filtros.frecuencia) filtrosLimpios.frecuencia = filtros.frecuencia;
    if (filtros.activo !== '') filtrosLimpios.activo = filtros.activo;
    filtrosLimpios.limit = 100;
    
    setMostrarFiltros(false);
    loadTiposRevision(filtrosLimpios);
  };

  const loadTiposRevision = async (filtrosParam) => {
    try {
      setLoading(true);
      const data = await tipoRevisionService.getAll(filtrosParam || filtros);
      setTiposRevision(data);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al cargar tipos de revisión');
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      tipo_vehiculo: '',
      frecuencia: '',
      activo: '',
      limit: 100
    });
    setMostrarFiltros(false);
    setTimeout(() => loadTiposRevision(), 0);
  };

  // Contar filtros activos
  const contarFiltrosActivos = () => {
    let count = 0;
    if (filtros.tipo_vehiculo) count++;
    if (filtros.frecuencia) count++;
    if (filtros.activo !== '') count++;
    return count;
  };

  const filtrosActivos = contarFiltrosActivos();

  // Agrupar tipos de revisión por tipo de vehículo
  const tiposPorVehiculo = tiposRevision.reduce((acc, tipo) => {
    const tipoVeh = tipo.tipo_vehiculo;
    if (!acc[tipoVeh]) {
      acc[tipoVeh] = [];
    }
    acc[tipoVeh].push(tipo);
    return acc;
  }, {});

  const tiposVehiculo = {
    olla_revolvedora: 'Ollas Revolvedoras',
    planta_de_concreto: 'Plantas de Concreto',
    cargador_frontal: 'Cargador Frontal',
    camioneta_pickup: 'Camionetas Pickup',
    grua: 'Grúas'
  };

  const getBadgeFrecuencia = (frecuencia) => {
    const badges = {
      diaria: 'text-blue-700 bg-blue-50 border border-blue-200',
      mensual: 'text-purple-700 bg-purple-50 border border-purple-200',
      bimestral: 'text-indigo-700 bg-indigo-50 border border-indigo-200'
    };
    return badges[frecuencia] || 'text-gray-700 bg-gray-100 border border-gray-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Tipos de Revisión</h1>
        <p className="text-xs text-gray-600 mt-0.5">Gestiona los checklists de revisión por tipo de vehículo</p>
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

            {/* Botón Nuevo (Desktop) */}
            <button 
              onClick={() => navigate('/tipos-revision/nuevo')}
              className="hidden sm:flex items-center gap-1.5 ml-auto px-4 py-2 text-sm font-semibold 
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <option value="cargador_frontal">Cargador Frontal</option>
                  <option value="camioneta_pickup">Camioneta Pickup</option>
                  <option value="grua">Grúa</option>
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
                  value={filtros.activo}
                  onChange={(e) => setFiltros({ ...filtros, activo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                    focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Todos los estados</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
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
        onClick={() => navigate('/tipos-revision/nuevo')}
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
          <p className="text-sm text-gray-600 mt-3">Cargando tipos de revisión...</p>
        </div>
      ) : tiposRevision.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            {filtrosActivos > 0
              ? 'No se encontraron tipos de revisión'
              : 'Sin tipos de revisión registrados'}
          </p>
          <p className="text-xs text-gray-400">
            {filtrosActivos > 0
              ? 'Intenta ajustar los filtros'
              : 'Agrega el primer checklist'}
          </p>
        </div>
      ) : (
        /* Tipos agrupados por tipo de vehículo */
        <div className="space-y-4">
          {Object.entries(tiposPorVehiculo).map(([tipoVeh, tiposDelVehiculo]) => (
            <div key={tipoVeh} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Header de cada grupo */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-900">
                  {tiposVehiculo[tipoVeh] || tipoVeh}
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({tiposDelVehiculo.length})
                  </span>
                </h2>
              </div>

              {/* Tabla responsive */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Nombre
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden sm:table-cell">
                        Código
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Frecuencia
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden md:table-cell">
                        Secciones
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden md:table-cell">
                        Preguntas
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hidden lg:table-cell">
                        Llantas
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tiposDelVehiculo.map((tipo) => (
                      <tr
                        key={tipo._id}
                        onClick={() => navigate(`/tipos-revision/${tipo._id}`)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {/* Nombre */}
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {tipo.nombre}
                          </div>
                        </td>

                        {/* Código */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-sm font-mono text-gray-600">
                            {tipo.codigo}
                          </span>
                        </td>

                        {/* Frecuencia */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded capitalize ${getBadgeFrecuencia(tipo.frecuencia)}`}>
                            {tipo.frecuencia}
                          </span>
                        </td>

                        {/* Secciones */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-700">
                            {tipo.secciones?.length || 0}
                          </span>
                        </td>

                        {/* Preguntas */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-700">
                            {tipo.secciones?.reduce((sum, sec) => sum + (sec.preguntas?.length || 0), 0) || 0}
                          </span>
                        </td>

                        {/* Llantas */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {tipo.revision_llantas?.activa ? (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-700 border border-green-200">
                              Sí
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3">
                          {tipo.activo ? (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded text-green-700 bg-green-50 border border-green-200">
                              Activo
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded text-red-700 bg-red-50 border border-red-200">
                              Inactivo
                            </span>
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
      {!loading && tiposRevision.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 text-center">
            {tiposRevision.length} tipo{tiposRevision.length !== 1 ? 's' : ''} de revisión · 
            {' '}{Object.keys(tiposPorVehiculo).length} categoría{Object.keys(tiposPorVehiculo).length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default TiposRevision;