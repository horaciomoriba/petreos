import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { sedeService } from '../../services/sedeService';
import toast from 'react-hot-toast';

const NuevoAdmin = () => {
  const navigate = useNavigate();
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    rol: 'supervisor',
    sedes: [],
    areas: [],
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

  const handleSedesChange = (sedeId) => {
    setFormData(prev => ({
      ...prev,
      sedes: prev.sedes.includes(sedeId)
        ? prev.sedes.filter(id => id !== sedeId)
        : [...prev.sedes, sedeId]
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

    setLoading(true);
    try {
      await adminService.create(formData);
      toast.success('Administrador creado exitosamente');
      navigate('/usuarios');
    } catch (error) {
      console.error('Error al crear admin:', error);
      toast.error(error.response?.data?.msg || 'Error al crear administrador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/usuarios')}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Nuevo Administrador</h1>
        <p className="text-gray-600 mt-1">Crea un nuevo usuario administrador del sistema</p>
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
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="supervisor">Supervisor</option>
              <option value="jefe_mantenimiento">Jefe de Mantenimiento</option>
              <option value="mecanico">Mecánico</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>

        {/* Sedes asignadas */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Sedes Asignadas</h3>
          
          {sedes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sedes.map((sede) => (
                <label
                  key={sede._id}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.sedes.includes(sede._id)}
                    onChange={() => handleSedesChange(sede._id)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{sede.nombre}</div>
                    <div className="text-xs text-gray-500">{sede.ciudad}</div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay sedes disponibles</p>
          )}
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
            <span className="text-sm font-medium text-gray-700">Usuario activo</span>
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
            {loading ? 'Creando...' : 'Crear Administrador'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoAdmin;