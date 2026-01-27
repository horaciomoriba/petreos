import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { sedeService } from '../../services/sedeService';
import { showToast } from '../../utils/toast';

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
      showToast.error('Error al cargar sedes');
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

    setLoading(true);
    try {
      await adminService.create(formData);
      showToast.success('Administrador creado exitosamente');
      navigate('/usuarios');
    } catch (error) {
      console.error('Error al crear admin:', error);
      showToast.error(error.response?.data?.msg || 'Error al crear administrador');
    } finally {
      setLoading(false);
    }
  };

  const getRolLabel = (rol) => {
    const labels = {
      supervisor: 'Supervisor',
      jefe_mantenimiento: 'Jefe de Mantenimiento',
      mecanico: 'Mecánico',
      super_admin: 'Super Admin'
    };
    return labels[rol] || rol;
  };

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
        <h1 className="text-2xl font-bold text-primary-900 mb-2">Nuevo Administrador</h1>
        <p className="text-sm text-primary-600">Crea un nuevo usuario administrador del sistema</p>
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
              <p className="text-xs text-primary-500">Datos principales del administrador</p>
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
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="supervisor">Supervisor</option>
                <option value="jefe_mantenimiento">Jefe de Mantenimiento</option>
                <option value="mecanico">Mecánico</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <p className="mt-1 text-xs text-primary-500">
                Rol actual: <span className="font-medium text-primary-700">{getRolLabel(formData.rol)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Sedes asignadas */}
        <div className="bg-white rounded-xl border border-primary-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-900">Sedes Asignadas</h3>
              <p className="text-xs text-primary-500">Selecciona las sedes a las que tendrá acceso</p>
            </div>
          </div>
          
          {sedes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {sedes.map((sede) => (
                  <label
                    key={sede._id}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.sedes.includes(sede._id)
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-primary-200 hover:border-primary-300 hover:bg-primary-50/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.sedes.includes(sede._id)}
                      onChange={() => handleSedesChange(sede._id)}
                      className="w-4 h-4 text-primary-900 border-primary-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-primary-900 truncate">{sede.nombre}</div>
                      {sede.ubicacion && (
                        <div className="text-xs text-primary-500 truncate">{sede.ubicacion}</div>
                      )}
                    </div>
                    {formData.sedes.includes(sede._id) && (
                      <svg className="w-5 h-5 text-primary-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
              <p className="text-xs text-primary-500">
                {formData.sedes.length === 0 ? (
                  'No se han seleccionado sedes'
                ) : (
                  `${formData.sedes.length} sede${formData.sedes.length > 1 ? 's' : ''} seleccionada${formData.sedes.length > 1 ? 's' : ''}`
                )}
              </p>
            </>
          ) : (
            <div className="text-center py-8 text-primary-500">
              <svg className="w-12 h-12 mx-auto mb-2 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm">No hay sedes disponibles</p>
            </div>
          )}
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
              <span className="text-sm font-semibold text-primary-900">Usuario activo</span>
              <p className="text-xs text-primary-500 mt-0.5">El usuario podrá acceder al sistema inmediatamente</p>
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
                Crear Administrador
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoAdmin;