import { useState } from 'react';
import { vehiculoService } from '../../services/vehiculoService';
import { showToast } from '../../utils/toast';
import ConfigurarParametros from './ConfigurarParametros';
import GestionarParametros from './GestionarParametros';

const TabParametros = ({ vehiculo, onUpdate }) => {
  const [modoGestion, setModoGestion] = useState(false);
  const [categoriasAbiertas, setCategoriasAbiertas] = useState({ Neumáticos: true });
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    valor: '',
    actualizado_por: '',
    motivo: '',
    notas: ''
  });
  const [loading, setLoading] = useState(false);

  // Agrupar parámetros por categoría
  const parametrosPorCategoria = {};
  
  if (vehiculo.parametros) {
    Object.entries(vehiculo.parametros).forEach(([key, parametro]) => {
      const categoria = parametro.categoria || 'Sin Categoría';
      if (!parametrosPorCategoria[categoria]) {
        parametrosPorCategoria[categoria] = [];
      }
      parametrosPorCategoria[categoria].push({ key, ...parametro });
    });
  }

  // Iconos por categoría
  const iconosPorCategoria = {
    'Motor': '🔧',
    'Frenos': '🛑',
    'Suspensión': '⚙️',
    'Eléctrico': '⚡',
    'Neumáticos': '🛞',
    'Transmisión': '⚙️',
    'Seguridad': '🛡️',
    'Sin Categoría': '📋'
  };

  const toggleCategoria = (categoria) => {
    setCategoriasAbiertas(prev => ({
      ...prev,
      [categoria]: !prev[categoria]
    }));
  };

  const getEstadoColor = (estado) => {
    if (estado === 'optimo') return 'bg-green-100 text-green-800 border-green-300';
    if (estado === 'precaucion') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (estado === 'critico') return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getEstadoIcono = (estado) => {
    if (estado === 'optimo') return '🟢';
    if (estado === 'precaucion') return '🟡';
    if (estado === 'critico') return '🔴';
    return '⚪';
  };

  const handleActualizar = async (key) => {
    if (!formData.actualizado_por || !formData.valor) {
      showToast.error('Valor y nombre son requeridos');
      return;
    }

    try {
      setLoading(true);
      await vehiculoService.actualizarParametro(vehiculo._id, key, {
        valor_nuevo: Number(formData.valor),
        actualizado_por: formData.actualizado_por,
        motivo: formData.motivo,
        notas: formData.notas
      });

      showToast.success('Parámetro actualizado');
      setEditando(null);
      setFormData({ valor: '', actualizado_por: '', motivo: '', notas: '' });
      onUpdate();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  // Si no hay parámetros configurados
  if (!vehiculo.parametros || Object.keys(vehiculo.parametros).length === 0) {
    return <ConfigurarParametros vehiculo={vehiculo} onConfigured={onUpdate} />;
  }

  // Modo Gestión
  if (modoGestion) {
    return (
      <GestionarParametros 
        vehiculo={vehiculo} 
        onUpdate={onUpdate}
        onCerrar={() => setModoGestion(false)}
      />
    );
  }

  const categorias = Object.keys(parametrosPorCategoria).sort();

  return (
    <div className="space-y-4">
      {/* Header con botón de gestión */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-primary-900">Parámetros Monitoreados</h3>
          <p className="text-sm text-primary-600">
            {categorias.length} categoría(s) · {Object.keys(vehiculo.parametros).length} parámetro(s)
          </p>
        </div>
        <button
          onClick={() => setModoGestion(true)}
          className="btn-secondary btn-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Gestionar Configuración
        </button>
      </div>

      {/* Categorías con acordeón */}
      {categorias.map((categoria) => {
        const icono = iconosPorCategoria[categoria] || '📋';
        const estaAbierta = categoriasAbiertas[categoria];
        const parametros = parametrosPorCategoria[categoria];

        return (
          <div key={categoria} className="bg-white rounded-xl border border-primary-200 overflow-hidden">
            {/* Header de Categoría - Clickeable */}
            <button
              onClick={() => toggleCategoria(categoria)}
              className="w-full bg-primary-50 px-6 py-4 border-b border-primary-200 flex items-center justify-between hover:bg-primary-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icono}</span>
                <h3 className="font-semibold text-primary-900">{categoria}</h3>
                <span className="text-sm text-primary-600">({parametros.length})</span>
              </div>
              
              <svg 
                className={`w-5 h-5 text-primary-600 transition-transform ${estaAbierta ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Contenido de Categoría */}
            {estaAbierta && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parametros.map(({ key, nombre, unidad, valor_actual, valor_inicial, estado_actual, umbrales }) => (
                    <div
                      key={key}
                      className={`border-2 rounded-lg p-4 ${getEstadoColor(estado_actual)}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{getEstadoIcono(estado_actual)}</span>
                            <h4 className="font-semibold text-primary-900">{nombre || key}</h4>
                          </div>
                          <p className="text-sm text-primary-600">Unidad: {unidad}</p>
                        </div>
                        
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          estado_actual === 'optimo' ? 'bg-green-500 text-white' :
                          estado_actual === 'precaucion' ? 'bg-yellow-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {estado_actual?.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {/* Valor Actual */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-primary-700">Valor Actual:</span>
                          <span className="text-lg font-bold text-primary-900">
                            {valor_actual || 0} {unidad}
                          </span>
                        </div>

                        {/* Valor Inicial */}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-primary-600">Valor Inicial:</span>
                          <span className="text-primary-900">{valor_inicial || 0} {unidad}</span>
                        </div>

                        {/* Umbrales */}
                        {umbrales && (
                          <div className="pt-2 border-t border-current/20">
                            <p className="text-xs font-medium text-primary-700 mb-1">Umbrales:</p>
                            <div className="grid grid-cols-3 gap-1 text-xs">
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span>{umbrales.optimo?.min}-{umbrales.optimo?.max}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                <span>{umbrales.precaucion?.min}-{umbrales.precaucion?.max}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span>{umbrales.critico?.min}-{umbrales.critico?.max}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Botón de actualizar */}
                        {editando === key ? (
                          <div className="pt-3 border-t border-current/20 space-y-2">
                            <input
                              type="number"
                              value={formData.valor}
                              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                              className="input input-sm w-full"
                              placeholder="Nuevo valor"
                              step="0.1"
                            />
                            <input
                              type="text"
                              value={formData.actualizado_por}
                              onChange={(e) => setFormData({ ...formData, actualizado_por: e.target.value })}
                              className="input input-sm w-full"
                              placeholder="Tu nombre *"
                            />
                            <input
                              type="text"
                              value={formData.motivo}
                              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                              className="input input-sm w-full"
                              placeholder="Motivo (opcional)"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleActualizar(key)}
                                disabled={loading}
                                className="btn-primary btn-sm flex-1"
                              >
                                {loading ? 'Guardando...' : 'Guardar'}
                              </button>
                              <button
                                onClick={() => {
                                  setEditando(null);
                                  setFormData({ valor: '', actualizado_por: '', motivo: '', notas: '' });
                                }}
                                className="btn-outline btn-sm"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditando(key);
                              setFormData({ ...formData, valor: valor_actual || '' });
                            }}
                            className="btn-secondary btn-sm w-full mt-2"
                          >
                            Actualizar Valor
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Sección de Neumáticos si están configurados */}
      {vehiculo.configuracion_neumaticos?.configurado && (
        <div className="bg-white rounded-xl border border-primary-200 overflow-hidden">
          <button
            onClick={() => toggleCategoria('Neumáticos')}
            className="w-full bg-primary-50 px-6 py-4 border-b border-primary-200 flex items-center justify-between hover:bg-primary-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛞</span>
              <h3 className="font-semibold text-primary-900">Neumáticos</h3>
              <span className="text-sm text-primary-600">
                ({vehiculo.configuracion_neumaticos.ejes.reduce((total, eje) => total + eje.neumaticos.length, 0)})
              </span>
            </div>
            
            <svg 
              className={`w-5 h-5 text-primary-600 transition-transform ${categoriasAbiertas['Neumáticos'] ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {categoriasAbiertas['Neumáticos'] && (
            <div className="p-6">
              {/* Parámetros Generales */}
              <div className="bg-primary-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-primary-900 mb-3">Parámetros Generales</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-primary-600">Presión Recomendada:</span>
                    <span className="font-medium text-primary-900 ml-2">
                      {vehiculo.configuracion_neumaticos.parametros_generales?.presion_recomendada || 110}{' '}
                      {vehiculo.configuracion_neumaticos.parametros_generales?.unidad_presion || 'psi'}
                    </span>
                  </div>
                  <div>
                    <span className="text-primary-600">Profundidad Mínima:</span>
                    <span className="font-medium text-primary-900 ml-2">
                      {vehiculo.configuracion_neumaticos.parametros_generales?.profundidad_minima || 3}{' '}
                      {vehiculo.configuracion_neumaticos.parametros_generales?.unidad_profundidad || 'mm'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Diagrama Visual */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-primary-900 mb-4 text-center">Diagrama de Posiciones</h4>
                <div className="flex flex-col items-center gap-4">
                  {vehiculo.configuracion_neumaticos.ejes.map((eje, index) => (
                    <div key={index} className="flex items-center gap-8">
                      {/* Lado Izquierdo */}
                      <div className="flex gap-1">
                        {eje.neumaticos
                          .filter(n => n.lado === 'izquierdo')
                          .map((neumatico) => (
                            <div
                              key={neumatico.posicion_global}
                              className="w-12 h-12 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-gray-600 transition-colors"
                              title={`Neumático ${neumatico.posicion_global}`}
                            >
                              {neumatico.posicion_global}
                            </div>
                          ))}
                      </div>

                      {/* Centro - Vehículo */}
                      <div className="flex flex-col items-center min-w-[120px]">
                        {index === 0 && (
                          <div className="text-4xl mb-2">🚛</div>
                        )}
                        {index !== 0 && (
                          <div className="w-20 h-4 bg-primary-300 rounded"></div>
                        )}
                        <span className="text-xs text-primary-600 mt-1">{eje.nombre}</span>
                      </div>

                      {/* Lado Derecho */}
                      <div className="flex gap-1">
                        {eje.neumaticos
                          .filter(n => n.lado === 'derecho')
                          .map((neumatico) => (
                            <div
                              key={neumatico.posicion_global}
                              className="w-12 h-12 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-gray-600 transition-colors"
                              title={`Neumático ${neumatico.posicion_global}`}
                            >
                              {neumatico.posicion_global}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <p className="text-sm text-primary-600">
                    Click en un neumático para ver/editar detalles (próximamente)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TabParametros;