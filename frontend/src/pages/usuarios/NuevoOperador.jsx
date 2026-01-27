import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { operadorService } from '../../services/operadorService';
import { sedeService } from '../../services/sedeService';
import { vehiculoService } from '../../services/vehiculoService';
import { showToast } from '../../utils/toast';

const NuevoOperador = () => {
  const navigate = useNavigate();
  const [sedes, setSedes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    sedeActual: '',
    vehiculoAsignado: '',
    activo: true
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [sedesRes, vehiculosRes] = await Promise.all([
        sedeService.getAll(),
        vehiculoService.getAll()
      ]);
      
      setSedes(sedesRes.data || []); 
      setVehiculos(vehiculosRes.vehiculos || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showToast.error('Error al cargar datos');
      setSedes([]);
      setVehiculos([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.username.trim()) {
      showToast.error('El username es requerido');
      return;
    }
    
    if (!formData.password || formData.password.length < 6) {
      showToast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (!formData.nombre.trim()) {
      showToast.error('El nombre es requerido');
      return;
    }
    
    if (!formData.sedeActual) {
      showToast.error('La sede es requerida');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        vehiculoAsignado: formData.vehiculoAsignado || null
      };
      
      await operadorService.create(dataToSend);
      showToast.success('Operador creado exitosamente');
      navigate('/usuarios');
    } catch (error) {
      console.error('Error al crear operador:', error);
      showToast.error(error.response?.data?.msg || 'Error al crear operador');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar vehículos sin operador asignado
  const vehiculosDisponibles = Array.isArray(vehiculos) ? vehiculos : [];

  // Obtener sede seleccionada
  const sedeSeleccionada = sedes.find(s => s._id === formData.sedeActual);
  
  // Obtener vehículo seleccionado
  const vehiculoSeleccionado = vehiculos.find(v => v._id === formData.vehiculoAsignado);

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/usuarios')}
          className="text-primary-600 hover:text-primary-900 mb-4 flex items-center gap-2 font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Usuarios
        </button>
        <h1 className="text-2xl font-bold text-primary-900 mb-2">Nuevo Operador</h1>
        <p className="text-sm text-primary-600">Crea un nuevo operador de vehículos</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        {/* Información básica */}
        <div className="bg-white rounded-xl border border-primary-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-900">Información Básica</h3>
              <p className="text-xs text-primary-500">Datos principales del operador</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="label">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="input"
                placeholder="Ej: Juan Pérez García"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ej: jperez"
                  required
                />
              </div>

              <div>
                <label className="label">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">
                Sede <span className="text-red-500">*</span>
              </label>
              <select
                name="sedeActual"
                value={formData.sedeActual}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Selecciona una sede</option>
                {sedes.map((sede) => (
                  <option key={sede._id} value={sede._id}>
                    {sede.nombre} - {sede.ubicacion}
                  </option>
                ))}
              </select>
              {sedeSeleccionada && (
                <div className="mt-2 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-primary-900">{sedeSeleccionada.nombre}</span>
                    <span className="text-primary-600">• {sedeSeleccionada.ubicacion}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Asignación de vehículo */}
        <div className="bg-white rounded-xl border border-primary-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-900">Asignación de Vehículo</h3>
              <p className="text-xs text-primary-500">Vehículo que operará (opcional)</p>
            </div>
          </div>
          
          <div>
            <label className="label">Vehículo</label>
            <select
              name="vehiculoAsignado"
              value={formData.vehiculoAsignado}
              onChange={handleChange}
              className="input"
            >
              <option value="">Sin asignar</option>
              {vehiculosDisponibles.map((vehiculo) => (
                <option key={vehiculo._id} value={vehiculo._id}>
                  {vehiculo.numero_economico} - {vehiculo.placa} ({vehiculo.tipo_vehiculo})
                </option>
              ))}
            </select>
            
            {vehiculoSeleccionado ? (
              <div className="mt-2 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-primary-900">{vehiculoSeleccionado.numero_economico}</span>
                      <span className="badge-primary">{vehiculoSeleccionado.tipo_vehiculo}</span>
                    </div>
                    <div className="text-xs text-primary-600 space-y-0.5">
                      <div>Placa: {vehiculoSeleccionado.placa}</div>
                      <div>Marca: {vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-primary-500">
                Este operador podrá ser asignado a un vehículo más adelante
              </p>
            )}
            
            {vehiculosDisponibles.length === 0 && vehiculos.length > 0 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-yellow-800">
                    No hay vehículos disponibles sin operador asignado
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Estado */}
        <div className="bg-white rounded-xl border border-primary-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-900">Estado</h3>
              <p className="text-xs text-primary-500">Configuración de activación</p>
            </div>
          </div>
          
          <label className="flex items-center gap-3 p-4 border border-primary-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 transition-all">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="w-4 h-4 text-primary-900 border-primary-300 rounded focus:ring-primary-500"
            />
            <div>
              <span className="text-sm font-semibold text-primary-900">Operador activo</span>
              <p className="text-xs text-primary-500 mt-0.5">El operador podrá acceder al sistema inmediatamente</p>
            </div>
          </label>
        </div>

        {/* Botones */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="btn-outline flex-1 sm:flex-initial"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 sm:flex-initial disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="spinner h-4 w-4 border-2"></div>
                Creando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Operador
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoOperador;