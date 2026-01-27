// pages/reparaciones/NuevaReparacion.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import reparacionService, { CATEGORIAS_REPARACION, ESTADOS_REPARACION } from '../../services/reparacionService';
import vehiculoService from '../../services/vehiculoService';
import { showToast } from '../../utils/toast';

const NuevaReparacion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    vehiculo_id: '',
    categoria: '',
    fecha_realizacion: new Date().toISOString().split('T')[0],
    descripcion: '',
    notas_adicionales: '',
    piezas: [],
    costo_mano_obra: 0,
    estado: 'completada',
    kilometraje_al_momento: '',
    horas_motor_al_momento: ''
  });

  useEffect(() => {
    loadVehiculos();
  }, []);

  const loadVehiculos = async () => {
    try {
        const response = await vehiculoService.getAll();
        // ⭐ CORRECCIÓN: acceder a response.vehiculos en lugar de response.data
        setVehiculos(response.vehiculos || []);
    } catch (error) {
        showToast.error('Error al cargar vehículos');
    }
  };

  const handleVehiculoChange = async (vehiculoId) => {
    setFormData({ ...formData, vehiculo_id: vehiculoId });
    
    if (vehiculoId) {
        try {
        const response = await vehiculoService.getById(vehiculoId);
        // ⭐ CORRECCIÓN: verificar si viene como response.vehiculo o response.data
        const vehiculoData = response.vehiculo || response.data || response;
        setVehiculoSeleccionado(vehiculoData);
        
        // Pre-llenar datos operacionales
        setFormData(prev => ({
            ...prev,
            vehiculo_id: vehiculoId,
            kilometraje_al_momento: vehiculoData.kilometraje_actual || '',
            horas_motor_al_momento: vehiculoData.horas_motor_actual || ''
        }));
        } catch (error) {
        console.error('Error al cargar vehículo:', error);
        }
    } else {
        setVehiculoSeleccionado(null);
    }
  };

  const agregarPieza = () => {
    setFormData({
      ...formData,
      piezas: [
        ...formData.piezas,
        { nombre: '', cantidad: 1, costo_unitario: 0 }
      ]
    });
  };

  const eliminarPieza = (index) => {
    setFormData({
      ...formData,
      piezas: formData.piezas.filter((_, i) => i !== index)
    });
  };

  const actualizarPieza = (index, campo, valor) => {
    const nuevasPiezas = [...formData.piezas];
    nuevasPiezas[index][campo] = valor;
    setFormData({ ...formData, piezas: nuevasPiezas });
  };

  const calcularCostoTotal = () => {
    const costoPiezas = reparacionService.calcularCostoPiezas(formData.piezas);
    const costoManoObra = Number(formData.costo_mano_obra) || 0;
    return costoPiezas + costoManoObra;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar
    const { valido, errores } = reparacionService.validar(formData);
    if (!valido) {
      showToast.error(errores[0]);
      return;
    }

    try {
      setLoading(true);
      const dataFormateada = reparacionService.formatearParaEnvio(formData);
      await reparacionService.create(dataFormateada);
      showToast.success('Reparación registrada exitosamente');
      navigate('/reparaciones');
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al crear reparación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/reparaciones')}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Nueva Reparación</h1>
            <p className="text-sm text-primary-600">Registra una nueva reparación o mantenimiento</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Información General */}
            <div className="bg-white rounded-xl border border-primary-200 p-5">
              <h2 className="text-lg font-semibold text-primary-900 mb-4">Información General</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehículo */}
                <div className="md:col-span-2">
                  <label className="label required">Vehículo</label>
                  <select
                    value={formData.vehiculo_id}
                    onChange={(e) => handleVehiculoChange(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Seleccionar vehículo</option>
                    {vehiculos.map(v => (
                      <option key={v._id} value={v._id}>
                        {v.numero_economico} - {v.placa} ({v.tipo_vehiculo})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Info del vehículo seleccionado */}
                {vehiculoSeleccionado && (
                  <div className="md:col-span-2 p-3 bg-primary-50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-primary-600">Marca</p>
                        <p className="font-medium text-primary-900">{vehiculoSeleccionado.marca}</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary-600">Modelo</p>
                        <p className="font-medium text-primary-900">{vehiculoSeleccionado.modelo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary-600">Kilometraje</p>
                        <p className="font-medium text-primary-900">
                          {vehiculoSeleccionado.kilometraje_actual?.toLocaleString()} km
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-primary-600">Horas Motor</p>
                        <p className="font-medium text-primary-900">
                          {vehiculoSeleccionado.horas_motor_actual?.toLocaleString()} hrs
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Categoría */}
                <div>
                  <label className="label required">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {CATEGORIAS_REPARACION.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Fecha de Realización */}
                <div>
                  <label className="label required">Fecha de Realización</label>
                  <input
                    type="date"
                    value={formData.fecha_realizacion}
                    onChange={(e) => setFormData({ ...formData, fecha_realizacion: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="label">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="input"
                  >
                    {ESTADOS_REPARACION.map(est => (
                      <option key={est.value} value={est.value}>{est.label}</option>
                    ))}
                  </select>
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="label required">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="input"
                    rows="3"
                    placeholder="Describe la reparación realizada..."
                    required
                  />
                </div>

                {/* Notas Adicionales */}
                <div className="md:col-span-2">
                  <label className="label">Notas Adicionales</label>
                  <textarea
                    value={formData.notas_adicionales}
                    onChange={(e) => setFormData({ ...formData, notas_adicionales: e.target.value })}
                    className="input"
                    rows="2"
                    placeholder="Observaciones, recomendaciones, etc..."
                  />
                </div>
              </div>
            </div>

            {/* Datos Operacionales */}
            <div className="bg-white rounded-xl border border-primary-200 p-5">
              <h2 className="text-lg font-semibold text-primary-900 mb-4">Datos Operacionales</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Kilometraje al Momento</label>
                  <input
                    type="number"
                    value={formData.kilometraje_al_momento}
                    onChange={(e) => setFormData({ ...formData, kilometraje_al_momento: e.target.value })}
                    className="input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="label">Horas Motor al Momento</label>
                  <input
                    type="number"
                    value={formData.horas_motor_al_momento}
                    onChange={(e) => setFormData({ ...formData, horas_motor_al_momento: e.target.value })}
                    className="input"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Piezas Utilizadas */}
            <div className="bg-white rounded-xl border border-primary-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-primary-900">Piezas Utilizadas</h2>
                <button
                  type="button"
                  onClick={agregarPieza}
                  className="btn-secondary btn-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Pieza
                </button>
              </div>

              {formData.piezas.length === 0 ? (
                <div className="text-center py-8 text-sm text-primary-600">
                  No hay piezas agregadas. Haz clic en "Agregar Pieza" para comenzar.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.piezas.map((pieza, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end p-3 bg-primary-50 rounded-lg">
                      <div className="col-span-12 md:col-span-5">
                        <label className="label text-xs">Nombre de la Pieza</label>
                        <input
                          type="text"
                          value={pieza.nombre}
                          onChange={(e) => actualizarPieza(index, 'nombre', e.target.value)}
                          className="input input-sm"
                          placeholder="Ej: Balatas delanteras"
                          required
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <label className="label text-xs">Cantidad</label>
                        <input
                          type="number"
                          value={pieza.cantidad}
                          onChange={(e) => actualizarPieza(index, 'cantidad', Number(e.target.value))}
                          className="input input-sm"
                          min="1"
                          required
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <label className="label text-xs">Costo Unitario</label>
                        <input
                          type="number"
                          value={pieza.costo_unitario}
                          onChange={(e) => actualizarPieza(index, 'costo_unitario', Number(e.target.value))}
                          className="input input-sm"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="col-span-10 md:col-span-1 text-right">
                        <p className="text-xs text-primary-600 mb-1">Total</p>
                        <p className="text-sm font-bold text-primary-900">
                          ${(pieza.cantidad * pieza.costo_unitario).toFixed(2)}
                        </p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <button
                          type="button"
                          onClick={() => eliminarPieza(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                        >
                          <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Resumen de Costos */}
            <div className="bg-white rounded-xl border border-primary-200 p-5">
              <h3 className="text-sm font-semibold text-primary-900 mb-4">Resumen de Costos</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="label">Mano de Obra</label>
                  <input
                    type="number"
                    value={formData.costo_mano_obra}
                    onChange={(e) => setFormData({ ...formData, costo_mano_obra: e.target.value })}
                    className="input"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>

                <div className="pt-3 border-t border-primary-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-600">Piezas:</span>
                    <span className="font-medium text-primary-900">
                      {reparacionService.formatearMoneda(
                        reparacionService.calcularCostoPiezas(formData.piezas)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-600">Mano de Obra:</span>
                    <span className="font-medium text-primary-900">
                      {reparacionService.formatearMoneda(Number(formData.costo_mano_obra) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-primary-200">
                    <span className="font-semibold text-primary-900">Total:</span>
                    <span className="text-xl font-bold text-primary-900">
                      {reparacionService.formatearMoneda(calcularCostoTotal())}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-xl border border-primary-200 p-5">
              <h3 className="text-sm font-semibold text-primary-900 mb-4">Acciones</h3>
              
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="spinner h-4 w-4"></div>
                      Guardando...
                    </span>
                  ) : (
                    'Registrar Reparación'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/reparaciones')}
                  className="btn-outline w-full"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NuevaReparacion;