import { useState } from 'react';
import { vehiculoService } from '../../services/vehiculoService';
import { showToast } from '../../utils/toast';

const ModalAgregarParametro = ({ vehiculo, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    nombre: '',
    categoria: '',
    unidad: '',
    valor_inicial: '',
    umbrales: {
      optimo: { min: '', max: '' },
      precaucion: { min: '', max: '' },
      critico: { min: '', max: '' }
    }
  });

  const categoriasExistentes = vehiculo.categorias_parametros?.map(c => c.nombre) || [];

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

  const generarKey = (nombre) => {
    return nombre
      .toLowerCase()
      .replace(/[áàä]/g, 'a')
      .replace(/[éèë]/g, 'e')
      .replace(/[íìï]/g, 'i')
      .replace(/[óòö]/g, 'o')
      .replace(/[úùü]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const handleNombreChange = (e) => {
    const nombre = e.target.value;
    setFormData(prev => ({
      ...prev,
      nombre,
      key: generarKey(nombre)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.categoria || !formData.unidad) {
      showToast.error('Nombre, categoría y unidad son requeridos');
      return;
    }

    if (!formData.key) {
      showToast.error('Error generando identificador del parámetro');
      return;
    }

    try {
      setLoading(true);

      const nuevoParametro = {
        categoria: formData.categoria,
        nombre: formData.nombre,
        tipo: 'medicion',
        unidad: formData.unidad,
        valor_actual: 0,
        valor_inicial: Number(formData.valor_inicial) || 0,
        umbrales: {
          optimo: {
            min: Number(formData.umbrales.optimo.min) || 0,
            max: Number(formData.umbrales.optimo.max) || 100,
            color: 'verde'
          },
          precaucion: {
            min: Number(formData.umbrales.precaucion.min) || 0,
            max: Number(formData.umbrales.precaucion.max) || 50,
            color: 'amarillo'
          },
          critico: {
            min: Number(formData.umbrales.critico.min) || 0,
            max: Number(formData.umbrales.critico.max) || 25,
            color: 'rojo'
          }
        },
        estado_actual: 'critico'
      };

      await vehiculoService.agregarParametro(vehiculo._id, {
        key: formData.key,
        parametro: nuevoParametro
      });

      // Si la categoría no existe, crearla
      if (!categoriasExistentes.includes(formData.categoria)) {
        const iconosPorCategoria = {
          'Motor': '🔧',
          'Frenos': '🛑',
          'Suspensión': '⚙️',
          'Eléctrico': '⚡',
          'Neumáticos': '🛞',
          'Transmisión': '⚙️',
          'Seguridad': '🛡️'
        };

        try {
          await vehiculoService.agregarCategoria(vehiculo._id, {
            nombre: formData.categoria,
            icono: iconosPorCategoria[formData.categoria] || '📋'
          });
        } catch (error) {
          console.log('Error al crear categoría:', error);
        }
      }

      showToast.success('Parámetro agregado');
      onSuccess();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al agregar');
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
              ➕ Nuevo Parámetro
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
            <div>
              <label className="label">
                Nombre del Parámetro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={handleNombreChange}
                className="input"
                placeholder="Ej: Aceite de Motor, Presión de Llantas..."
              />
              {formData.key && (
                <p className="text-xs text-primary-500 mt-1">
                  ID: {formData.key}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <input
                  list="categorias"
                  type="text"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="input"
                  placeholder="Motor, Frenos, Neumáticos..."
                />
                <datalist id="categorias">
                  {categoriasExistentes.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                  <option value="Motor" />
                  <option value="Frenos" />
                  <option value="Neumáticos" />
                  <option value="Suspensión" />
                  <option value="Eléctrico" />
                  <option value="Transmisión" />
                  <option value="Seguridad" />
                </datalist>
                <p className="text-xs text-primary-500 mt-1">
                  Escribe o selecciona una categoría existente
                </p>
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
                  placeholder="litros, mm, %, psi..."
                />
              </div>
            </div>

            <div>
              <label className="label">Valor Inicial</label>
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
                      placeholder="0"
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
                      placeholder="100"
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
                      placeholder="0"
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
                      placeholder="50"
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
                      placeholder="0"
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
                      placeholder="25"
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
              {loading ? 'Agregando...' : 'Agregar Parámetro'}
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

export default ModalAgregarParametro;