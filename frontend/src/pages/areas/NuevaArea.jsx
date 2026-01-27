import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { areaService } from '../../services/areaService';
import { sedeService } from '../../services/sedeService';
import toast from 'react-hot-toast';

const NuevaArea = () => {
  const navigate = useNavigate();
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    sede: '',
    activo: true
  });

  useEffect(() => {
    cargarSedes();
  }, []);

  const cargarSedes = async () => {
    try {
      const response = await sedeService.getAll();
      setSedes(response.data);
    } catch (error) {
      console.error('Error al cargar sedes:', error);
      toast.error('Error al cargar sedes');
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

    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!formData.sede) {
      toast.error('La sede es requerida');
      return;
    }

    setLoading(true);
    try {
      await areaService.create(formData);
      toast.success('Área creada exitosamente');
      navigate('/areas');
    } catch (error) {
      console.error('Error al crear área:', error);
      toast.error(error.response?.data?.msg || 'Error al crear área');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/areas')}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Nueva Área</h1>
        <p className="text-gray-600 mt-1">Crea una nueva área para una sede</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Mantenimiento"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción opcional del área"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sede <span className="text-red-500">*</span>
            </label>
            <select
              name="sede"
              value={formData.sede}
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

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Área activa</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t mt-6">
          <button
            type="button"
            onClick={() => navigate('/areas')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Área'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevaArea;