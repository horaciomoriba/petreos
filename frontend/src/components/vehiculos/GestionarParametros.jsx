import { useState } from 'react';
import { vehiculoService } from '../../services/vehiculoService';
import { showToast } from '../../utils/toast';
import ModalEditarParametro from './ModalEditarParametro';
import ModalAgregarParametro from './ModalAgregarParametro';
import ConfiguradorNeumaticos from './ConfiguradorNeumaticos';
import ConfirmModal from '../common/ConfirmModal';

const GestionarParametros = ({ vehiculo, onUpdate, onCerrar }) => {
  const [modalEditar, setModalEditar] = useState(null);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [mostrarConfigNeumaticos, setMostrarConfigNeumaticos] = useState(false);

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

  // SIEMPRE incluir categoría Neumáticos (aunque no tenga parámetros)
  if (!parametrosPorCategoria['Neumáticos']) {
    parametrosPorCategoria['Neumáticos'] = [];
  }

  const handleEliminarParametro = async () => {
    if (!modalEliminar) return;

    try {
      await vehiculoService.eliminarParametro(vehiculo._id, modalEliminar.key);
      showToast.success('Parámetro eliminado');
      setModalEliminar(null);
      onUpdate();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const categorias = Object.keys(parametrosPorCategoria).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary-900">Gestionar Configuración</h2>
          <p className="text-sm text-primary-600">
            Edita, agrega o elimina parámetros de monitoreo
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalAgregar(true)}
            className="btn-primary btn-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Parámetro
          </button>
          <button
            onClick={onCerrar}
            className="btn-outline btn-sm"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Lista de Categorías y Parámetros */}
      <div className="space-y-4">
        {categorias.length === 0 ? (
          <div className="bg-white rounded-xl border border-primary-200 p-12 text-center">
            <p className="text-primary-600 mb-4">No hay parámetros configurados</p>
            <button
              onClick={() => setModalAgregar(true)}
              className="btn-primary"
            >
              Agregar Primer Parámetro
            </button>
          </div>
        ) : (
          categorias.map((categoria) => {
            // Buscar info de la categoría
            const infoCategoria = vehiculo.categorias_parametros?.find(c => c.nombre === categoria);
            const icono = infoCategoria?.icono || '📋';

            return (
              <div key={categoria} className="bg-white rounded-xl border border-primary-200 overflow-hidden">
                {/* Header de Categoría */}
                <div className="bg-primary-50 px-6 py-3 border-b border-primary-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{icono}</span>
                      <h3 className="font-semibold text-primary-900">{categoria}</h3>
                      {categoria !== 'Neumáticos' && (
                        <span className="text-sm text-primary-600">
                          ({parametrosPorCategoria[categoria].length})
                        </span>
                      )}
                      {categoria === 'Neumáticos' && vehiculo.configuracion_neumaticos?.configurado && (
                        <span className="text-sm text-primary-600">
                          ({vehiculo.configuracion_neumaticos.ejes.reduce((total, eje) => 
                            total + eje.neumaticos.length, 0)} neumáticos)
                        </span>
                      )}
                    </div>

                    {/* Botones especiales para Neumáticos */}
                    {categoria === 'Neumáticos' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMostrarConfigNeumaticos(true)}
                          className={`btn-sm flex items-center gap-2 ${
                            vehiculo.configuracion_neumaticos?.configurado 
                              ? 'btn-secondary' 
                              : 'btn-primary'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {vehiculo.configuracion_neumaticos?.configurado 
                            ? 'Editar Configuración' 
                            : 'Configurar Neumáticos'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenido de Neumáticos */}
                {categoria === 'Neumáticos' ? (
                  vehiculo.configuracion_neumaticos?.configurado ? (
                    // Mostrar diagrama y lista de neumáticos
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
                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
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
                                      className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-gray-600 transition-colors"
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
                                      className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-gray-600 transition-colors"
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
                            Click en un neumático para ver detalles (próximamente)
                          </p>
                        </div>
                      </div>

                      {/* Lista resumida de ejes */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-primary-900 mb-3">Configuración de Ejes</h4>
                        {vehiculo.configuracion_neumaticos.ejes.map((eje, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                            <div>
                              <span className="font-medium text-primary-900">Eje {eje.numero}: {eje.nombre}</span>
                              <span className="text-sm text-primary-600 ml-3">
                                {eje.neumaticos_por_lado === 1 ? 'Simple' : 'Dual'} ({eje.neumaticos.length} neumáticos)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // No configurado - Mostrar call to action
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-primary-900 mb-2">
                        Neumáticos no configurados
                      </h4>
                      <p className="text-sm text-primary-600 mb-4">
                        Configura la estructura de ejes y neumáticos para este vehículo
                      </p>
                      <button
                        onClick={() => setMostrarConfigNeumaticos(true)}
                        className="btn-primary"
                      >
                        Configurar Neumáticos
                      </button>
                    </div>
                  )
                ) : (
                  // Lista de Parámetros normales (no neumáticos)
                  <div className="divide-y divide-primary-100">
                    {parametrosPorCategoria[categoria].map((parametro) => {
                    const iconoParametro = parametro.nombre?.includes('Balata') ? '🔧' :
                                          parametro.nombre?.includes('Aceite') ? '🛢️' :
                                          parametro.nombre?.includes('Batería') ? '🔋' :
                                          parametro.nombre?.includes('Refrigerante') ? '❄️' :
                                          parametro.nombre?.includes('Freno') ? '💧' : '⚙️';

                    return (
                      <div
                        key={parametro.key}
                        className="px-6 py-4 hover:bg-primary-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-xl">{iconoParametro}</span>
                            <div>
                              <p className="font-medium text-primary-900">
                                {parametro.nombre || parametro.key}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-primary-600 mt-1">
                                <span>Unidad: {parametro.unidad}</span>
                                <span>Inicial: {parametro.valor_inicial}</span>
                                {parametro.umbrales && (
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {parametro.umbrales.optimo?.min}-{parametro.umbrales.optimo?.max}
                                    <span className="w-2 h-2 rounded-full bg-yellow-500 ml-1"></span>
                                    {parametro.umbrales.precaucion?.min}-{parametro.umbrales.precaucion?.max}
                                    <span className="w-2 h-2 rounded-full bg-red-500 ml-1"></span>
                                    {parametro.umbrales.critico?.min}-{parametro.umbrales.critico?.max}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setModalEditar({ key: parametro.key, parametro })}
                              className="btn-secondary btn-sm"
                              title="Editar parámetro"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setModalEliminar({ key: parametro.key, nombre: parametro.nombre })}
                              className="btn-outline btn-sm text-red-600 border-red-200 hover:bg-red-50"
                              title="Eliminar parámetro"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modales */}
      {modalEditar && (
        <ModalEditarParametro
          vehiculo={vehiculo}
          parametroKey={modalEditar.key}
          parametro={modalEditar.parametro}
          onClose={() => setModalEditar(null)}
          onSuccess={() => {
            setModalEditar(null);
            onUpdate();
          }}
        />
      )}

      {modalAgregar && (
        <ModalAgregarParametro
          vehiculo={vehiculo}
          onClose={() => setModalAgregar(false)}
          onSuccess={() => {
            setModalAgregar(false);
            onUpdate();
          }}
        />
      )}

      {mostrarConfigNeumaticos && (
        <ConfiguradorNeumaticos
          vehiculo={vehiculo}
          onClose={() => setMostrarConfigNeumaticos(false)}
          onSuccess={() => {
            setMostrarConfigNeumaticos(false);
            onUpdate();
          }}
        />
      )}

      <ConfirmModal
        isOpen={!!modalEliminar}
        onClose={() => setModalEliminar(null)}
        onConfirm={handleEliminarParametro}
        title="¿Eliminar parámetro?"
        message={`¿Estás seguro de eliminar "${modalEliminar?.nombre}"? Se perderá todo su historial.`}
        type="danger"
      />
    </div>
  );
};

export default GestionarParametros;