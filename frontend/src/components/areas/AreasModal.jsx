import { useState, useEffect } from 'react';

const AreasModal = ({ isOpen, onClose, onSave, area = null, sedes = [] }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    sede: '',
    activo: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (area) {
      // Modo edición - llenar formulario
      setFormData({
        nombre: area.nombre || '',
        descripcion: area.descripcion || '',
        sede: area.sede?._id || area.sede || '',
        activo: area.activo !== undefined ? area.activo : true
      });
    } else {
      // Modo creación - limpiar formulario
      setFormData({
        nombre: '',
        descripcion: '',
        sede: '',
        activo: true
      });
    }
    setErrors({});
  }, [area, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    if (!formData.sede) {
      newErrors.sede = 'La sede es requerida';
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
              {area ? 'Editar Área' : 'Nueva Área'}
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
                Nombre del Área <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`input ${errors.nombre ? 'input-error' : ''}`}
                placeholder="Ej: Recursos Humanos"
              />
              {errors.nombre && (
                <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>
              )}
            </div>

            {/* Sede */}
            <div>
              <label className="label">
                Sede <span className="text-red-500">*</span>
              </label>
              <select
                name="sede"
                value={formData.sede}
                onChange={handleChange}
                className={`input ${errors.sede ? 'input-error' : ''}`}
              >
                <option value="">Selecciona una sede</option>
                {sedes.filter(s => s.activo).map((sede) => (
                  <option key={sede._id} value={sede._id}>
                    {sede.nombre} - {sede.ubicacion}
                  </option>
                ))}
              </select>
              {errors.sede && (
                <p className="mt-1 text-xs text-red-600">{errors.sede}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="label">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="input"
                rows="3"
                placeholder="Descripción del área (opcional)"
              />
            </div>

            {/* Estado Activo */}
            {area && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-900 border-primary-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="activo" className="text-sm font-medium text-primary-700">
                  Área activa
                </label>
              </div>
            )}

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
                {area ? 'Actualizar' : 'Crear'} Área
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AreasModal;