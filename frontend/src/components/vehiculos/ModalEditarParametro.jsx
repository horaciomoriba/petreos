import { useState, useEffect } from 'react';
import { vehiculoService } from '../../services/vehiculoService';
import { showToast } from '../../utils/toast';

const ModalEditarParametro = ({ vehiculo, parametroKey, parametro, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    unidad: '',
    valor_inicial: '',
    umbrales: {
      optimo: { min: '', max: '' },
      precaucion: { min: '', max: '' },
      critico: { min: '', max: '' }
    }
  });

  useEffect(() => {
    if (parametro) {
      setFormData({
        nombre: parametro.nombre || '',
        unidad: parametro.unidad || '',
        valor_inicial: parametro.valor_inicial || '',
        umbrales: {
          optimo: {
            min: parametro.umbrales?.optimo?.min || '',
            max: parametro.umbrales?.optimo?.max || ''
          },
          precaucion: {
            min: parametro.umbrales?.precaucion?.min || '',
            max: parametro.umbrales?.precaucion?.max || ''
          },
          critico: {
            min: parametro.umbrales?.critico?.min || '',
            max: parametro.umbrales?.critico?.max || ''
          }
        }
      });
    }
  }, [parametro]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUmbralChange = (tipo, campo, value) => {
    setFormData(prev => ({
      ...prev,
      umbrales: {
        ...prev.umbrales,
        [tipo]: {
          ...prev.umbrales[tipo],
          [campo]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.unidad) {
      showToast.error('Nombre y unidad son requeridos');
      return;
    }

    try {
      setLoading(true);

      const parametroActualizado = {
        ...parametro, // Mantener campos existentes
        nombre: formData.nombre,
        unidad: formData.unidad,
        valor_inicial: Number(formData.valor_inicial),
        umbrales: {
          optimo: {
            min: Number(formData.umbrales.optimo.min),
            max: Number(formData.umbrales.optimo.max),
            color: 'verde'
          },
          precaucion: {
            min: Number(formData.umbrales.precaucion.min),
            max: Number(formData.umbrales.precaucion.max),
            color: 'amarillo'
          },
          critico: {
            min: Number(formData.umbrales.critico.min),
            max: Number(formData.umbrales.critico.max),
            color: 'rojo'
          }
        }
      };

      await vehiculoService.editarParametro(vehiculo._id, parametroKey, {
        parametro: parametroActualizado
      });

      showToast.success('Parámetro actualizado');
      onSuccess();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary-900">
              ✏️ Editar Parámetro
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-primary-600 hover:text-primary-900"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Información Básica */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Nombre del Parámetro <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ej: Aceite de Motor"
                />
              </div>

              <div>
                <label className="label">
                  Unidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="unidad"
                  value={formData.unidad}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ej: litros, mm, %"
                />
              </div>
            </div>

            <div>
              <label className="label">
                Valor Inicial <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="valor_inicial"
                value={formData.valor_inicial}
                onChange={handleChange}
                className="input"
                step="0.1"
                placeholder="Ej: 30"
              />
              <p className="text-xs text-primary-500 mt-1">
                Valor máximo esperado cuando está nuevo
              </p>
            </div>
          </div>

          {/* Umbrales */}
          <div className="mb-6">
            <h3 className="font-semibold text-primary-900 mb-4">📊 Umbrales de Alerta</h3>
            
            <div className="space-y-4">
              {/* Óptimo */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-4 h-4 rounded-full bg-green-500"></span>
                  <label className="font-medium text-green-900">🟢 Óptimo</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-green-700">Mínimo</label>
                    <input
                      type="number"
                      value={formData.umbrales.optimo.min}
                      onChange={(e) => handleUmbralChange('optimo', 'min', e.target.value)}
                      className="input input-sm"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-green-700">Máximo</label>
                    <input
                      type="number"
                      value={formData.umbrales.optimo.max}
                      onChange={(e) => handleUmbralChange('optimo', 'max', e.target.value)}
                      className="input input-sm"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Precaución */}
              <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
                  <label className="font-medium text-yellow-900">🟡 Precaución</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-yellow-700">Mínimo</label>
                    <input
                      type="number"
                      value={formData.umbrales.precaucion.min}
                      onChange={(e) => handleUmbralChange('precaucion', 'min', e.target.value)}
                      className="input input-sm"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-yellow-700">Máximo</label>
                    <input
                      type="number"
                      value={formData.umbrales.precaucion.max}
                      onChange={(e) => handleUmbralChange('precaucion', 'max', e.target.value)}
                      className="input input-sm"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Crítico */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-4 h-4 rounded-full bg-red-500"></span>
                  <label className="font-medium text-red-900">🔴 Crítico</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-red-700">Mínimo</label>
                    <input
                      type="number"
                      value={formData.umbrales.critico.min}
                      onChange={(e) => handleUmbralChange('critico', 'min', e.target.value)}
                      className="input input-sm"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-red-700">Máximo</label>
                    <input
                      type="number"
                      value={formData.umbrales.critico.max}
                      onChange={(e) => handleUmbralChange('critico', 'max', e.target.value)}
                      className="input input-sm"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-primary-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-outline flex-1"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarParametro;