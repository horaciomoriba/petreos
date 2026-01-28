import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import operadorService from '../../services/operator/operadorService';
import operadorCombustibleService from '../../services/operator/operadorCombustibleService';
import { showToast } from '../../utils/toast';

const MiVehiculo = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.userAuth);

  const [vehiculo, setVehiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    kilometraje: '',
    horasMotor: ''
  });

  // Estados para combustible
  const [cargasCombustible, setCargasCombustible] = useState([]);
  const [loadingCargas, setLoadingCargas] = useState(false);
  const [mostrarFormCombustible, setMostrarFormCombustible] = useState(false);
  const [formCombustible, setFormCombustible] = useState({
    litros_cargados: '',
    horas_motor_anterior: '',  // ⭐ NUEVO
    horas_motor_al_momento: '',
    kilometraje_anterior: '',   // ⭐ NUEVO
    kilometraje_al_momento: '',
    costo: '',
    gasolinera: '',
    numero_ticket: '',
    observaciones: ''
  });

  useEffect(() => {
    loadVehiculo();
    loadCargasCombustible();
  }, []);

  const loadVehiculo = async () => {
    try {
      setLoading(true);
      const response = await operadorService.getMiVehiculo();
      setVehiculo(response.vehiculo);
      setFormData({
        kilometraje: response.vehiculo?.kilometrajeActual || '',
        horasMotor: response.vehiculo?.horasMotorActual || ''
      });
    } catch (error) {
      console.error('Error al cargar vehículo:', error);
      showToast.error('Error al cargar información del vehículo');
    } finally {
      setLoading(false);
    }
  };

  const loadCargasCombustible = async () => {
    try {
      setLoadingCargas(true);
      const response = await operadorCombustibleService.getMisCargas(5);
      setCargasCombustible(response.data || []);
    } catch (error) {
      console.error('Error al cargar cargas:', error);
    } finally {
      setLoadingCargas(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await operadorService.actualizarDatosVehiculo({
        kilometraje: parseFloat(formData.kilometraje),
        horasMotor: parseFloat(formData.horasMotor)
      });

      setVehiculo(response.vehiculo);
      setEditMode(false);
      showToast.success('Datos actualizados correctamente');
    } catch (error) {
      console.error('Error al actualizar:', error);
      showToast.error(error.response?.data?.message || 'Error al actualizar datos');
    }
  };

  const handleCancel = () => {
    setFormData({
      kilometraje: vehiculo?.kilometrajeActual || '',
      horasMotor: vehiculo?.horasMotorActual || ''
    });
    setEditMode(false);
  };

  // ⭐ HANDLER ACTUALIZADO: Pre-llena con valores sugeridos
  const handleAbrirFormCombustible = async () => {
    try {
      const response = await operadorCombustibleService.getInfoVehiculoParaCarga();
      
      // Pre-llenar con valores sugeridos
      setFormCombustible({
        litros_cargados: '',
        horas_motor_anterior: response.valores_sugeridos?.horas_motor_anterior || '',
        horas_motor_al_momento: '',
        kilometraje_anterior: response.valores_sugeridos?.kilometraje_anterior || '',
        kilometraje_al_momento: '',
        costo: '',
        gasolinera: '',
        numero_ticket: '',
        observaciones: ''
      });
      
      setMostrarFormCombustible(true);
    } catch (error) {
      console.error('Error al obtener info del vehículo:', error);
      showToast.error('Error al cargar información del vehículo');
    }
  };

  // Handlers para combustible
  const handleChangeCombustible = (e) => {
    const { name, value } = e.target;
    setFormCombustible(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitCombustible = async (e) => {
    e.preventDefault();
    
    // ⭐ VALIDACIÓN: horas_anterior < horas_actual
    const horasAnterior = parseFloat(formCombustible.horas_motor_anterior);
    const horasActual = parseFloat(formCombustible.horas_motor_al_momento);
    
    if (horasAnterior > horasActual) {
      showToast.error('Las horas del motor anterior no pueden ser mayores a las horas actuales');
      return;
    }
    
    try {
      await operadorCombustibleService.registrarCarga({
        litros_cargados: parseFloat(formCombustible.litros_cargados),
        horas_motor_anterior: horasAnterior,  // ⭐ NUEVO
        horas_motor_al_momento: horasActual,
        kilometraje_anterior: formCombustible.kilometraje_anterior 
          ? parseFloat(formCombustible.kilometraje_anterior) 
          : undefined,
        kilometraje_al_momento: formCombustible.kilometraje_al_momento 
          ? parseFloat(formCombustible.kilometraje_al_momento) 
          : undefined,
        costo: formCombustible.costo ? parseFloat(formCombustible.costo) : undefined,
        gasolinera: formCombustible.gasolinera || undefined,
        numero_ticket: formCombustible.numero_ticket || undefined,
        observaciones: formCombustible.observaciones || undefined
      });

      showToast.success('Carga de combustible registrada');
      setMostrarFormCombustible(false);
      loadCargasCombustible();
      
      // Resetear form
      setFormCombustible({
        litros_cargados: '',
        horas_motor_anterior: '',
        horas_motor_al_momento: '',
        kilometraje_anterior: '',
        kilometraje_al_momento: '',
        costo: '',
        gasolinera: '',
        numero_ticket: '',
        observaciones: ''
      });
    } catch (error) {
      console.error('Error al registrar carga:', error);
      showToast.error(error.response?.data?.message || 'Error al registrar carga');
    }
  };

  const handleCancelarCombustible = () => {
    setMostrarFormCombustible(false);
    setFormCombustible({
      litros_cargados: '',
      horas_motor_anterior: '',
      horas_motor_al_momento: '',
      kilometraje_anterior: '',
      kilometraje_al_momento: '',
      costo: '',
      gasolinera: '',
      numero_ticket: '',
      observaciones: ''
    });
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm font-medium text-gray-600">Cargando información</p>
        </div>
      </div>
    );
  }

  if (!vehiculo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-50 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin vehículo asignado</h3>
            <p className="text-sm text-gray-600 mb-8">Contacta al administrador para que te asignen un vehículo</p>
            <button
              onClick={() => navigate('/operador/dashboard')}
              className="w-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/operador/dashboard')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>
              <div className="w-px h-6 bg-gray-200"></div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{vehiculo.placa}</h1>
                <p className="text-xs text-gray-500">#{vehiculo.numeroEconomico}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-xs font-semibold rounded-lg border ${
                vehiculo.disponibilidad === 'disponible' 
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : vehiculo.disponibilidad === 'en_uso'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {vehiculo.disponibilidad === 'disponible' ? 'Disponible' :
                 vehiculo.disponibilidad === 'en_uso' ? 'En Uso' : 'Mantenimiento'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Información Completa */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-transparent">
                <h2 className="text-base font-semibold text-gray-900">Información del vehículo</h2>
                <p className="text-xs text-gray-500 mt-0.5">Especificaciones y características</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Tipo</div>
                    <div className="text-sm font-semibold text-gray-900 capitalize">{vehiculo.tipoVehiculo}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Marca</div>
                    <div className="text-sm font-semibold text-gray-900">{vehiculo.marca}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Modelo</div>
                    <div className="text-sm font-semibold text-gray-900">{vehiculo.modelo}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Año</div>
                    <div className="text-sm font-semibold text-gray-900">{vehiculo.year}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Combustible</div>
                    <div className="text-sm font-semibold text-gray-900 capitalize">{vehiculo.tipoCombustible}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Capacidad</div>
                    <div className="text-sm font-semibold text-gray-900">{vehiculo.capacidadTanque} L</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Rendimiento</div>
                    <div className="text-sm font-semibold text-gray-900">{vehiculo.rendimientoPromedio} km/L</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Sede</div>
                    <div className="text-sm font-semibold text-gray-900">{vehiculo.sedeActual?.nombre || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Datos Operacionales */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Datos operacionales</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Kilometraje y horas del motor</p>
                  </div>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Actualizar
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {editMode ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Kilometraje actual
                        </label>
                        <input
                          type="number"
                          name="kilometraje"
                          value={formData.kilometraje}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.1"
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                          placeholder="15000"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">En kilómetros</p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Horas del motor
                        </label>
                        <input
                          type="number"
                          name="horasMotor"
                          value={formData.horasMotor}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.1"
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                          placeholder="1250"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">Horas operadas</p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        type="submit" 
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 rounded-lg transition-all shadow-sm hover:shadow-md"
                      >
                        Guardar cambios
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Kilometraje</div>
                          <div className="text-2xl font-bold text-gray-900 tracking-tight">
                            {vehiculo.kilometrajeActual?.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">kilómetros</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Horas motor</div>
                          <div className="text-2xl font-bold text-gray-900 tracking-tight">
                            {vehiculo.horasMotorActual?.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">horas</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ⭐ Cargas de Combustible - ACTUALIZADO */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Combustible</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Historial de cargas</p>
                  </div>
                  {!mostrarFormCombustible && (
                    <button
                      onClick={handleAbrirFormCombustible}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Nueva carga
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {mostrarFormCombustible ? (
                  <form onSubmit={handleSubmitCombustible} className="space-y-5">
                    
                    {/* ⭐ NUEVA SECCIÓN: Rango de horas/km */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-semibold text-blue-900 mb-1">Rango de trabajo</h4>
                          <p className="text-xs text-blue-700">
                            Registra las horas/km al inicio y al final del periodo de trabajo entre cargas
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Horas del motor (rango) */}
                    <div>
                      <div className="text-xs font-semibold text-gray-900 mb-3">Horas del motor</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Horas anteriores <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="horas_motor_anterior"
                            value={formCombustible.horas_motor_anterior}
                            onChange={handleChangeCombustible}
                            required
                            min="0"
                            step="0.1"
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="1200"
                          />
                          <p className="text-xs text-gray-500 mt-1.5">Al inicio del periodo</p>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Horas actuales <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="horas_motor_al_momento"
                            value={formCombustible.horas_motor_al_momento}
                            onChange={handleChangeCombustible}
                            required
                            min="0"
                            step="0.1"
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="1250"
                          />
                          <p className="text-xs text-gray-500 mt-1.5">Al momento de cargar</p>
                        </div>
                      </div>
                    </div>

                    {/* Kilometraje (rango) - opcional */}
                    <div>
                      <div className="text-xs font-semibold text-gray-900 mb-3">Kilometraje (opcional)</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Kilometraje anterior
                          </label>
                          <input
                            type="number"
                            name="kilometraje_anterior"
                            value={formCombustible.kilometraje_anterior}
                            onChange={handleChangeCombustible}
                            min="0"
                            step="0.1"
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="14500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Kilometraje actual
                          </label>
                          <input
                            type="number"
                            name="kilometraje_al_momento"
                            value={formCombustible.kilometraje_al_momento}
                            onChange={handleChangeCombustible}
                            min="0"
                            step="0.1"
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="15000"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Litros y detalles */}
                    <div>
                      <div className="text-xs font-semibold text-gray-900 mb-3">Detalles de la carga</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Litros cargados <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="litros_cargados"
                            value={formCombustible.litros_cargados}
                            onChange={handleChangeCombustible}
                            required
                            min="0.1"
                            step="0.1"
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="50.5"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Costo total
                          </label>
                          <input
                            type="number"
                            name="costo"
                            value={formCombustible.costo}
                            onChange={handleChangeCombustible}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="1500.00"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Gasolinera
                          </label>
                          <input
                            type="text"
                            name="gasolinera"
                            value={formCombustible.gasolinera}
                            onChange={handleChangeCombustible}
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="Shell Centro"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            No. de ticket
                          </label>
                          <input
                            type="text"
                            name="numero_ticket"
                            value={formCombustible.numero_ticket}
                            onChange={handleChangeCombustible}
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="A-12345"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Observaciones
                        </label>
                        <textarea
                          name="observaciones"
                          value={formCombustible.observaciones}
                          onChange={handleChangeCombustible}
                          rows="2"
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                          placeholder="Notas adicionales"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        type="submit" 
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        Registrar carga
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelarCombustible}
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    {loadingCargas ? (
                      <div className="text-center py-12">
                        <div className="relative inline-block">
                          <div className="w-10 h-10 border-3 border-gray-100 rounded-full"></div>
                          <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">Cargando cargas</p>
                      </div>
                    ) : cargasCombustible.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-14 h-14 mx-auto mb-4 bg-gray-50 rounded-xl flex items-center justify-center">
                          <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Sin cargas registradas</p>
                        <p className="text-xs text-gray-400">Registra tu primera carga</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cargasCombustible.map((carga) => (
                          <div 
                            key={carga._id} 
                            className="group p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                  <span className="text-lg font-bold text-gray-900 tracking-tight">
                                    {carga.litros_cargados}
                                  </span>
                                  <span className="text-xs font-medium text-gray-500">litros</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatearFecha(carga.fecha_carga)}
                                </div>
                              </div>
                              
                              {carga.rendimiento?.calculado && (
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {carga.rendimiento.consumo_por_hora.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-500">L/h</div>
                                </div>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium text-gray-900">{carga.horas_motor_al_momento}</span>
                                <span>hrs</span>
                              </div>
                              
                              {carga.rendimiento?.horas_trabajadas > 0 && (
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <span className="text-gray-500">Trabajadas:</span>
                                  <span className="font-medium text-gray-900">{carga.rendimiento.horas_trabajadas}</span>
                                  <span>hrs</span>
                                </div>
                              )}
                              
                              {carga.costo && (
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-medium text-gray-900">${carga.costo.toLocaleString()}</span>
                                </div>
                              )}
                              
                              {carga.gasolinera && (
                                <div className="col-span-2 flex items-center gap-1.5 text-gray-600 mt-1">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="truncate">{carga.gasolinera}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Navegación</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/operador/mis-revisiones')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Mis revisiones
                </button>

                <button
                  onClick={() => navigate('/operador/dashboard')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </button>
              </div>
            </div>

            {/* Neumáticos - Compacto */}
            {vehiculo.configuracionNeumaticos?.configurado && Array.isArray(vehiculo.configuracionNeumaticos.ejes) && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Neumáticos</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {vehiculo.configuracionNeumaticos.total_ejes} ejes • {vehiculo.configuracionNeumaticos.ejes.reduce((acc, eje) => acc + eje.neumaticos.length, 0)} totales
                  </p>
                </div>

                <div className="space-y-3">
                  {vehiculo.configuracionNeumaticos.ejes.map((eje, index) => {
                    const izquierda = eje.neumaticos.filter(n => n.lado === 'izquierdo');
                    const derecha = eje.neumaticos.filter(n => n.lado === 'derecho');

                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-xs font-semibold text-gray-900">{eje.nombre}</div>
                            <div className="text-xs text-gray-500">
                              {eje.neumaticos_por_lado === 1 ? 'Sencillo' : 
                               eje.neumaticos_por_lado === 2 ? 'Doble' : 'Triple'}
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-500">#{eje.numero}</span>
                        </div>

                        {/* Visualización Mini */}
                        <div className="flex items-center gap-2">
                          {/* Izquierda */}
                          <div className="flex gap-1">
                            {izquierda.map((neumatico, nIdx) => (
                              <div
                                key={nIdx}
                                className="w-6 h-10 bg-gray-800 rounded border border-gray-600 flex items-center justify-center"
                                title={`Posición ${neumatico.posicion} - Izq`}
                              >
                                <span className="text-white text-xs font-bold">{neumatico.posicion}</span>
                              </div>
                            ))}
                          </div>

                          {/* Eje */}
                          <div className="flex-1 h-1 bg-gray-400 rounded-full"></div>

                          {/* Derecha */}
                          <div className="flex gap-1">
                            {derecha.map((neumatico, nIdx) => (
                              <div
                                key={nIdx}
                                className="w-6 h-10 bg-gray-800 rounded border border-gray-600 flex items-center justify-center"
                                title={`Posición ${neumatico.posicion} - Der`}
                              >
                                <span className="text-white text-xs font-bold">{neumatico.posicion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
};

export default MiVehiculo;