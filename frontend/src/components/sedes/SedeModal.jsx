import { useState, useEffect } from 'react';

const SedeModal = ({ isOpen, onClose, onSave, sede = null }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    direccion: '',
    telefono: '',
    email: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (sede) {
      // Modo edición - llenar formulario
      setFormData({
        nombre: sede.nombre || '',
        ubicacion: sede.ubicacion || '',
        direccion: sede.direccion || '',
        telefono: sede.telefono || '',
        email: sede.email || ''
      });
    } else {
      // Modo creación - limpiar formulario
      setFormData({
        nombre: '',
        ubicacion: '',
        direccion: '',
        telefono: '',
        email: ''
      });
    }
    setErrors({});
  }, [sede, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = 'La ubicación es requerida';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-primary-900/50 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-primary-900">
              {sede ? 'Editar Sede' : 'Nueva Sede'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="label">
                Nombre de la Sede <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`input ${errors.nombre ? 'input-error' : ''}`}
                placeholder="Ej: Sede Centro"
              />
              {errors.nombre && (
                <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>
              )}
            </div>

            {/* Ubicación */}
            <div>
              <label className="label">
                Ubicación <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                className={`input ${errors.ubicacion ? 'input-error' : ''}`}
                placeholder="Ej: Ciudad de México, CDMX"
              />
              {errors.ubicacion && (
                <p className="mt-1 text-xs text-red-600">{errors.ubicacion}</p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="label">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="input"
                placeholder="Ej: Av. Reforma #123, Col. Centro"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="label">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="input"
                placeholder="Ej: 55 1234 5678"
              />
            </div>

            {/* Email */}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="Ej: contacto@sede.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                {sede ? 'Actualizar' : 'Crear'} Sede
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SedeModal;