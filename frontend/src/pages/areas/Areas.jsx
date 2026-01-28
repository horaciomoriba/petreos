import { useState, useEffect } from 'react';
import { areaService } from '../../services/areaService';
import { sedeService } from '../../services/sedeService';
import { showToast } from '../../utils/toast';
import AreasModal from '../../components/areas/AreasModal';
import ConfirmModal from '../../components/common/ConfirmModal';

const Areas = () => {
  const [areas, setAreas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroSede, setFiltroSede] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [areaToDelete, setAreaToDelete] = useState(null);

  useEffect(() => {
    loadSedes();
  }, []);

  useEffect(() => {
    loadAreas();
  }, [filtroSede, filtroActivo]);

  const loadSedes = async () => {
    try {
      const response = await sedeService.getAll();
      setSedes(response.data);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al cargar sedes');
    }
  };

  const loadAreas = async () => {
    try {
      setLoading(true);
      const filtros = {};
      if (filtroSede) filtros.sedeId = filtroSede;
      if (filtroActivo !== '') filtros.activo = filtroActivo;

      const response = await areaService.getAll(filtros);
      setAreas(response.data);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al cargar áreas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedArea(null);
    setShowModal(true);
  };

  const handleEdit = (area) => {
    setSelectedArea(area);
    setShowModal(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedArea) {
        await areaService.update(selectedArea._id, formData);
        showToast.success('Área actualizada correctamente');
      } else {
        await areaService.create(formData);
        showToast.success('Área creada correctamente');
      }
      setShowModal(false);
      loadAreas();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al guardar área');
    }
  };

  const handleDeleteClick = (area) => {
    setAreaToDelete(area);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    try {
      await areaService.delete(areaToDelete._id);
      showToast.success('Área desactivada correctamente');
      loadAreas();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al desactivar área');
    }
  };

  const handleToggleActive = async (area) => {
    try {
      await areaService.update(area._id, { activo: !area.activo });
      showToast.success(`Área ${area.activo ? 'desactivada' : 'activada'} correctamente`);
      loadAreas();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al actualizar área');
    }
  };

  const limpiarFiltros = () => {
    setFiltroSede('');
    setFiltroActivo('');
    setMostrarFiltros(false);
  };

  // Contar filtros activos
  const contarFiltrosActivos = () => {
    let count = 0;
    if (filtroSede) count++;
    if (filtroActivo !== '') count++;
    return count;
  };

  const filtrosActivos = contarFiltrosActivos();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Gestión de Áreas</h1>
        <p className="text-xs text-gray-600 mt-0.5">Administra las áreas de cada sede</p>
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

            {/* Botón Nueva Área (Desktop) */}
            <button
              onClick={handleCreate}
              className="hidden sm:flex items-center gap-1.5 ml-auto px-4 py-2 text-sm font-semibold 
                text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nueva Área
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
              {/* Filtro Sede */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Sede
                </label>
                <select
                  value={filtroSede}
                  onChange={(e) => setFiltroSede(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                    focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Todas las sedes</option>
                  {sedes.map((sede) => (
                    <option key={sede._id} value={sede._id}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Estado */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Estado
                </label>
                <select
                  value={filtroActivo}
                  onChange={(e) => setFiltroActivo(e.target.value)}
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
                  onClick={limpiarFiltros}
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón flotante "Nueva Área" en mobile */}
      <button
        onClick={handleCreate}
        className="sm:hidden fixed bottom-6 right-4 w-14 h-14 bg-gray-900 hover:bg-gray-800 
          text-white rounded-full shadow-lg flex items-center justify-center z-30
          transition-all active:scale-95"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Table/Cards */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-10 h-10 border-3 border-gray-100 rounded-full"></div>
              <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="text-sm text-gray-600 mt-3">Cargando áreas...</p>
          </div>
        ) : areas.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">No hay áreas</p>
            <p className="text-xs text-gray-400">
              {filtrosActivos > 0 ? 'No se encontraron áreas' : 'Comienza creando una nueva área'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                      Área
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                      Sede
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50">
                      Estado
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 bg-gray-50">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {areas.map((area) => (
                    <tr key={area._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">{area.nombre}</div>
                        {area.descripcion && (
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{area.descripcion}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <div>
                            <div className="text-sm text-gray-900">{area.sede?.nombre}</div>
                            {area.sede?.ubicacion && (
                              <div className="text-xs text-gray-500">{area.sede.ubicacion}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(area)}
                          className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors ${
                            area.activo
                              ? 'text-green-700 bg-green-50 border border-green-200 hover:bg-green-100'
                              : 'text-red-700 bg-red-50 border border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {area.activo ? 'Activa' : 'Inactiva'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(area)}
                            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(area)}
                            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                            title="Desactivar"
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

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {areas.map((area) => (
                <div key={area._id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">{area.nombre}</h3>
                      {area.descripcion && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{area.descripcion}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleActive(area)}
                      className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded flex-shrink-0 ${
                        area.activo
                          ? 'text-green-700 bg-green-50 border border-green-200'
                          : 'text-red-700 bg-red-50 border border-red-200'
                      }`}
                    >
                      {area.activo ? 'Activa' : 'Inactiva'}
                    </button>
                  </div>
                  
                  <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div className="min-w-0">
                      <span className="font-medium">{area.sede?.nombre}</span>
                      {area.sede?.ubicacion && (
                        <span className="text-xs text-gray-500 ml-1">• {area.sede.ubicacion}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(area)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 
                        rounded-lg transition-colors border border-gray-200 flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(area)}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 
                        rounded-lg transition-colors border border-red-200 flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Desactivar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AreasModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        area={selectedArea}
        sedes={sedes}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title="¿Desactivar área?"
        message={`¿Estás seguro de que deseas desactivar el área "${areaToDelete?.nombre}"? Esta acción se puede revertir reactivándola.`}
        type="danger"
      />
    </div>
  );
};

export default Areas;