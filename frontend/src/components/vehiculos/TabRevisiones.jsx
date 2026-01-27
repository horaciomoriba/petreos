// src/components/vehiculos/TabRevisiones.jsx
// Rediseñado siguiendo guía de diseño minimalista-industrial

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import revisionService from '../../services/revisionService';
import { showToast } from '../../utils/toast';

const TabRevisiones = ({ vehiculo, onUpdate }) => {
  const navigate = useNavigate();
  const [revisiones, setRevisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroFrecuencia, setFiltroFrecuencia] = useState('');

  useEffect(() => {
    loadRevisiones();
  }, [vehiculo._id, filtroFrecuencia]);

  const loadRevisiones = async () => {
    try {
      setLoading(true);
      const data = await revisionService.getByVehiculoAdmin(vehiculo._id, {
        frecuencia: filtroFrecuencia,
        limit: 20
      });
      setRevisiones(data);
    } catch (error) {
      console.error('Error al cargar revisiones:', error);
      setRevisiones([]);
    } finally {
      setLoading(false);
    }
  };

  // Estado con significado (solo para problemas críticos)
  const getBadgeEstado = (revision) => {
    if (revision.tiene_problemas) {
      return 'text-red-700 bg-red-50 border border-red-200';
    }
    if (revision.aprobada) {
      return 'text-green-700 bg-green-50 border border-green-200';
    }
    if (revision.estado === 'pendiente_revision') {
      return 'text-orange-700 bg-orange-50 border border-orange-200';
    }
    return 'text-gray-600 bg-gray-100 border border-gray-200';
  };

  const getTextoEstado = (revision) => {
    if (revision.tiene_problemas) return 'Con problemas';
    if (revision.aprobada) return 'Aprobada';
    if (revision.estado === 'pendiente_revision') return 'Pendiente';
    if (revision.estado === 'completada') return 'Completada';
    return revision.estado.replace('_', ' ');
  };

  return (
    <div className="space-y-6">
      {/* Filtros y Acciones - Compacto */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Filtro por frecuencia */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-700">Filtrar:</label>
            <select
              value={filtroFrecuencia}
              onChange={(e) => setFiltroFrecuencia(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                transition-all"
            >
              <option value="">Todas</option>
              <option value="diaria">Diaria</option>
              <option value="mensual">Mensual</option>
              <option value="bimestral">Bimestral</option>
            </select>
          </div>

          {/* Botón nueva revisión */}
          <button
            onClick={() => navigate(`/revisiones/nueva?vehiculo=${vehiculo._id}`)}
            className="px-5 py-2 text-sm font-semibold text-white 
              bg-gradient-to-r from-gray-900 to-gray-700 
              hover:from-gray-800 hover:to-gray-600 
              rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            Nueva Revisión
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
          <p className="text-sm font-medium text-gray-600 mt-4">Cargando revisiones</p>
        </div>
      ) : revisiones.length === 0 ? (
        /* Empty State - Siguiendo patrón de la guía */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-gray-50 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            {filtroFrecuencia 
              ? 'No hay revisiones para este filtro'
              : 'Sin revisiones registradas'}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            {filtroFrecuencia 
              ? 'Intenta ajustar el filtro de búsqueda'
              : 'Crea la primera revisión para este vehículo'}
          </p>
          {!filtroFrecuencia && (
            <button
              onClick={() => navigate(`/revisiones/nueva?vehiculo=${vehiculo._id}`)}
              className="px-5 py-2.5 text-sm font-semibold text-white 
                bg-gradient-to-r from-gray-900 to-gray-700 
                hover:from-gray-800 hover:to-gray-600 
                rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Crear Revisión
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Lista de revisiones - Cards compactos */}
          <div className="space-y-3">
            {revisiones.map((revision) => (
              <div
                key={revision._id}
                onClick={() => navigate(`/revisiones/${revision._id}`)}
                className="bg-white rounded-xl border border-gray-200 p-4 
                  hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 
                  cursor-pointer group"
              >
                {/* Header - Compacto */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {/* Fecha principal */}
                    <p className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                      {new Date(revision.fecha).toLocaleDateString('es-MX', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    
                    {/* Metadata secundaria */}
                    <p className="text-xs text-gray-500">
                      {revision.operador.nombre}
                      {' · '}
                      <span className="capitalize">{revision.frecuencia}</span>
                    </p>
                  </div>

                  {/* Badge de estado - Solo si es importante */}
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getBadgeEstado(revision)}`}>
                    {getTextoEstado(revision)}
                  </span>
                </div>

                {/* Datos operacionales - En una línea */}
                <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                  <span>{revision.kilometraje_al_momento?.toLocaleString()} km</span>
                  {revision.horas_motor_al_momento > 0 && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span>{revision.horas_motor_al_momento?.toLocaleString()} hrs</span>
                    </>
                  )}
                  <span className="text-gray-300">·</span>
                  <span className="capitalize">{revision.nivel_combustible}</span>
                </div>

                {/* Problemas detectados - Solo si existen */}
                {revision.tiene_problemas && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-700 mb-1.5">Problemas detectados</p>
                    <div className="space-y-1">
                      {revision.items_mal?.slice(0, 2).map((item, index) => (
                        <p key={index} className="text-xs text-gray-600">
                          • {item.texto}
                        </p>
                      ))}
                      {revision.llantas_mal?.length > 0 && (
                        <p className="text-xs text-gray-600">
                          • {revision.llantas_mal.length} neumático{revision.llantas_mal.length !== 1 ? 's' : ''} con problemas
                        </p>
                      )}
                      {(revision.items_mal?.length > 2 || revision.llantas_mal?.length > 0) && (
                        <p className="text-xs text-gray-500 italic mt-1">
                          + más detalles en la revisión
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Comentarios - Solo si existen */}
                {revision.comentarios && !revision.tiene_problemas && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {revision.comentarios}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Resumen */}
          <p className="text-xs text-gray-500 text-center">
            Mostrando {revisiones.length} revisión{revisiones.length !== 1 ? 'es' : ''}
          </p>
        </>
      )}
    </div>
  );
};

export default TabRevisiones;