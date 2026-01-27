// src/pages/tipos-revision/TiposRevision.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tipoRevisionService from '../../services/tipoRevisionService';
import { showToast } from '../../utils/toast';

const TiposRevision = () => {
  const navigate = useNavigate();
  const [tiposRevision, setTiposRevision] = useState([]);
  const [loading, setLoading] = useState(true);
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
    setTimeout(() => loadTiposRevision(), 0);
  };

  // Agrupar tipos de revisión por tipo de vehículo
  const tiposPorVehiculo = tiposRevision.reduce((acc, tipo) => {
    const tipoVeh = tipo.tipo_vehiculo;
    if (!acc[tipoVeh]) {
      acc[tipoVeh] = [];
    }
    acc[tipoVeh].push(tipo);
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

  const getTipoVehiculoTexto = (tipo) => {
    const textos = {
      olla_revolvedora: 'Olla Revolvedora',
      planta_de_concreto: 'Planta de Concreto',
      camion_carga_frontal: 'Camión de Carga Frontal',
      camioneta_pickup: 'Camioneta Pickup',
      grua: 'Grúa'
    };
    return textos[tipo] || tipo;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tipos de Revisión</h1>
        <p className="text-sm text-gray-600 mt-1">Gestiona los checklists de revisión por tipo de vehículo</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {/* Tipo de Vehículo */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Tipo de Vehículo
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

          {/* Estado */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Estado
            </label>
            <select
              value={filtros.activo}
              onChange={(e) => setFiltros({ ...filtros, activo: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                transition-all"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
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
          <div className="ml-auto">
            <button 
              onClick={() => navigate('/tipos-revision/nuevo')}
              className="px-5 py-2.5 text-sm font-semibold text-white 
                bg-gradient-to-r from-gray-900 to-gray-700 
                hover:from-gray-800 hover:to-gray-600 
                rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Nuevo Tipo
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
          <p className="text-sm font-medium text-gray-600 mt-4">Cargando tipos de revisión</p>
        </div>
      ) : tiposRevision.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-gray-50 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            {filtros.tipo_vehiculo || filtros.frecuencia || filtros.activo !== ''
              ? 'No se encontraron tipos de revisión'
              : 'Sin tipos de revisión registrados'}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            {filtros.tipo_vehiculo || filtros.frecuencia || filtros.activo !== ''
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Agrega el primer checklist para comenzar'}
          </p>
          {!filtros.tipo_vehiculo && !filtros.frecuencia && filtros.activo === '' && (
            <button
              onClick={() => navigate('/tipos-revision/nuevo')}
              className="px-5 py-2.5 text-sm font-semibold text-white 
                bg-gradient-to-r from-gray-900 to-gray-700 
                hover:from-gray-800 hover:to-gray-600 
                rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Crear Tipo de Revisión
            </button>
          )}
        </div>
      ) : (
        /* Tipos agrupados por tipo de vehículo */
        <div className="space-y-8">
          {Object.entries(tiposPorVehiculo).map(([tipoVeh, tiposDelVehiculo]) => (
            <div key={tipoVeh} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header de cada grupo */}
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {tiposVehiculo[tipoVeh] || tipoVeh}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tiposDelVehiculo.length} checklist{tiposDelVehiculo.length !== 1 ? 's' : ''}
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
                        Nombre
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Código
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Frecuencia
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Secciones
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Preguntas
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Llantas
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tiposDelVehiculo.map((tipo) => (
                      <tr
                        key={tipo._id}
                        onClick={() => navigate(`/tipos-revision/${tipo._id}`)}
                        className="group hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {/* Nombre */}
                        <td className="px-5 py-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                            {tipo.nombre}
                          </div>
                        </td>

                        {/* Código */}
                        <td className="px-5 py-4">
                          <span className="text-sm font-mono text-gray-600">
                            {tipo.codigo}
                          </span>
                        </td>

                        {/* Frecuencia */}
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded capitalize ${getBadgeFrecuencia(tipo.frecuencia)}`}>
                            {tipo.frecuencia}
                          </span>
                        </td>

                        {/* Secciones */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-700">
                            {tipo.secciones?.length || 0}
                          </span>
                        </td>

                        {/* Preguntas */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-700">
                            {tipo.secciones?.reduce((sum, sec) => sum + (sec.preguntas?.length || 0), 0) || 0}
                          </span>
                        </td>

                        {/* Llantas */}
                        <td className="px-5 py-4">
                          {tipo.revision_llantas?.activa ? (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-700 border border-green-200">
                              Sí
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="px-5 py-4">
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
        <div className="mt-6">
          <p className="text-xs text-gray-500 text-center">
            Total: {tiposRevision.length} tipo{tiposRevision.length !== 1 ? 's' : ''} de revisión · 
            {' '}{Object.keys(tiposPorVehiculo).length} tipo{Object.keys(tiposPorVehiculo).length !== 1 ? 's' : ''} de vehículo
          </p>
        </div>
      )}
    </div>
  );
};

export default TiposRevision;