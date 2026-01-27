import { Link } from 'react-router-dom';

const TablaOperadores = ({ operadores, onEliminar, onRecargar }) => {
  if (operadores.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-primary-200 overflow-hidden">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-primary-900">No hay operadores</h3>
          <p className="mt-1 text-sm text-primary-500">No se encontraron operadores con ese criterio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-primary-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Operador</th>
              <th>Sede</th>
              <th>Vehículo Asignado</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {operadores.map((operador) => (
              <tr key={operador._id}>
                <td>
                  <div>
                    <div className="font-semibold text-primary-900">{operador.nombre}</div>
                    <div className="text-xs text-primary-500 mt-0.5">@{operador.username}</div>
                  </div>
                </td>
                <td>
                  {operador.sedeActual ? (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-primary-700">{operador.sedeActual.nombre}</div>
                        {operador.sedeActual.ciudad && (
                          <div className="text-xs text-primary-500">{operador.sedeActual.ciudad}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-primary-400">Sin sede</span>
                  )}
                </td>
                <td>
                  {operador.vehiculoAsignado ? (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <div>
                        <div className="text-sm font-semibold text-primary-900">
                          {operador.vehiculoAsignado.numeroEconomico}
                        </div>
                        <div className="text-xs text-primary-500">
                          {operador.vehiculoAsignado.placa} • {operador.vehiculoAsignado.tipo}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="badge-secondary">Sin asignar</span>
                  )}
                </td>
                <td>
                  {operador.activo ? (
                    <span className="badge-primary">Activo</span>
                  ) : (
                    <span className="badge-secondary">Inactivo</span>
                  )}
                </td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/usuarios/editar-operador/${operador._id}`}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    {operador.activo ? (
                      <button
                        onClick={() => onEliminar(operador._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Desactivar"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => onRecargar()}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Reactivar"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-primary-200">
        {operadores.map((operador) => (
          <div key={operador._id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-primary-900">{operador.nombre}</h3>
                <p className="text-xs text-primary-500 mt-0.5">@{operador.username}</p>
              </div>
              {operador.activo ? (
                <span className="badge-primary ml-2">Activo</span>
              ) : (
                <span className="badge-secondary ml-2">Inactivo</span>
              )}
            </div>
            
            <div className="space-y-2 mb-3 text-sm">
              {/* Sede */}
              {operador.sedeActual && (
                <div className="flex items-center gap-2 text-primary-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-medium">{operador.sedeActual.nombre}</span>
                  {operador.sedeActual.ciudad && (
                    <span className="text-xs text-primary-500">• {operador.sedeActual.ciudad}</span>
                  )}
                </div>
              )}

              {/* Vehículo */}
              {operador.vehiculoAsignado ? (
                <div className="flex items-center gap-2 text-primary-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <span className="font-semibold text-primary-900">{operador.vehiculoAsignado.numeroEconomico}</span>
                    <span className="text-xs text-primary-500 ml-1">
                      {operador.vehiculoAsignado.placa} • {operador.vehiculoAsignado.tipo}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs text-primary-400">Sin vehículo asignado</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Link
                to={`/usuarios/editar-operador/${operador._id}`}
                className="btn-secondary btn-sm flex-1 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Link>
              {operador.activo ? (
                <button
                  onClick={() => onEliminar(operador._id)}
                  className="btn-outline btn-sm flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Desactivar
                </button>
              ) : (
                <button
                  onClick={() => onRecargar()}
                  className="btn-outline btn-sm flex items-center justify-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reactivar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TablaOperadores;