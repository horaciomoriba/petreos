// src/pages/vehiculos/DetalleVehiculo.jsx
// Rediseñado siguiendo guía de diseño minimalista-industrial

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import vehiculoService from '../../services/vehiculoService';
import sedeService from '../../services/sedeService';
import { operadorService } from '../../services/operadorService';
import { showToast } from '../../utils/toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import TabNeumaticos from '../../components/vehiculos/TabNeumaticos';
import TabRevisiones from '../../components/vehiculos/TabRevisiones';
import TabCombustible from '../../components/vehiculos/TabCombustible';
import TabReparaciones from '../../components/vehiculos/TabReparaciones';

const DetalleVehiculo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehiculo, setVehiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sedes, setSedes] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [editandoSede, setEditandoSede] = useState(false);
  const [editandoOperador, setEditandoOperador] = useState(false);
  const [sedeSeleccionada, setSedeSeleccionada] = useState('');
  const [operadorSeleccionado, setOperadorSeleccionado] = useState('');
  const [editandoKm, setEditandoKm] = useState(false);
  const [editandoHoras, setEditandoHoras] = useState(false);
  const [nuevoKm, setNuevoKm] = useState('');
  const [nuevasHoras, setNuevasHoras] = useState('');

  useEffect(() => {
    loadVehiculo();
    loadSedes();
    loadOperadores();
  }, [id]);

  const loadVehiculo = async () => {
    try {
      setLoading(true);
      const data = await vehiculoService.getById(id);
      setVehiculo(data);
      setNuevoKm(data.kilometraje_actual || 0);
      setNuevasHoras(data.horas_motor_actual || 0);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al cargar vehículo');
      navigate('/vehiculos');
    } finally {
      setLoading(false);
    }
  };

  const loadSedes = async () => {
    try {
      const response = await sedeService.getAll();
      setSedes(response.sedes || response.data || []);
    } catch (error) {
      console.error('Error al cargar sedes:', error);
      setSedes([]);
    }
  };

  const loadOperadores = async () => {
    try {
      const response = await operadorService.getAll();
      setOperadores(response.data || []);
    } catch (error) {
      console.error('Error al cargar operadores:', error);
      setOperadores([]);
    }
  };
  
  const handleDelete = async () => {
    try {
      await vehiculoService.delete(id);
      showToast.success('Vehículo eliminado correctamente');
      navigate('/vehiculos');
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al eliminar vehículo');
    }
  };

  const handleCambiarDisponibilidad = async (nuevaDisponibilidad) => {
    try {
      await vehiculoService.cambiarDisponibilidad(id, nuevaDisponibilidad);
      showToast.success('Disponibilidad actualizada');
      loadVehiculo();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al actualizar disponibilidad');
    }
  };

  const handleActualizarKm = async () => {
    if (!nuevoKm || nuevoKm < 0) {
      showToast.error('Kilometraje inválido');
      return;
    }

    try {
      await vehiculoService.actualizarKilometraje(id, parseFloat(nuevoKm));
      showToast.success('Kilometraje actualizado');
      setEditandoKm(false);
      loadVehiculo();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al actualizar kilometraje');
    }
  };

  const handleActualizarHoras = async () => {
    if (!nuevasHoras || nuevasHoras < 0) {
      showToast.error('Horas inválidas');
      return;
    }

    try {
      await vehiculoService.actualizarHorasMotor(id, parseFloat(nuevasHoras));
      showToast.success('Horas de motor actualizadas');
      setEditandoHoras(false);
      loadVehiculo();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al actualizar horas');
    }
  };

  const handleCambiarSede = async () => {
    if (!sedeSeleccionada) {
      showToast.error('Selecciona una sede');
      return;
    }

    try {
      await vehiculoService.update(id, { sede_actual: sedeSeleccionada });
      showToast.success('Sede actualizada');
      setEditandoSede(false);
      loadVehiculo();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al actualizar sede');
    }
  };

  const handleCambiarOperador = async () => {
    try {
      await vehiculoService.asignarOperador(id, operadorSeleccionado || null);
      showToast.success(operadorSeleccionado ? 'Operador asignado' : 'Operador removido');
      setEditandoOperador(false);
      loadVehiculo();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al asignar operador');
    }
  };

  // Badge de disponibilidad (solo estados con significado)
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

  const getTipoVehiculoTexto = (tipo) => {
    const textos = {
      olla_revolvedora: 'Olla Revolvedora',
      planta_de_concreto: 'Planta de Concreto',
      cargador_frontal: 'Cargador Frontal',
      camioneta_pickup: 'Camioneta Pickup',
      grua: 'Grúa',
      bomba_de_concreto: 'Bomba de Concreto',
      automovil: 'Automóvil'
    };
    return textos[tipo] || tipo;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-sm font-medium text-gray-600 mt-4">Cargando vehículo</p>
      </div>
    );
  }

  if (!vehiculo) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-gray-50 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">Vehículo no encontrado</p>
        </div>
      </div>
    );
  }

  // Tabs sin iconos decorativos
  const tabs = [
    { id: 'general', name: 'General' },
    { id: 'neumaticos', name: 'Neumáticos' },
    { id: 'revisiones', name: 'Revisiones' },
    { id: 'reparaciones', name: 'Reparaciones' },
    { id: 'combustible', name: 'Combustible' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb/Back - Minimalista */}
      <button
        onClick={() => navigate('/vehiculos')}
        className="text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors inline-flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* Header - Jerarquía clara, sin redundancia */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {/* ⭐ CAMBIO: numero_economico como título principal */}
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{vehiculo.numero_economico}</h1>
              {/* ⭐ CAMBIO: placa como secundario (sin #) */}
              <span className="text-sm font-medium text-gray-500">{vehiculo.placa}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {vehiculo.marca} {vehiculo.modelo}
              {vehiculo.year && ` · ${vehiculo.year}`}
              {vehiculo.color && ` · ${vehiculo.color}`}
            </p>
            
            {/* Badges - Solo info importante */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                {getTipoVehiculoTexto(vehiculo.tipo_vehiculo)}
              </span>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getDisponibilidadBadge(vehiculo.disponibilidad)}`}>
                {getDisponibilidadTexto(vehiculo.disponibilidad)}
              </span>
            </div>
          </div>

          {/* Acciones - Simplificadas */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/vehiculos/${id}/editar`)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 
                bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
            >
              Editar
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700
                bg-red-50 hover:bg-red-100 rounded-lg transition-all border border-red-200"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs - Sin iconos */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* TAB: GENERAL */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Ubicación y Asignación - Primero porque es más importante */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Asignación
              </h2>
              
              <div className="space-y-4 text-sm">
                {/* Sede */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Sede actual</span>
                    {!editandoSede && (
                      <button
                        onClick={() => {
                          setSedeSeleccionada(vehiculo.sede_actual?._id || '');
                          setEditandoSede(true);
                        }}
                        className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Cambiar
                      </button>
                    )}
                  </div>
                  
                  {editandoSede ? (
                    <div className="space-y-2">
                      <select
                        value={sedeSeleccionada}
                        onChange={(e) => setSedeSeleccionada(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      >
                        <option value="">Seleccionar sede</option>
                        {sedes.map(sede => (
                          <option key={sede._id} value={sede._id}>
                            {sede.nombre}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCambiarSede}
                          className="flex-1 px-3 py-1.5 text-xs font-semibold text-white 
                            bg-gradient-to-r from-gray-900 to-gray-700 
                            hover:from-gray-800 hover:to-gray-600 
                            rounded-lg transition-all"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditandoSede(false)}
                          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 
                            hover:text-gray-900 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-900">
                      {vehiculo.sede_actual?.nombre || 'Sin asignar'}
                    </p>
                  )}
                </div>

                {/* Operador */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Operador</span>
                    {!editandoOperador && (
                      <button
                        onClick={() => {
                          setOperadorSeleccionado(vehiculo.operador_actual?._id || '');
                          setEditandoOperador(true);
                        }}
                        className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Cambiar
                      </button>
                    )}
                  </div>

                  {editandoOperador ? (
                    <div className="space-y-2">
                      <select
                        value={operadorSeleccionado}
                        onChange={(e) => setOperadorSeleccionado(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      >
                        <option value="">Sin asignar</option>
                        {operadores.map(operador => (
                          <option key={operador._id} value={operador._id}>
                            {operador.nombre}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCambiarOperador}
                          className="flex-1 px-3 py-1.5 text-xs font-semibold text-white 
                            bg-gradient-to-r from-gray-900 to-gray-700 
                            hover:from-gray-800 hover:to-gray-600 
                            rounded-lg transition-all"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditandoOperador(false)}
                          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 
                            hover:text-gray-900 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-900">
                      {vehiculo.operador_actual?.nombre || 'Sin asignar'}
                    </p>
                  )}
                </div>

                {/* Disponibilidad */}
                <div className="border-t border-gray-100 pt-4">
                  <span className="text-xs font-medium text-gray-700 block mb-2">
                    Estado de disponibilidad
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['disponible', 'en_servicio', 'mantenimiento', 'fuera_servicio'].map((disp) => (
                      <button
                        key={disp}
                        onClick={() => handleCambiarDisponibilidad(disp)}
                        className={`px-2 py-0.5 text-xs font-semibold rounded transition-all ${
                          vehiculo.disponibilidad === disp
                            ? getDisponibilidadBadge(disp)
                            : 'text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {getDisponibilidadTexto(disp)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Medidores - Más visual */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Datos Operacionales
              </h2>
              
              <div className="space-y-4">
                {/* Kilometraje */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Kilometraje</span>
                    {!editandoKm && (
                      <button
                        onClick={() => setEditandoKm(true)}
                        className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                  
                  {editandoKm ? (
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={nuevoKm}
                        onChange={(e) => setNuevoKm(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        min="0"
                        placeholder="Kilometraje actual"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleActualizarKm}
                          className="flex-1 px-3 py-1.5 text-xs font-semibold text-white 
                            bg-gradient-to-r from-gray-900 to-gray-700 
                            hover:from-gray-800 hover:to-gray-600 
                            rounded-lg transition-all"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditandoKm(false);
                            setNuevoKm(vehiculo.kilometraje_actual);
                          }}
                          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 
                            hover:text-gray-900 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {vehiculo.kilometraje_actual?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">kilómetros</p>
                    </div>
                  )}
                </div>

                {/* Horas de Motor */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Horas de motor</span>
                    {!editandoHoras && (
                      <button
                        onClick={() => setEditandoHoras(true)}
                        className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                  
                  {editandoHoras ? (
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={nuevasHoras}
                        onChange={(e) => setNuevasHoras(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        min="0"
                        placeholder="Horas de motor"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleActualizarHoras}
                          className="flex-1 px-3 py-1.5 text-xs font-semibold text-white 
                            bg-gradient-to-r from-gray-900 to-gray-700 
                            hover:from-gray-800 hover:to-gray-600 
                            rounded-lg transition-all"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditandoHoras(false);
                            setNuevasHoras(vehiculo.horas_motor_actual);
                          }}
                          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 
                            hover:text-gray-900 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {vehiculo.horas_motor_actual?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">horas de uso</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Especificaciones - Compacto, solo lo relevante */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Especificaciones
              </h2>
              
              <div className="space-y-3 text-sm">
                {vehiculo.vin && (
                  <div>
                    <span className="text-xs font-medium text-gray-700 block mb-1">VIN</span>
                    <span className="font-mono text-xs text-gray-900">{vehiculo.vin}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-100 pt-3">
                  <span className="text-xs font-medium text-gray-700 block mb-1">Combustible</span>
                  <p className="text-gray-900 capitalize">{vehiculo.tipo_combustible}</p>
                  {vehiculo.capacidad_tanque > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Capacidad: {vehiculo.capacidad_tanque} L
                    </p>
                  )}
                </div>

                {vehiculo.configuracion_neumaticos?.configurado && (
                  <div className="border-t border-gray-100 pt-3">
                    <span className="text-xs font-medium text-gray-700 block mb-1">Neumáticos</span>
                    <p className="text-gray-900">
                      {vehiculo.configuracion_neumaticos.total_ejes} eje{vehiculo.configuracion_neumaticos.total_ejes !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {vehiculo.configuracion_neumaticos.total_neumaticos} neumáticos totales
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: NEUMÁTICOS */}
        {activeTab === 'neumaticos' && (
          <TabNeumaticos vehiculo={vehiculo} onUpdate={loadVehiculo} />
        )}

        {/* TAB: REVISIONES */}
        {activeTab === 'revisiones' && (
          <TabRevisiones vehiculo={vehiculo} onUpdate={loadVehiculo} />
        )}

        {/* TAB: REPARACIONES */}
        {activeTab === 'reparaciones' && (
          <TabReparaciones vehiculo={vehiculo} />
        )}

        {/* TAB: COMBUSTIBLE */}
        {activeTab === 'combustible' && (
          <TabCombustible vehiculo={vehiculo} onUpdate={loadVehiculo} />
        )}
      </div>

      {/* Modal de Confirmación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="¿Eliminar vehículo?"
        message={`Esta acción eliminará permanentemente el vehículo "${vehiculo.numero_economico}".`}
        type="danger"
      />
    </div>
  );
};

export default DetalleVehiculo;