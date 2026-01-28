import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import reparacionService from '../../services/reparacionService';
import { showToast } from '../../utils/toast';

const TabReparaciones = ({ vehiculo }) => {
  const navigate = useNavigate();
  const [reparaciones, setReparaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [stats, setStats] = useState({
    total_reparaciones: 0,
    costo_total: 0,
    por_categoria: {}
  });

  useEffect(() => {
    loadReparaciones();
  }, [vehiculo._id, filtroCategoria]);

  const loadReparaciones = async () => {
    try {
      setLoading(true);
      const response = await reparacionService.getByVehiculo(vehiculo._id);
      
      let reparacionesFiltradas = response.data || [];
      
      if (filtroCategoria) {
        reparacionesFiltradas = reparacionesFiltradas.filter(
          r => r.categoria === filtroCategoria
        );
      }
      
      setReparaciones(reparacionesFiltradas);
      setStats(response.stats || {
        total_reparaciones: reparacionesFiltradas.length,
        costo_total: reparacionesFiltradas.reduce((sum, r) => sum + r.costo_total, 0),
        por_categoria: {}
      });
    } catch (error) {
      console.error('Error al cargar reparaciones:', error);
      setReparaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeEstado = (estado) => {
    const badges = {
      completada: 'text-green-700 bg-green-50 border border-green-200',
      en_progreso: 'text-orange-700 bg-orange-50 border border-orange-200',
      cancelada: 'text-red-700 bg-red-50 border border-red-200'
    };
    return badges[estado] || 'text-gray-600 bg-gray-100 border border-gray-200';
  };

  const getTextoEstado = (estado) => {
    const textos = {
      completada: 'Completada',
      en_progreso: 'En Progreso',
      cancelada: 'Cancelada'
    };
    return textos[estado] || estado;
  };

  return (
    <div className="space-y-4">
      {/* Stats - Ultra compactos */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-600 mb-1">Total</p>
          <p className="text-xl font-bold text-gray-900">{stats.total_reparaciones}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-600 mb-1">Costo</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900">
            {reparacionService.formatearMoneda(stats.costo_total)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-600 mb-1">Categorías</p>
          <p className="text-xl font-bold text-gray-900">
            {Object.keys(stats.por_categoria || {}).length}
          </p>
        </div>
      </div>

      {/* Filtro y Acción - Compacto */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          {/* Filtro por categoría */}
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
              focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
          >
            <option value="">Todas las categorías</option>
            <option value="Motor">Motor</option>
            <option value="Transmisión">Transmisión</option>
            <option value="Frenos">Frenos</option>
            <option value="Suspensión">Suspensión</option>
            <option value="Sistema Eléctrico">Sistema Eléctrico</option>
            <option value="Llantas">Llantas</option>
            <option value="Carrocería">Carrocería</option>
            <option value="Sistema de Enfriamiento">Sistema de Enfriamiento</option>
            <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
            <option value="Mantenimiento Correctivo">Mantenimiento Correctivo</option>
            <option value="Otro">Otro</option>
          </select>

          {/* Botón nueva reparación */}
          <button
            onClick={() => navigate(`/reparaciones/nueva?vehiculo=${vehiculo._id}`)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white 
              bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva
          </button>
        </div>
      </div>

      {/* Botón flotante "Nueva" en mobile */}
      <button
        onClick={() => navigate(`/reparaciones/nueva?vehiculo=${vehiculo._id}`)}
        className="sm:hidden fixed bottom-6 right-4 w-14 h-14 bg-gray-900 hover:bg-gray-800 
          text-white rounded-full shadow-lg flex items-center justify-center z-30
          transition-all active:scale-95"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-10 h-10 border-3 border-gray-100 rounded-full"></div>
            <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm text-gray-600 mt-3">Cargando reparaciones...</p>
        </div>
      ) : reparaciones.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            {filtroCategoria 
              ? 'No hay reparaciones para esta categoría'
              : 'Sin reparaciones registradas'}
          </p>
          <p className="text-xs text-gray-400">
            {filtroCategoria 
              ? 'Intenta ajustar el filtro'
              : 'Crea la primera reparación'}
          </p>
        </div>
      ) : (
        <>
          {/* Lista de reparaciones - Cards compactos */}
          <div className="space-y-3">
            {reparaciones.map((reparacion) => (
              <div
                key={reparacion._id}
                onClick={() => navigate(`/reparaciones/${reparacion._id}`)}
                className="bg-white rounded-lg border border-gray-200 p-4 
                  hover:border-gray-300 transition-all cursor-pointer"
              >
                {/* Header - Compacto */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    {/* Categoría y estado */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {reparacion.categoria}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getBadgeEstado(reparacion.estado)}`}>
                        {getTextoEstado(reparacion.estado)}
                      </span>
                    </div>
                    
                    {/* Descripción */}
                    <p className="text-sm font-semibold text-gray-900 mb-0.5 line-clamp-1">
                      {reparacion.descripcion}
                    </p>
                    
                    {/* Metadata */}
                    <p className="text-xs text-gray-500">
                      {reparacionService.formatearFechaCorta(reparacion.fecha_realizacion)}
                      {' · '}
                      {reparacion.registrado_por?.nombre}
                    </p>
                  </div>

                  {/* Costo total */}
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {reparacionService.formatearMoneda(reparacion.costo_total)}
                    </p>
                  </div>
                </div>

                {/* Desglose - Compacto */}
                <div className="flex items-center gap-3 text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <span>{reparacion.piezas?.length || 0} pieza{reparacion.piezas?.length !== 1 ? 's' : ''}</span>
                  <span className="text-gray-300">·</span>
                  <span>
                    Piezas: {reparacionService.formatearMoneda(
                      reparacionService.calcularCostoPiezas(reparacion.piezas)
                    )}
                  </span>
                  <span className="text-gray-300 hidden sm:inline">·</span>
                  <span className="hidden sm:inline">
                    M.O.: {reparacionService.formatearMoneda(reparacion.costo_mano_obra)}
                  </span>
                </div>

                {/* Datos operacionales - Solo si existen */}
                {(reparacion.kilometraje_al_momento || reparacion.horas_motor_al_momento) && (
                  <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 mt-2 border-t border-gray-100">
                    {reparacion.kilometraje_al_momento && (
                      <span>{reparacion.kilometraje_al_momento.toLocaleString()} km</span>
                    )}
                    {reparacion.horas_motor_al_momento > 0 && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span>{reparacion.horas_motor_al_momento.toLocaleString()} hrs</span>
                      </>
                    )}
                  </div>
                )}

                {/* Piezas principales - Solo primeras 2 */}
                {reparacion.piezas && reparacion.piezas.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-700 mb-1">Piezas</p>
                    <div className="space-y-0.5">
                      {reparacion.piezas.slice(0, 2).map((pieza, index) => (
                        <p key={index} className="text-xs text-gray-600">
                          • {pieza.nombre} ({pieza.cantidad}x) - {reparacionService.formatearMoneda(pieza.costo_total)}
                        </p>
                      ))}
                      {reparacion.piezas.length > 2 && (
                        <p className="text-xs text-gray-500 italic">
                          + {reparacion.piezas.length - 2} más
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Notas - Solo si existen y son cortas */}
                {reparacion.notas_adicionales && (
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {reparacion.notas_adicionales}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Resumen */}
          <p className="text-xs text-gray-500 text-center">
            {reparaciones.length} reparación{reparaciones.length !== 1 ? 'es' : ''} · 
            {' '}{reparacionService.formatearMoneda(
              reparaciones.reduce((sum, r) => sum + r.costo_total, 0)
            )}
          </p>
        </>
      )}
    </div>
  );
};

export default TabReparaciones;