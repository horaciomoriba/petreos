// src/pages/vehiculos/NuevoVehiculo.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import vehiculoService from '../../services/vehiculoService';
import sedeService from '../../services/sedeService';
import { showToast } from '../../utils/toast';

const NuevoVehiculo = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sedes, setSedes] = useState([]);
  const [loadingSedes, setLoadingSedes] = useState(true);

  // Estado del formulario
  const [formData, setFormData] = useState({
    // Paso 1: Información Básica
    placa: '',
    numero_economico: '',
    tipo_vehiculo: 'olla_revolvedora',
    marca: '',
    modelo: '',
    year: new Date().getFullYear(),
    vin: '',
    color: '',
    
    // Paso 2: Asignación
    sede_actual: '',
    tipo_combustible: 'diesel',
    capacidad_tanque: 0,
    
    // Paso 3: Medidores Iniciales
    kilometraje_actual: 0,
    horas_motor_actual: 0
  });

  const [errors, setErrors] = useState({});

  // Cargar sedes al montar el componente
  useEffect(() => {
    loadSedes();
  }, []);

  const loadSedes = async () => {
    try {
      setLoadingSedes(true);
      const response = await sedeService.getAll();
      setSedes(response.sedes || response.data || []);
    } catch (error) {
      console.error('Error al cargar sedes:', error);
      setSedes([]);
    } finally {
      setLoadingSedes(false);
    }
  };

  // Tipos de vehículo
  const tiposVehiculo = [
    { value: 'olla_revolvedora', label: 'Olla Revolvedora de Concreto' },
    { value: 'planta_de_concreto', label: 'Planta de Concreto' },
    { value: 'cargador_frontal', label: 'Cargador Frontal' },
    { value: 'camioneta_pickup', label: 'Camioneta Pickup' },
    { value: 'grua', label: 'Grúa' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.placa.trim()) newErrors.placa = 'La placa es requerida';
      if (!formData.numero_economico.trim()) newErrors.numero_economico = 'El número económico es requerido';
      if (!formData.marca.trim()) newErrors.marca = 'La marca es requerida';
      if (!formData.modelo.trim()) newErrors.modelo = 'El modelo es requerido';
      if (!formData.year) newErrors.year = 'El año es requerido';
      if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
        newErrors.year = 'Año inválido';
      }
    }

    if (step === 2) {
      if (!formData.sede_actual) newErrors.sede_actual = 'La sede es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);
      
      // Preparar datos para enviar
      const dataToSend = {
        placa: formData.placa.toUpperCase(),
        numero_economico: formData.numero_economico.toUpperCase(),
        tipo_vehiculo: formData.tipo_vehiculo,
        marca: formData.marca,
        modelo: formData.modelo,
        year: parseInt(formData.year),
        vin: formData.vin || undefined,
        color: formData.color || undefined,
        sede_actual: formData.sede_actual || undefined,
        tipo_combustible: formData.tipo_combustible,
        capacidad_tanque: parseFloat(formData.capacidad_tanque) || 0,
        kilometraje_actual: parseFloat(formData.kilometraje_actual) || 0,
        horas_motor_actual: parseFloat(formData.horas_motor_actual) || 0
      };

      const response = await vehiculoService.create(dataToSend);
      
      showToast.success('Vehículo creado exitosamente');
      navigate(`/vehiculos/${response.vehiculo._id}`);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al crear vehículo');
    } finally {
      setLoading(false);
    }
  };

  // Steps del wizard
  const steps = [
    { number: 1, title: 'Información Básica', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { number: 2, title: 'Asignación', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
    { number: 3, title: 'Medidores', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { number: 4, title: 'Revisión', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/vehiculos')}
          className="text-sm text-primary-600 hover:text-primary-900 mb-4 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a vehículos
        </button>
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Nuevo Vehículo</h1>
        <p className="text-sm text-primary-600">Completa la información para registrar un nuevo vehículo</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                  currentStep >= step.number 
                    ? 'bg-primary-900 text-white' 
                    : 'bg-primary-100 text-primary-500'
                }`}>
                  {currentStep > step.number ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                    </svg>
                  )}
                </div>
                <p className={`text-xs font-medium text-center ${
                  currentStep >= step.number ? 'text-primary-900' : 'text-primary-500'
                }`}>
                  {step.title}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-4 mb-8 ${
                  currentStep > step.number ? 'bg-primary-900' : 'bg-primary-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl border border-primary-200 p-6 lg:p-8">
        
        {/* PASO 1: INFORMACIÓN BÁSICA */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-primary-900 mb-6">Información Básica del Vehículo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Placa */}
              <div>
                <label className="label">
                  Placa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="placa"
                  value={formData.placa}
                  onChange={handleChange}
                  className={`input uppercase ${errors.placa ? 'input-error' : ''}`}
                  placeholder="Ej: ABC-1234"
                />
                {errors.placa && <p className="mt-1 text-xs text-red-600">{errors.placa}</p>}
              </div>

              {/* Número Económico */}
              <div>
                <label className="label">
                  Número Económico <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="numero_economico"
                  value={formData.numero_economico}
                  onChange={handleChange}
                  className={`input uppercase ${errors.numero_economico ? 'input-error' : ''}`}
                  placeholder="Ej: 7720"
                />
                {errors.numero_economico && <p className="mt-1 text-xs text-red-600">{errors.numero_economico}</p>}
              </div>

              {/* Tipo de Vehículo */}
              <div>
                <label className="label">
                  Tipo de Vehículo <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipo_vehiculo"
                  value={formData.tipo_vehiculo}
                  onChange={handleChange}
                  className="input"
                >
                  {tiposVehiculo.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>

              {/* Marca */}
              <div>
                <label className="label">
                  Marca <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  className={`input ${errors.marca ? 'input-error' : ''}`}
                  placeholder="Ej: Mack"
                />
                {errors.marca && <p className="mt-1 text-xs text-red-600">{errors.marca}</p>}
              </div>

              {/* Modelo */}
              <div>
                <label className="label">
                  Modelo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  className={`input ${errors.modelo ? 'input-error' : ''}`}
                  placeholder="Ej: Granite"
                />
                {errors.modelo && <p className="mt-1 text-xs text-red-600">{errors.modelo}</p>}
              </div>

              {/* Año */}
              <div>
                <label className="label">
                  Año <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`input ${errors.year ? 'input-error' : ''}`}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
                {errors.year && <p className="mt-1 text-xs text-red-600">{errors.year}</p>}
              </div>

              {/* VIN */}
              <div>
                <label className="label">VIN (Opcional)</label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  className="input uppercase"
                  placeholder="Ej: 1HGBH41JXMN109186"
                />
              </div>

              {/* Color */}
              <div>
                <label className="label">Color (Opcional)</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ej: Blanco"
                />
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: ASIGNACIÓN */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-primary-900 mb-6">Asignación y Combustible</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sede */}
              <div>
                <label className="label">
                  Sede Actual <span className="text-red-500">*</span>
                </label>
                <select
                  name="sede_actual"
                  value={formData.sede_actual}
                  onChange={handleChange}
                  className={`input ${errors.sede_actual ? 'input-error' : ''}`}
                  disabled={loadingSedes}
                >
                  <option value="">
                    {loadingSedes ? 'Cargando sedes...' : 'Seleccionar sede...'}
                  </option>
                  {sedes.map(sede => (
                    <option key={sede._id} value={sede._id}>
                      {sede.nombre} {sede.ciudad && `- ${sede.ciudad}`}
                    </option>
                  ))}
                </select>
                {errors.sede_actual && <p className="mt-1 text-xs text-red-600">{errors.sede_actual}</p>}
              </div>

              {/* Tipo de Combustible */}
              <div>
                <label className="label">Tipo de Combustible</label>
                <select
                  name="tipo_combustible"
                  value={formData.tipo_combustible}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="diesel">Diésel</option>
                  <option value="gasolina">Gasolina</option>
                  <option value="gas">Gas</option>
                </select>
              </div>

              {/* Capacidad del Tanque */}
              <div>
                <label className="label">Capacidad del Tanque (litros)</label>
                <input
                  type="number"
                  name="capacidad_tanque"
                  value={formData.capacidad_tanque}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  step="0.1"
                  placeholder="Ej: 200"
                />
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: MEDIDORES */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-primary-900 mb-6">Medidores Iniciales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kilometraje Actual */}
              <div>
                <label className="label">Kilometraje Actual (km)</label>
                <input
                  type="number"
                  name="kilometraje_actual"
                  value={formData.kilometraje_actual}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-primary-500">Deja en 0 si es vehículo nuevo</p>
              </div>

              {/* Horas de Motor */}
              <div>
                <label className="label">Horas de Motor</label>
                <input
                  type="number"
                  name="horas_motor_actual"
                  value={formData.horas_motor_actual}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-primary-500">Solo si aplica para este tipo de vehículo</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Información importante</p>
                  <p>Después de crear el vehículo, podrás configurar:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Estructura de neumáticos (ejes, simple/dual)</li>
                    <li>Asignar operador</li>
                    <li>Realizar revisiones diarias/mensuales/bimestrales</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 4: REVISIÓN */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-primary-900 mb-6">Revisar Información</h2>
            
            {/* Resumen */}
            <div className="space-y-4">
              <div className="border border-primary-200 rounded-lg p-4">
                <h3 className="font-semibold text-primary-900 mb-3">Información Básica</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-primary-600">Placa:</span> <span className="font-medium">{formData.placa.toUpperCase()}</span></div>
                  <div><span className="text-primary-600">No. Económico:</span> <span className="font-medium">{formData.numero_economico.toUpperCase()}</span></div>
                  <div><span className="text-primary-600">Tipo:</span> <span className="font-medium">{tiposVehiculo.find(t => t.value === formData.tipo_vehiculo)?.label}</span></div>
                  <div><span className="text-primary-600">Marca:</span> <span className="font-medium">{formData.marca}</span></div>
                  <div><span className="text-primary-600">Modelo:</span> <span className="font-medium">{formData.modelo}</span></div>
                  <div><span className="text-primary-600">Año:</span> <span className="font-medium">{formData.year}</span></div>
                  {formData.vin && <div><span className="text-primary-600">VIN:</span> <span className="font-medium">{formData.vin}</span></div>}
                  {formData.color && <div><span className="text-primary-600">Color:</span> <span className="font-medium">{formData.color}</span></div>}
                </div>
              </div>

              <div className="border border-primary-200 rounded-lg p-4">
                <h3 className="font-semibold text-primary-900 mb-3">Asignación y Combustible</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-primary-600">Sede:</span> <span className="font-medium">{sedes.find(s => s._id === formData.sede_actual)?.nombre || 'N/A'}</span></div>
                  <div><span className="text-primary-600">Combustible:</span> <span className="font-medium capitalize">{formData.tipo_combustible}</span></div>
                  <div><span className="text-primary-600">Capacidad Tanque:</span> <span className="font-medium">{formData.capacidad_tanque} L</span></div>
                </div>
              </div>

              <div className="border border-primary-200 rounded-lg p-4">
                <h3 className="font-semibold text-primary-900 mb-3">Medidores</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-primary-600">Kilometraje:</span> <span className="font-medium">{formData.kilometraje_actual} km</span></div>
                  <div><span className="text-primary-600">Horas Motor:</span> <span className="font-medium">{formData.horas_motor_actual} hrs</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-primary-200">
          <button
            type="button"
            onClick={currentStep === 1 ? () => navigate('/vehiculos') : handleBack}
            className="btn-outline"
            disabled={loading}
          >
            {currentStep === 1 ? 'Cancelar' : 'Atrás'}
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner h-4 w-4 mr-2"></div>
                  Creando...
                </>
              ) : (
                'Crear Vehículo'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NuevoVehiculo;