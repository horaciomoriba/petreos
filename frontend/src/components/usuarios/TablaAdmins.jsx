import { Link } from 'react-router-dom';

const TablaAdmins = ({ admins, onEliminar, onReactivar, onRecargar }) => {
  const getRolBadge = (rol) => {
    const badges = {
      super_admin: 'badge-primary',
      jefe_mantenimiento: 'badge-secondary',
      mecanico: 'badge-secondary',
      supervisor: 'badge-secondary'
    };
    
    const nombres = {
      super_admin: 'Super Admin',
      jefe_mantenimiento: 'Jefe Mantto.',
      mecanico: 'Mecánico',
      supervisor: 'Supervisor'
    };
    
    return (
      <span className={badges[rol]}>
        {nombres[rol]}
      </span>
    );
  };

  if (admins.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-primary-200 overflow-hidden">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-primary-900">No hay administradores</h3>
          <p className="mt-1 text-sm text-primary-500">No se encontraron administradores con ese criterio</p>
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
              <th>Usuario</th>
              <th>Rol</th>
              <th>Sedes</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id}>
                <td>
                  <div>
                    <div className="font-semibold text-primary-900">{admin.nombre}</div>
                    <div className="text-xs text-primary-500 mt-0.5">@{admin.username}</div>
                  </div>
                </td>
                <td>
                  {getRolBadge(admin.rol)}
                </td>
                <td>
                  <div className="text-sm text-primary-700">
                    {admin.sedes?.length > 0 ? (
                      <div className="space-y-1">
                        {admin.sedes.map((sede) => (
                          <div key={sede._id} className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="text-xs">{sede.nombre}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-primary-400">Sin sedes</span>
                    )}
                  </div>
                </td>
                <td>
                  {admin.activo ? (
                    <span className="badge-primary">Activo</span>
                  ) : (
                    <span className="badge-secondary">Inactivo</span>
                  )}
                </td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/usuarios/editar-admin/${admin._id}`}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    {admin.activo ? (
                      admin.rol !== 'super_admin' && (
                        <button
                          onClick={() => onEliminar(admin._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Desactivar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => onReactivar(admin._id)}
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
        {admins.map((admin) => (
          <div key={admin._id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-primary-900">{admin.nombre}</h3>
                <p className="text-xs text-primary-500 mt-0.5">@{admin.username}</p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                {getRolBadge(admin.rol)}
                {admin.activo ? (
                  <span className="badge-primary">Activo</span>
                ) : (
                  <span className="badge-secondary">Inactivo</span>
                )}
              </div>
            </div>
            
            {/* Sedes */}
            {admin.sedes?.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-medium text-primary-700 mb-1">Sedes:</div>
                <div className="flex flex-wrap gap-1">
                  {admin.sedes.map((sede) => (
                    <span key={sede._id} className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded">
                      {sede.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Link
                to={`/usuarios/editar-admin/${admin._id}`}
                className="btn-secondary btn-sm flex-1 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Link>
              {admin.activo ? (
                admin.rol !== 'super_admin' && (
                  <button
                    onClick={() => onEliminar(admin._id)}
                    className="btn-outline btn-sm flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Desactivar
                  </button>
                )
              ) : (
                <button
                  onClick={() => onReactivar(admin._id)}
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

export default TablaAdmins;