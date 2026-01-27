// pages/reparaciones/DetalleReparacion.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import reparacionService from '../../services/reparacionService';
import { showToast } from '../../utils/toast';

const DetalleReparacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reparacion, setReparacion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReparacion();
  }, [id]);

  const loadReparacion = async () => {
    try {
      setLoading(true);
      const response = await reparacionService.getById(id);
      setReparacion(response.data);
    } catch (error) {
      showToast.error('Error al cargar reparación');
      navigate('/reparaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!window.confirm('¿Estás seguro de eliminar esta reparación?')) return;

    try {
      await reparacionService.delete(id);
      showToast.success('Reparación eliminada exitosamente');
      navigate('/reparaciones');
    } catch (error) {
      showToast.error('Error al eliminar reparación');
    }
  };

  const getBadgeEstado = (estado) => {
    const badges = {
      completada: 'bg-green-100 text-green-800',
      en_progreso: 'bg-orange-100 text-orange-800',
      cancelada: 'bg-red-100 text-red-800'
    };
    const textos = {
      completada: 'Completada',
      en_progreso: 'En Progreso',
      cancelada: 'Cancelada'
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${badges[estado]}`}>
        {textos[estado]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="spinner h-8 w-8"></div>
        </div>
      </div>
    );
  }

  if (!reparacion) {
    return null;
  }

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
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary-900">Detalle de Reparación</h1>
            <p className="text-sm text-primary-600">
              Registrada el {reparacionService.formatearFecha(reparacion.fecha_registro)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/reparaciones/${id}/editar`)}
              className="btn-secondary"
            >
              Editar
            </button>
            <button
              onClick={handleEliminar}
              className="btn-outline text-red-600 hover:bg-red-50 border-red-200"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Información General */}
          <div className="bg-white rounded-xl border border-primary-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary-900">Información General</h2>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-primary-100 text-primary-900">
                  {reparacion.categoria}
                </span>
                {getBadgeEstado(reparacion.estado)}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-primary-900 mb-2">{reparacion.descripcion}</p>
                {reparacion.notas_adicionales && (
                  <div className="mt-2 p-3 bg-primary-50 rounded-lg">
                    <p className="text-xs text-primary-600 mb-1">Notas Adicionales:</p>
                    <p className="text-sm text-primary-900">{reparacion.notas_adicionales}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-200">
                <div>
                  <p className="text-xs text-primary-600 mb-1">Vehículo</p>
                  <p className="text-sm font-medium text-primary-900">
                    {reparacion.placa} • {reparacion.numero_economico}
                  </p>
                  <p className="text-xs text-primary-500">{reparacion.tipo_vehiculo}</p>
                </div>
                <div>
                  <p className="text-xs text-primary-600 mb-1">Fecha de Realización</p>
                  <p className="text-sm font-medium text-primary-900">
                    {reparacionService.formatearFecha(reparacion.fecha_realizacion)}
                  </p>
                </div>
                {reparacion.kilometraje_al_momento && (
                  <div>
                    <p className="text-xs text-primary-600 mb-1">Kilometraje</p>
                    <p className="text-sm font-medium text-primary-900">
                      {reparacion.kilometraje_al_momento.toLocaleString()} km
                    </p>
                  </div>
                )}
                {reparacion.horas_motor_al_momento && (
                  <div>
                    <p className="text-xs text-primary-600 mb-1">Horas Motor</p>
                    <p className="text-sm font-medium text-primary-900">
                      {reparacion.horas_motor_al_momento.toLocaleString()} hrs
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Piezas Utilizadas */}
          <div className="bg-white rounded-xl border border-primary-200 p-5">
            <h2 className="text-lg font-semibold text-primary-900 mb-4">
              Piezas Utilizadas ({reparacion.piezas?.length || 0})
            </h2>

            {reparacion.piezas && reparacion.piezas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-primary-900">#</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-primary-900">Pieza</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-primary-900">Cant.</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-primary-900">Costo Unit.</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-primary-900">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-100">
                    {reparacion.piezas.map((pieza, index) => (
                      <tr key={index} className="hover:bg-primary-50">
                        <td className="px-4 py-3 text-sm text-primary-600">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-primary-900">{pieza.nombre}</td>
                        <td className="px-4 py-3 text-sm text-primary-900 text-right">{pieza.cantidad}</td>
                        <td className="px-4 py-3 text-sm text-primary-900 text-right">
                          {reparacionService.formatearMoneda(pieza.costo_unitario)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-primary-900 text-right">
                          {reparacionService.formatearMoneda(pieza.costo_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-primary-50">
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-sm font-semibold text-primary-900 text-right">
                        Subtotal Piezas:
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-primary-900 text-right">
                        {reparacionService.formatearMoneda(
                          reparacionService.calcularCostoPiezas(reparacion.piezas)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-primary-600">
                No se utilizaron piezas en esta reparación
              </div>
            )}
          </div>

          {/* Historial de Modificaciones */}
          {reparacion.modificaciones && reparacion.modificaciones.length > 0 && (
            <div className="bg-white rounded-xl border border-primary-200 p-5">
              <h2 className="text-lg font-semibold text-primary-900 mb-4">
                Historial de Modificaciones
              </h2>

              <div className="space-y-3">
                {reparacion.modificaciones.map((mod, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-900">
                        {mod.descripcion || 'Modificación realizada'}
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        Por {mod.modificado_por?.nombre} el {reparacionService.formatearFecha(mod.fecha)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Resumen de Costos */}
          <div className="bg-white rounded-xl border border-primary-200 p-5">
            <h3 className="text-sm font-semibold text-primary-900 mb-4">Resumen de Costos</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-primary-600">Piezas:</span>
                <span className="font-medium text-primary-900">
                  {reparacionService.formatearMoneda(
                    reparacionService.calcularCostoPiezas(reparacion.piezas)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-600">Mano de Obra:</span>
                <span className="font-medium text-primary-900">
                  {reparacionService.formatearMoneda(reparacion.costo_mano_obra)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-primary-200">
                <span className="font-semibold text-primary-900">Total:</span>
                <span className="text-xl font-bold text-primary-900">
                  {reparacionService.formatearMoneda(reparacion.costo_total)}
                </span>
              </div>
            </div>
          </div>

          {/* Información de Registro */}
          <div className="bg-white rounded-xl border border-primary-200 p-5">
            <h3 className="text-sm font-semibold text-primary-900 mb-4">Información de Registro</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-primary-600 mb-1">Registrado por</p>
                <p className="font-medium text-primary-900">{reparacion.registrado_por?.nombre}</p>
              </div>
              <div>
                <p className="text-xs text-primary-600 mb-1">Fecha de registro</p>
                <p className="font-medium text-primary-900">
                  {reparacionService.formatearFecha(reparacion.fecha_registro)}
                </p>
              </div>
              {reparacion.modificaciones?.length > 0 && (
                <div>
                  <p className="text-xs text-primary-600 mb-1">Última modificación</p>
                  <p className="font-medium text-primary-900">
                    {reparacionService.formatearFecha(
                      reparacion.modificaciones[reparacion.modificaciones.length - 1].fecha
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleReparacion;