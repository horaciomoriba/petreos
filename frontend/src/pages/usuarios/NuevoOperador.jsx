import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { operadorService } from '../../services/operadorService';
import { sedeService } from '../../services/sedeService';
import { vehiculoService } from '../../services/vehiculoService';
import toast from 'react-hot-toast';

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
        setVehiculos(vehiculosRes.vehiculos || []); // ← CAMBIAR .data por .vehiculos
    } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar datos');
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
      toast.error('El username es requerido');
      return;
    }
    
    if (!formData.password || formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    
    if (!formData.sedeActual) {
      toast.error('La sede es requerida');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        vehiculoAsignado: formData.vehiculoAsignado || null
      };
      
      await operadorService.create(dataToSend);
      toast.success('Operador creado exitosamente');
      navigate('/usuarios');
    } catch (error) {
      console.error('Error al crear operador:', error);
      toast.error(error.response?.data?.msg || 'Error al crear operador');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar vehículos sin operador asignado - CON VALIDACIÓN
  const vehiculosDisponibles = Array.isArray(vehiculos) 
    ? vehiculos
    : [];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/usuarios')}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Nuevo Operador</h1>
        <p className="text-gray-600 mt-1">Crea un nuevo operador de vehículos</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Información básica */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Información Básica</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Juan Pérez García"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: jperez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sede <span className="text-red-500">*</span>
            </label>
            <select
              name="sedeActual"
              value={formData.sedeActual}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecciona una sede</option>
              {sedes.map((sede) => (
                <option key={sede._id} value={sede._id}>
                  {sede.nombre} - {sede.ciudad}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Asignación de vehículo */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Asignación de Vehículo</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehículo (opcional)
            </label>
            <select
              name="vehiculoAsignado"
              value={formData.vehiculoAsignado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sin asignar</option>
              {vehiculosDisponibles.map((vehiculo) => (
                <option key={vehiculo._id} value={vehiculo._id}>
                  {vehiculo.numeroEconomico} - {vehiculo.placa} ({vehiculo.tipo})
                </option>
              ))}
            </select>
            {vehiculosDisponibles.length === 0 && vehiculos.length > 0 && (
              <p className="text-sm text-amber-600 mt-1">
                ⚠️ No hay vehículos disponibles sin operador asignado
              </p>
            )}
          </div>
        </div>

        {/* Estado */}
        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Operador activo</span>
          </label>
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Operador'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoOperador;