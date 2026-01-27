// src/components/vehiculos/TabNeumaticos.jsx
// Rediseñado siguiendo guía de diseño minimalista-industrial

import { useState } from 'react';
import vehiculoService from '../../services/vehiculoService';
import { showToast } from '../../utils/toast';
import ConfiguradorNeumaticos from './ConfiguradorNeumaticos';

const TabNeumaticos = ({ vehiculo, onUpdate }) => {
  const [mostrarConfigurador, setMostrarConfigurador] = useState(false);

  const configurado = vehiculo.configuracion_neumaticos?.configurado;

  // Diagrama visual de neumáticos - Minimalista
  const DiagramaNeumaticos = () => {
    if (!configurado) return null;

    const { ejes } = vehiculo.configuracion_neumaticos;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {/* Header compacto */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-base font-semibold text-gray-900">
              {vehiculo.configuracion_neumaticos.total_ejes} eje{vehiculo.configuracion_neumaticos.total_ejes !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {ejes.reduce((sum, eje) => sum + eje.neumaticos.length, 0)} neumáticos totales
            </p>
          </div>
          <button
            onClick={() => setMostrarConfigurador(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 
              bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
          >
            Reconfigurar
          </button>
        </div>

        {/* Diagrama Visual - Sin emoji */}
        <div className="space-y-6">
          {ejes.map((eje, index) => (
            <div key={eje.numero} className="border border-gray-200 rounded-xl p-5">
              {/* Nombre del eje - Compacto */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900">
                  Eje {eje.numero}: {eje.nombre}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {eje.neumaticos_por_lado === 1 ? 'Simple' : 
                   eje.neumaticos_por_lado === 2 ? 'Dual' : 'Triple'}
                  {' · '}
                  {eje.neumaticos.length} neumático{eje.neumaticos.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Visualización del eje - Minimalista */}
              <div className="flex items-center justify-center gap-8 py-4">
                {/* Neumáticos izquierdos */}
                <div className="flex gap-1">
                  {eje.neumaticos
                    .filter(n => n.lado === 'izquierdo')
                    .sort((a, b) => a.numero_en_lado - b.numero_en_lado)
                    .map(neumatico => (
                      <div
                        key={neumatico.posicion_global}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold border-2 border-gray-700 shadow-sm">
                          {neumatico.posicion_global}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">I{neumatico.numero_en_lado}</span>
                      </div>
                    ))
                  }
                </div>

                {/* Centro - Barra o marcador de eje delantero */}
                {index === 0 ? (
                  // Eje delantero - Rectángulo con texto
                  <div className="flex items-center justify-center">
                    <div className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded text-xs font-medium text-gray-700">
                      Delantero
                    </div>
                  </div>
                ) : (
                  // Ejes traseros - Barra horizontal
                  <div className="w-20 h-1.5 bg-gray-900 rounded"></div>
                )}

                {/* Neumáticos derechos */}
                <div className="flex gap-1">
                  {eje.neumaticos
                    .filter(n => n.lado === 'derecho')
                    .sort((a, b) => a.numero_en_lado - b.numero_en_lado)
                    .map(neumatico => (
                      <div
                        key={neumatico.posicion_global}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold border-2 border-gray-700 shadow-sm">
                          {neumatico.posicion_global}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">D{neumatico.numero_en_lado}</span>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Lista compacta de neumáticos - Solo en desktop */}
              <div className="mt-4 hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {eje.neumaticos.map(neumatico => (
                  <div
                    key={neumatico.posicion_global}
                    className="bg-gray-50 rounded-lg px-3 py-2 text-xs border border-gray-100"
                  >
                    <span className="font-semibold text-gray-900">
                      #{neumatico.posicion_global}
                    </span>
                    <span className="text-gray-500 ml-1">
                      {neumatico.lado === 'izquierdo' ? 'Izq' : 'Der'} {neumatico.numero_en_lado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Leyenda - Minimalista */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-xs font-medium text-gray-700 mb-2">Leyenda</p>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-900 border-2 border-gray-700 flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">#</span>
              </div>
              <span>Posición global del neumático</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">I/D</span>
              <span>Lado izquierdo/derecho</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {!configurado ? (
        /* Empty State - Sin configurar */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-gray-50 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Sin configuración de neumáticos
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Configura la estructura de ejes para este vehículo
          </p>
          <button
            onClick={() => setMostrarConfigurador(true)}
            className="px-5 py-2.5 text-sm font-semibold text-white 
              bg-gradient-to-r from-gray-900 to-gray-700 
              hover:from-gray-800 hover:to-gray-600 
              rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            Configurar Neumáticos
          </button>
        </div>
      ) : (
        /* Ya configurado - mostrar diagrama */
        <DiagramaNeumaticos />
      )}

      {/* Modal Configurador */}
      {mostrarConfigurador && (
        <ConfiguradorNeumaticos
          vehiculo={vehiculo}
          onClose={() => setMostrarConfigurador(false)}
          onSuccess={() => {
            setMostrarConfigurador(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

export default TabNeumaticos;