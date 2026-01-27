// src/components/vehiculos/TabCombustible.jsx
// Vista tabular minimalista con gráfica de histórico

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import adminCombustibleService from '../../services/adminCombustibleService';
import { showToast } from '../../utils/toast';

const TabCombustible = ({ vehiculo, onUpdate }) => {
  const [cargas, setCargas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cargaAEliminar, setCargaAEliminar] = useState(null);
  const [formData, setFormData] = useState({
    litros_cargados: '',
    horas_motor_al_momento: '',
    kilometraje_al_momento: '',
    costo: '',
    gasolinera: '',
    numero_ticket: '',
    observaciones: ''
  });

  useEffect(() => {
    loadData();
  }, [vehiculo._id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await adminCombustibleService.getCargasVehiculo(vehiculo._id, 1, 100);
      setCargas(response.data?.cargas || response.cargas || []);
      setEstadisticas(response.data?.estadisticas || response.estadisticas || null);
    } catch (error) {
      console.error('Error al cargar cargas:', error);
      setCargas([]);
      setEstadisticas(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await adminCombustibleService.registrarCarga({
        vehiculo_id: vehiculo._id,
        litros_cargados: parseFloat(formData.litros_cargados),
        horas_motor_al_momento: parseFloat(formData.horas_motor_al_momento),
        kilometraje_al_momento: formData.kilometraje_al_momento 
          ? parseFloat(formData.kilometraje_al_momento) 
          : undefined,
        costo: formData.costo ? parseFloat(formData.costo) : undefined,
        gasolinera: formData.gasolinera || undefined,
        numero_ticket: formData.numero_ticket || undefined,
        observaciones: formData.observaciones || undefined
      });

      showToast.success('Carga registrada correctamente');
      setMostrarForm(false);
      setFormData({
        litros_cargados: '',
        horas_motor_al_momento: '',
        kilometraje_al_momento: '',
        costo: '',
        gasolinera: '',
        numero_ticket: '',
        observaciones: ''
      });
      loadData();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al registrar carga:', error);
      showToast.error(error.response?.data?.message || 'Error al registrar carga');
    }
  };

  const handleCancelar = () => {
    setMostrarForm(false);
    setFormData({
      litros_cargados: '',
      horas_motor_al_momento: '',
      kilometraje_al_momento: '',
      costo: '',
      gasolinera: '',
      numero_ticket: '',
      observaciones: ''
    });
  };

  const handleEliminar = async () => {
    if (!cargaAEliminar) return;

    try {
      await adminCombustibleService.eliminarCarga(cargaAEliminar._id);
      showToast.success('Carga eliminada correctamente');
      setCargaAEliminar(null);
      loadData();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al eliminar carga:', error);
      showToast.error(error.response?.data?.message || 'Error al eliminar carga');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatearFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short'
    });
  };

  // Preparar datos para la gráfica
  const datosGrafica = cargas
    .filter(c => c.rendimiento?.calculado)
    .slice(0, 10)
    .reverse()
    .map(c => ({
      fecha: formatearFechaCorta(c.fecha_carga),
      consumo: c.rendimiento.consumo_por_hora,
      litros: c.litros_cargados
    }));

  return (
    <div className="space-y-4">
      {/* Estadísticas - Compactas en una línea */}
      {estadisticas && estadisticas.total_cargas > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Cargas</p>
              <p className="text-lg font-bold text-gray-900">{estadisticas.total_cargas}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Litros</p>
              <p className="text-lg font-bold text-gray-900">
                {estadisticas.total_litros?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Costo</p>
              <p className="text-lg font-bold text-gray-900">
                ${estadisticas.total_costo?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Promedio</p>
              <p className="text-lg font-bold text-gray-900">
                {estadisticas.consumo_promedio?.toFixed(2)} L/h
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gráfica de consumo */}
      {datosGrafica.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-900 mb-3">Histórico de consumo</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={datosGrafica}>
              <XAxis 
                dataKey="fecha" 
                tick={{ fontSize: 11 }}
                stroke="#9CA3AF"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                stroke="#9CA3AF"
                label={{ value: 'L/h', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
              />
              <Tooltip 
                contentStyle={{ 
                  fontSize: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => {
                  if (name === 'consumo') return [value.toFixed(2) + ' L/h', 'Consumo'];
                  if (name === 'litros') return [value + ' L', 'Litros'];
                }}
              />
              <Line 
                type="monotone" 
                dataKey="consumo" 
                stroke="#111827" 
                strokeWidth={2}
                dot={{ fill: '#111827', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Formulario de nueva carga - Colapsable */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        {!mostrarForm ? (
          <button
            onClick={() => setMostrarForm(true)}
            className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
          >
            + Nueva carga
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Litros*</label>
                <input
                  type="number"
                  name="litros_cargados"
                  value={formData.litros_cargados}
                  onChange={handleChange}
                  required
                  min="0.1"
                  step="0.1"
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Horas motor*</label>
                <input
                  type="number"
                  name="horas_motor_al_momento"
                  value={formData.horas_motor_al_momento}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="1250"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Kilometraje</label>
                <input
                  type="number"
                  name="kilometraje_al_momento"
                  value={formData.kilometraje_al_momento}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="15000"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Costo</label>
                <input
                  type="number"
                  name="costo"
                  value={formData.costo}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="1500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Gasolinera</label>
                <input
                  type="text"
                  name="gasolinera"
                  value={formData.gasolinera}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="Shell"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Ticket</label>
                <input
                  type="text"
                  name="numero_ticket"
                  value={formData.numero_ticket}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="A-123"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Observaciones</label>
                <input
                  type="text"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="Notas..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded transition-colors"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={handleCancelar}
                className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tabla de cargas - Estilo Excel */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="w-8 h-8 border-2 border-gray-200 rounded-full"></div>
            <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
        </div>
      ) : cargas.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">Sin cargas registradas</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Fecha</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Litros</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Hrs Motor</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Km</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">L/h</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Costo</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Gasolinera</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Registró</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cargas.map((carga) => (
                  <tr key={carga._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">
                      {formatearFecha(carga.fecha_carga)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 text-right font-medium">
                      {carga.litros_cargados}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 text-right">
                      {carga.horas_motor_al_momento}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 text-right">
                      {carga.kilometraje_al_momento?.toLocaleString() || '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {carga.rendimiento?.calculado ? (
                        <span className="font-medium text-gray-900">
                          {carga.rendimiento.consumo_por_hora.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 text-right">
                      {carga.costo ? `$${carga.costo.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 truncate max-w-[120px]">
                      {carga.gasolinera || '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 truncate max-w-[100px]">
                      {carga.registrado_por?.nombre || '-'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => setCargaAEliminar(carga)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Eliminar carga"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {cargas.length} registro{cargas.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {cargaAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                ¿Eliminar carga de combustible?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Esta acción eliminará permanentemente el registro de <span className="font-medium">{cargaAEliminar.litros_cargados} litros</span> del {formatearFecha(cargaAEliminar.fecha_carga)}.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setCargaAEliminar(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 
                    bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminar}
                  className="px-4 py-2 text-sm font-medium text-white 
                    bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabCombustible;