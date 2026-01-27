// src/components/vehiculos/TabReparaciones.jsx
// Tab para mostrar reparaciones de un vehículo específico

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
      
      // Aplicar filtro de categoría si existe
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

  // Estado con significado (solo para estados importantes)
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
    <div className="space-y-6">
      {/* Estadísticas - Compacto */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-600 mb-1">Total Reparaciones</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total_reparaciones}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-600 mb-1">Costo Total</p>
          <p className="text-2xl font-bold text-gray-900">
            {reparacionService.formatearMoneda(stats.costo_total)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-600 mb-1">Categorías</p>
          <p className="text-2xl font-bold text-gray-900">
            {Object.keys(stats.por_categoria || {}).length}
          </p>
        </div>
      </div>

      {/* Filtros y Acciones - Compacto */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Filtro por categoría */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-700">Filtrar:</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                transition-all"
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
          </div>

          {/* Botón nueva reparación */}
          <button
            onClick={() => navigate(`/reparaciones/nueva?vehiculo=${vehiculo._id}`)}
            className="px-5 py-2 text-sm font-semibold text-white 
              bg-gradient-to-r from-gray-900 to-gray-700 
              hover:from-gray-800 hover:to-gray-600 
              rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            Nueva Reparación
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm font-medium text-gray-600 mt-4">Cargando reparaciones</p>
        </div>
      ) : reparaciones.length === 0 ? (
        /* Empty State - Siguiendo patrón de la guía */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-gray-50 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            {filtroCategoria 
              ? 'No hay reparaciones para esta categoría'
              : 'Sin reparaciones registradas'}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            {filtroCategoria 
              ? 'Intenta ajustar el filtro de búsqueda'
              : 'Crea la primera reparación para este vehículo'}
          </p>
          {!filtroCategoria && (
            <button
              onClick={() => navigate(`/reparaciones/nueva?vehiculo=${vehiculo._id}`)}
              className="px-5 py-2.5 text-sm font-semibold text-white 
                bg-gradient-to-r from-gray-900 to-gray-700 
                hover:from-gray-800 hover:to-gray-600 
                rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Crear Reparación
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Lista de reparaciones - Cards compactos */}
          <div className="space-y-3">
            {reparaciones.map((reparacion) => (
              <div
                key={reparacion._id}
                onClick={() => navigate(`/reparaciones/${reparacion._id}`)}
                className="bg-white rounded-xl border border-gray-200 p-4 
                  hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 
                  cursor-pointer group"
              >
                {/* Header - Compacto */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {/* Categoría y descripción */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-800">
                        {reparacion.categoria}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getBadgeEstado(reparacion.estado)}`}>
                        {getTextoEstado(reparacion.estado)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                      {reparacion.descripcion}
                    </p>
                    
                    {/* Metadata secundaria */}
                    <p className="text-xs text-gray-500">
                      {reparacionService.formatearFechaCorta(reparacion.fecha_realizacion)}
                      {' · '}
                      {reparacion.registrado_por?.nombre}
                      {reparacion.modificaciones?.length > 0 && (
                        <span className="ml-2 text-orange-600">
                          · Modificada {reparacion.modificaciones.length}x
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Costo total destacado */}
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">Costo Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {reparacionService.formatearMoneda(reparacion.costo_total)}
                    </p>
                  </div>
                </div>

                {/* Desglose de costos - En una línea */}
                <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                  <span>{reparacion.piezas?.length || 0} pieza{reparacion.piezas?.length !== 1 ? 's' : ''}</span>
                  <span className="text-gray-300">·</span>
                  <span>
                    Piezas: {reparacionService.formatearMoneda(
                      reparacionService.calcularCostoPiezas(reparacion.piezas)
                    )}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span>
                    M.O.: {reparacionService.formatearMoneda(reparacion.costo_mano_obra)}
                  </span>
                </div>

                {/* Datos operacionales - Si existen */}
                {(reparacion.kilometraje_al_momento || reparacion.horas_motor_al_momento) && (
                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                    {reparacion.kilometraje_al_momento && (
                      <span>{reparacion.kilometraje_al_momento.toLocaleString()} km</span>
                    )}
                    {reparacion.horas_motor_al_momento > 0 && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span>{reparacion.horas_motor_al_momento.toLocaleString()} hrs motor</span>
                      </>
                    )}
                  </div>
                )}

                {/* Notas adicionales - Solo si existen */}
                {reparacion.notas_adicionales && (
                  <div className="pt-3 border-t border-gray-100 mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Notas adicionales</p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {reparacion.notas_adicionales}
                    </p>
                  </div>
                )}

                {/* Piezas principales - Solo primeras 2 */}
                {reparacion.piezas && reparacion.piezas.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-1.5">Piezas utilizadas</p>
                    <div className="space-y-1">
                      {reparacion.piezas.slice(0, 2).map((pieza, index) => (
                        <p key={index} className="text-xs text-gray-600">
                          • {pieza.nombre} ({pieza.cantidad}x) - {reparacionService.formatearMoneda(pieza.costo_total)}
                        </p>
                      ))}
                      {reparacion.piezas.length > 2 && (
                        <p className="text-xs text-gray-500 italic mt-1">
                          + {reparacion.piezas.length - 2} pieza{reparacion.piezas.length - 2 !== 1 ? 's' : ''} más
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Resumen */}
          <p className="text-xs text-gray-500 text-center">
            Mostrando {reparaciones.length} reparación{reparaciones.length !== 1 ? 'es' : ''} · 
            {' '}Costo total: {reparacionService.formatearMoneda(
              reparaciones.reduce((sum, r) => sum + r.costo_total, 0)
            )}
          </p>
        </>
      )}
    </div>
  );
};

export default TabReparaciones;