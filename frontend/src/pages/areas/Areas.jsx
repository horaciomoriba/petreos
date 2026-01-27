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

  // Abrir modal para crear
  const handleCreate = () => {
    setSelectedArea(null);
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEdit = (area) => {
    setSelectedArea(area);
    setShowModal(true);
  };

  // Guardar área (crear o actualizar)
  const handleSave = async (formData) => {
    try {
      if (selectedArea) {
        // Actualizar
        await areaService.update(selectedArea._id, formData);
        showToast.success('Área actualizada correctamente');
      } else {
        // Crear
        await areaService.create(formData);
        showToast.success('Área creada correctamente');
      }
      setShowModal(false);
      loadAreas();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al guardar área');
    }
  };

  // Confirmar eliminación
  const handleDeleteClick = (area) => {
    setAreaToDelete(area);
    setShowConfirmModal(true);
  };

  // Eliminar área
  const handleDelete = async () => {
    try {
      await areaService.delete(areaToDelete._id);
      showToast.success('Área desactivada correctamente');
      loadAreas();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al desactivar área');
    }
  };

  // Toggle activo/inactivo
  const handleToggleActive = async (area) => {
    try {
      await areaService.update(area._id, { activo: !area.activo });
      showToast.success(`Área ${area.activo ? 'desactivada' : 'activada'} correctamente`);
      loadAreas();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al actualizar área');
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroSede('');
    setFiltroActivo('');
  };

  // Verificar si hay filtros activos
  const hasFiltrosActivos = filtroSede || filtroActivo !== '';

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-900 mb-2">Gestión de Áreas</h1>
        <p className="text-sm text-primary-600">Administra las áreas de cada sede</p>
      </div>

      {/* Filtros y Acciones */}
      <div className="bg-white rounded-xl border border-primary-200 p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtro Sede */}
            <div>
              <label className="label">Sede</label>
              <select
                value={filtroSede}
                onChange={(e) => setFiltroSede(e.target.value)}
                className="input"
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
              <label className="label">Estado</label>
              <select
                value={filtroActivo}
                onChange={(e) => setFiltroActivo(e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>

            {/* Botones de acción */}
            <div className="flex items-end gap-2">
              {hasFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="btn-outline flex-1"
                >
                  Limpiar filtros
                </button>
              )}
              <button
                onClick={handleCreate}
                className="btn-primary flex items-center gap-2 flex-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Área
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table/Cards */}
      <div className="bg-white rounded-xl border border-primary-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner h-8 w-8"></div>
          </div>
        ) : areas.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-primary-900">No hay áreas</h3>
            <p className="mt-1 text-sm text-primary-500">
              {hasFiltrosActivos ? 'No se encontraron áreas con ese criterio' : 'Comienza creando una nueva área'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Área</th>
                    <th>Sede</th>
                    <th>Estado</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {areas.map((area) => (
                    <tr key={area._id}>
                      <td>
                        <div className="font-semibold text-primary-900">{area.nombre}</div>
                        {area.descripcion && (
                          <div className="text-xs text-primary-500 mt-0.5">{area.descripcion}</div>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <div>
                            <div className="font-medium text-primary-700">{area.sede?.nombre}</div>
                            {area.sede?.ubicacion && (
                              <div className="text-xs text-primary-500">{area.sede.ubicacion}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleActive(area)}
                          className={`badge-${area.activo ? 'primary' : 'secondary'} cursor-pointer hover:opacity-80`}
                        >
                          {area.activo ? 'Activa' : 'Inactiva'}
                        </button>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(area)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(area)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Desactivar"
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

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-primary-200">
              {areas.map((area) => (
                <div key={area._id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary-900">{area.nombre}</h3>
                      {area.descripcion && (
                        <p className="text-xs text-primary-500 mt-1">{area.descripcion}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleActive(area)}
                      className={`badge-${area.activo ? 'primary' : 'secondary'} cursor-pointer ml-2`}
                    >
                      {area.activo ? 'Activa' : 'Inactiva'}
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm text-primary-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div>
                        <span className="font-medium">{area.sede?.nombre}</span>
                        {area.sede?.ubicacion && (
                          <span className="text-xs text-primary-500 ml-1">• {area.sede.ubicacion}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(area)}
                      className="btn-secondary btn-sm flex-1 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(area)}
                      className="btn-outline btn-sm flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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