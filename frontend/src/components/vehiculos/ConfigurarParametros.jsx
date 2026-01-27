import { useState, useEffect } from 'react';
import { vehiculoService } from '../../services/vehiculoService';
import { showToast } from '../../utils/toast';

const ConfigurarParametros = ({ vehiculo, onConfigured }) => {
  const [paso, setPaso] = useState(1); // 1: elegir opción, 2: desde cero, 3: copiar
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState('');
  const [loading, setLoading] = useState(false);

  // Parámetros predefinidos disponibles
  const [parametrosSeleccionados, setParametrosSeleccionados] = useState({
    balatas_delanteras: true,
    balatas_traseras: true,
    aceite_motor: true,
    liquido_frenos: true,
    refrigerante: true,
    suspension: false,
    bateria: false,
    amortiguadores_delanteros: false,
    amortiguadores_traseros: false,
  });

  useEffect(() => {
    if (paso === 3) {
      cargarVehiculos();
    }
  }, [paso]);

  const cargarVehiculos = async () => {
    try {
      const response = await vehiculoService.getAll();
      // Filtrar vehículos que tengan parámetros configurados
      const vehiculosConParametros = response.data.filter(v => 
        v._id !== vehiculo._id && v.parametros && Object.keys(v.parametros).length > 0
      );
      setVehiculos(vehiculosConParametros);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    }
  };

  const handleConfigurarDesdeCero = async () => {
    try {
      setLoading(true);

      // Crear objeto de parámetros basado en selección
      const parametros = {};

      if (parametrosSeleccionados.balatas_delanteras) {
        parametros.balatas_delanteras = {
          categoria: 'Frenos',
          nombre: 'Balatas Delanteras',
          tipo: 'medicion',
          unidad: 'mm',
          valor_actual: 0,
          valor_inicial: 14,
          umbrales: {
            optimo: { min: 10, max: 14, color: 'verde' },
            precaucion: { min: 4, max: 10, color: 'amarillo' },
            critico: { min: 0, max: 4, color: 'rojo' }
          },
          estado_actual: 'critico'
        };
      }

      if (parametrosSeleccionados.balatas_traseras) {
        parametros.balatas_traseras = {
          categoria: 'Frenos',
          nombre: 'Balatas Traseras',
          tipo: 'medicion',
          unidad: 'mm',
          valor_actual: 0,
          valor_inicial: 14,
          umbrales: {
            optimo: { min: 10, max: 14, color: 'verde' },
            precaucion: { min: 4, max: 10, color: 'amarillo' },
            critico: { min: 0, max: 4, color: 'rojo' }
          },
          estado_actual: 'critico'
        };
      }

      if (parametrosSeleccionados.aceite_motor) {
        parametros.aceite_motor = {
          categoria: 'Motor',
          nombre: 'Aceite de Motor',
          tipo: 'medicion',
          unidad: 'litros',
          valor_actual: 0,
          valor_inicial: 30,
          umbrales: {
            optimo: { min: 25, max: 30, color: 'verde' },
            precaucion: { min: 15, max: 25, color: 'amarillo' },
            critico: { min: 0, max: 15, color: 'rojo' }
          },
          estado_actual: 'critico'
        };
      }

      if (parametrosSeleccionados.liquido_frenos) {
        parametros.liquido_frenos = {
          categoria: 'Frenos',
          nombre: 'Líquido de Frenos',
          tipo: 'medicion',
          unidad: '%',
          valor_actual: 0,
          valor_inicial: 100,
          umbrales: {
            optimo: { min: 70, max: 100, color: 'verde' },
            precaucion: { min: 40, max: 70, color: 'amarillo' },
            critico: { min: 0, max: 40, color: 'rojo' }
          },
          estado_actual: 'critico'
        };
      }

      if (parametrosSeleccionados.refrigerante) {
        parametros.refrigerante = {
          categoria: 'Motor',
          nombre: 'Refrigerante',
          tipo: 'medicion',
          unidad: '%',
          valor_actual: 0,
          valor_inicial: 100,
          umbrales: {
            optimo: { min: 70, max: 100, color: 'verde' },
            precaucion: { min: 40, max: 70, color: 'amarillo' },
            critico: { min: 0, max: 40, color: 'rojo' }
          },
          estado_actual: 'critico'
        };
      }

      if (parametrosSeleccionados.suspension) {
        parametros.suspension = {
          categoria: 'Suspensión',
          nombre: 'Suspensión',
          tipo: 'medicion',
          unidad: 'estado',
          valor_actual: 0,
          valor_inicial: 10,
          umbrales: {
            optimo: { min: 7, max: 10, color: 'verde' },
            precaucion: { min: 4, max: 7, color: 'amarillo' },
            critico: { min: 0, max: 4, color: 'rojo' }
          },
          estado_actual: 'critico'
        };
      }

      if (parametrosSeleccionados.bateria) {
        parametros.bateria = {
          categoria: 'Eléctrico',
          nombre: 'Batería',
          tipo: 'medicion',
          unidad: 'voltios',
          valor_actual: 0,
          valor_inicial: 12,
          umbrales: {
            optimo: { min: 12, max: 14, color: 'verde' },
            precaucion: { min: 10, max: 12, color: 'amarillo' },
            critico: { min: 0, max: 10, color: 'rojo' }
          },
          estado_actual: 'critico'
        };
      }

      // Configurar parámetros
      await vehiculoService.configurarParametros(vehiculo._id, { parametros });

      // Crear categorías únicas basadas en los parámetros seleccionados
      const categoriasUnicas = [...new Set(Object.values(parametros).map(p => p.categoria))];
      const iconosPorCategoria = {
        'Motor': '🔧',
        'Frenos': '🛑',
        'Suspensión': '⚙️',
        'Eléctrico': '⚡',
        'Neumáticos': '🛞'
      };

      for (const categoria of categoriasUnicas) {
        try {
          await vehiculoService.agregarCategoria(vehiculo._id, {
            nombre: categoria,
            icono: iconosPorCategoria[categoria] || '📋'
          });
        } catch (error) {
          // Ignorar si la categoría ya existe
          console.log(`Categoría ${categoria} ya existe o error al crear`);
        }
      }
      
      showToast.success('Parámetros configurados exitosamente');
      onConfigured();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al configurar parámetros');
    } finally {
      setLoading(false);
    }
  };

  const handleCopiarDeVehiculo = async () => {
    if (!vehiculoSeleccionado) {
      showToast.error('Selecciona un vehículo');
      return;
    }

    try {
      setLoading(true);
      const response = await vehiculoService.configurarParametros(vehiculo._id, {
        copiar_de_vehiculo: vehiculoSeleccionado
      });
      
      // Mensaje dinámico basado en la respuesta
      showToast.success(response.message || 'Configuración copiada exitosamente');
      onConfigured();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al copiar configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-primary-200 p-8">
      
      {/* PASO 1: Elegir Opción */}
      {paso === 1 && (
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-primary-900 mb-2">
            Configurar Parámetros
          </h2>
          <p className="text-primary-600 mb-8">
            Este vehículo aún no tiene parámetros configurados. Elige cómo deseas configurarlos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setPaso(2)}
              className="p-6 border-2 border-primary-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-primary-900 mb-1">Configurar desde Cero</h3>
                  <p className="text-sm text-primary-600">
                    Selecciona qué parámetros monitorear y configura los umbrales
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setPaso(3)}
              className="p-6 border-2 border-primary-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-primary-900 mb-1">Copiar de Otro Vehículo</h3>
                  <p className="text-sm text-primary-600">
                    Copia parámetros, categorías y configuración de neumáticos de un vehículo existente
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* PASO 2: Configurar desde Cero */}
      {paso === 2 && (
        <div>
          <button
            onClick={() => setPaso(1)}
            className="text-sm text-primary-600 hover:text-primary-900 mb-6 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>

          <h2 className="text-xl font-bold text-primary-900 mb-4">
            Selecciona los Parámetros a Monitorear
          </h2>
          <p className="text-sm text-primary-600 mb-6">
            Marca los parámetros que deseas monitorear para este vehículo
          </p>

          <div className="space-y-3 mb-8">
            {Object.entries({
              balatas_delanteras: { label: 'Balatas Delanteras', icon: '🔧' },
              balatas_traseras: { label: 'Balatas Traseras', icon: '🔧' },
              aceite_motor: { label: 'Aceite de Motor', icon: '🛢️' },
              liquido_frenos: { label: 'Líquido de Frenos', icon: '💧' },
              refrigerante: { label: 'Refrigerante', icon: '❄️' },
              suspension: { label: 'Suspensión', icon: '⚙️' },
              bateria: { label: 'Batería', icon: '🔋' },
              amortiguadores_delanteros: { label: 'Amortiguadores Delanteros', icon: '📐' },
              amortiguadores_traseros: { label: 'Amortiguadores Traseros', icon: '📐' },
            }).map(([key, { label, icon }]) => (
              <label
                key={key}
                className="flex items-center gap-3 p-4 border border-primary-200 rounded-lg hover:bg-primary-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={parametrosSeleccionados[key]}
                  onChange={(e) => setParametrosSeleccionados(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }))}
                  className="w-5 h-5"
                />
                <span className="text-2xl">{icon}</span>
                <span className="font-medium text-primary-900">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleConfigurarDesdeCero}
              disabled={loading || Object.values(parametrosSeleccionados).every(v => !v)}
              className="btn-primary flex-1"
            >
              {loading ? 'Configurando...' : 'Configurar Parámetros'}
            </button>
            <button
              onClick={() => setPaso(1)}
              disabled={loading}
              className="btn-outline"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: Copiar de Otro Vehículo */}
      {paso === 3 && (
        <div>
          <button
            onClick={() => setPaso(1)}
            className="text-sm text-primary-600 hover:text-primary-900 mb-6 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>

          <h2 className="text-xl font-bold text-primary-900 mb-4">
            Copiar Configuración de Otro Vehículo
          </h2>
          <p className="text-sm text-primary-600 mb-6">
            Selecciona un vehículo para copiar su configuración de parámetros
          </p>

          {vehiculos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-primary-600">No hay vehículos con parámetros configurados</p>
              <button
                onClick={() => setPaso(2)}
                className="btn-secondary mt-4"
              >
                Configurar desde Cero
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-8 max-h-96 overflow-y-auto">
                {vehiculos.map((v) => (
                  <label
                    key={v._id}
                    className="flex items-start gap-3 p-4 border border-primary-200 rounded-lg hover:bg-primary-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="vehiculo"
                      value={v._id}
                      checked={vehiculoSeleccionado === v._id}
                      onChange={(e) => setVehiculoSeleccionado(e.target.value)}
                      className="w-5 h-5 mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-primary-900">
                        {v.placa} - {v.marca} {v.modelo}
                      </div>
                      <div className="text-sm text-primary-600">
                        {v.tipo_unidad?.replace('_', ' ')} • {Object.keys(v.parametros || {}).length} parámetros configurados
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopiarDeVehiculo}
                  disabled={loading || !vehiculoSeleccionado}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Copiando...' : 'Copiar Configuración'}
                </button>
                <button
                  onClick={() => setPaso(1)}
                  disabled={loading}
                  className="btn-outline"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigurarParametros;