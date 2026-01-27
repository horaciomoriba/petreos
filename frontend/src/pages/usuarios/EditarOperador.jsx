import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { operadorService } from '../../services/operadorService';
import { sedeService } from '../../services/sedeService';
import { vehiculoService } from '../../services/vehiculoService';
import toast from 'react-hot-toast';

const EditarOperador = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sedes, setSedes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    nombre: '',
    sedeActual: '',
    vehiculoAsignado: '',
    activo: true
  });
  const [vehiculoOriginal, setVehiculoOriginal] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
        const [operadorRes, sedesRes, vehiculosRes] = await Promise.all([
        operadorService.getById(id),
        sedeService.getAll(),
        vehiculoService.getAll()
        ]);
        
        const operador = operadorRes.data;
        const vehiculoAsignadoId = operador.vehiculoAsignado?._id || '';
        
        setFormData({
        username: operador.username,
        nombre: operador.nombre,
        sedeActual: operador.sedeActual?._id || '',
        vehiculoAsignado: vehiculoAsignadoId,
        activo: operador.activo
        });
        
        setVehiculoOriginal(vehiculoAsignadoId);
        setSedes(sedesRes.data);
        setVehiculos(vehiculosRes.vehiculos || []); // ← CAMBIAR .data por .vehiculos
    } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar datos del operador');
        navigate('/usuarios');
    } finally {
        setLoading(false);
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
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    
    if (!formData.sedeActual) {
      toast.error('La sede es requerida');
      return;
    }

    setSaving(true);
    try {
      // Actualizar datos básicos
      await operadorService.update(id, {
        username: formData.username,
        nombre: formData.nombre,
        sedeActual: formData.sedeActual,
        activo: formData.activo
      });
      
      // Si cambió el vehículo asignado, hacer petición separada
      if (formData.vehiculoAsignado !== vehiculoOriginal) {
        await operadorService.asignarVehiculo(id, formData.vehiculoAsignado || null);
      }
      
      toast.success('Operador actualizado exitosamente');
      navigate('/usuarios');
    } catch (error) {
      console.error('Error al actualizar operador:', error);
      toast.error(error.response?.data?.msg || 'Error al actualizar operador');
    } finally {
      setSaving(false);
    }
  };

  // Filtrar vehículos: disponibles + el que ya tiene asignado
  const vehiculosDisponibles = vehiculos.filter(
    v => !v.operadorActual || v._id === vehiculoOriginal
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/usuarios')}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Editar Operador</h1>
        <p className="text-gray-600 mt-1">Modifica la información del operador</p>
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
              Vehículo
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
                  {vehiculo._id === vehiculoOriginal ? ' (Actual)' : ''}
                </option>
              ))}
            </select>
            {vehiculoOriginal && formData.vehiculoAsignado !== vehiculoOriginal && (
              <p className="text-sm text-amber-600 mt-1">
                ⚠️ Cambiarás la asignación de vehículo
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

        {/* Cambiar contraseña */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            💡 Para cambiar la contraseña, usa el botón "Cambiar Contraseña" en la vista de detalle
          </p>
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
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarOperador;