// src/components/vehiculos/ConfiguradorNeumaticos.jsx

import { useState } from 'react';
import vehiculoService from '../../services/vehiculoService';
import { showToast } from '../../utils/toast';

const ConfiguradorNeumaticos = ({ vehiculo, onClose, onSuccess }) => {
  const [numeroEjes, setNumeroEjes] = useState(
    vehiculo.configuracion_neumaticos?.total_ejes || 2
  );
  const [ejes, setEjes] = useState(
    vehiculo.configuracion_neumaticos?.ejes.map(eje => ({
      nombre: eje.nombre,
      neumaticos_por_lado: eje.neumaticos_por_lado
    })) || [
      { nombre: 'Dirección', neumaticos_por_lado: 1 },
      { nombre: 'Tracción', neumaticos_por_lado: 2 }
    ]
  );
  const [loading, setLoading] = useState(false);

  const handleNumeroEjesChange = (e) => {
    const num = parseInt(e.target.value);
    setNumeroEjes(num);

    // Ajustar array de ejes
    const newEjes = [...ejes];
    if (num > ejes.length) {
      // Agregar ejes
      for (let i = ejes.length; i < num; i++) {
        newEjes.push({
          nombre: `Eje ${i + 1}`,
          neumaticos_por_lado: 2
        });
      }
    } else {
      // Quitar ejes
      newEjes.splice(num);
    }
    setEjes(newEjes);
  };

  const handleEjeChange = (index, field, value) => {
    const newEjes = [...ejes];
    newEjes[index][field] = value;
    setEjes(newEjes);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const configuracion = {
        ejes: ejes.map((eje, index) => ({
          nombre: eje.nombre,
          neumaticos_por_lado: parseInt(eje.neumaticos_por_lado),
          posicion_visual: index + 1
        }))
      };

      await vehiculoService.configurarNeumaticos(vehiculo._id, configuracion);
      showToast.success('Neumáticos configurados exitosamente');
      onSuccess();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al configurar neumáticos');
    } finally {
      setLoading(false);
    }
  };

  // Calcular total de neumáticos
  const totalNeumaticos = ejes.reduce((sum, eje) => sum + (eje.neumaticos_por_lado * 2), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-primary-200">
          <h2 className="text-xl font-bold text-primary-900">Configurar Neumáticos</h2>
          <p className="text-sm text-primary-600 mt-1">
            Define la estructura de ejes y neumáticos para {vehiculo.placa}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Número de ejes */}
          <div>
            <label className="label">Número de Ejes</label>
            <select
              value={numeroEjes}
              onChange={handleNumeroEjesChange}
              className="input"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'eje' : 'ejes'}</option>
              ))}
            </select>
          </div>

          {/* Configuración por eje */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary-900">Configuración por Eje</h3>
            
            {ejes.map((eje, index) => (
              <div key={index} className="border border-primary-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre del eje */}
                  <div>
                    <label className="label">Nombre del Eje {index + 1}</label>
                    <input
                      type="text"
                      value={eje.nombre}
                      onChange={(e) => handleEjeChange(index, 'nombre', e.target.value)}
                      className="input"
                      placeholder="Ej: Dirección, Tracción, Carga"
                    />
                  </div>

                  {/* Tipo de neumáticos */}
                  <div>
                    <label className="label">Configuración</label>
                    <select
                      value={eje.neumaticos_por_lado}
                      onChange={(e) => handleEjeChange(index, 'neumaticos_por_lado', e.target.value)}
                      className="input"
                    >
                      <option value={1}>Simple (1 neumático por lado)</option>
                      <option value={2}>Dual (2 neumáticos por lado)</option>
                      <option value={3}>Triple (3 neumáticos por lado)</option>
                    </select>
                  </div>
                </div>

                {/* Preview del eje */}
                <div className="mt-3 flex items-center justify-center gap-4 bg-primary-50 rounded p-3">
                  <div className="flex gap-1">
                    {Array(parseInt(eje.neumaticos_por_lado)).fill().map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-500"></div>
                    ))}
                  </div>
                  <div className="text-xs text-primary-600 font-medium">{eje.nombre}</div>
                  <div className="flex gap-1">
                    {Array(parseInt(eje.neumaticos_por_lado)).fill().map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-500"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Resumen de configuración</p>
                <p className="mt-1">
                  Total de ejes: {numeroEjes} | Total de neumáticos: {totalNeumaticos}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-primary-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-outline"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner h-4 w-4 mr-2"></div>
                Guardando...
              </>
            ) : (
              'Guardar Configuración'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfiguradorNeumaticos;