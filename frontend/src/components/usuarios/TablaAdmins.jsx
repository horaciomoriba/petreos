import { Link } from 'react-router-dom';

const TablaAdmins = ({ admins, onEliminar, onReactivar, onRecargar }) => {
  const getRolBadge = (rol) => {
    const badges = {
      super_admin: 'bg-purple-100 text-purple-800',
      jefe_mantenimiento: 'bg-blue-100 text-blue-800',
      mecanico: 'bg-green-100 text-green-800',
      supervisor: 'bg-yellow-100 text-yellow-800'
    };
    
    const nombres = {
      super_admin: 'Super Admin',
      jefe_mantenimiento: 'Jefe Mantto.',
      mecanico: 'Mecánico',
      supervisor: 'Supervisor'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[rol]}`}>
        {nombres[rol]}
      </span>
    );
  };

  if (admins.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No hay administradores registrados</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sedes
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {admins.map((admin) => (
            <tr key={admin._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{admin.nombre}</div>
                  <div className="text-sm text-gray-500">@{admin.username}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getRolBadge(admin.rol)}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {admin.sedes?.length > 0 ? (
                    <div className="space-y-1">
                      {admin.sedes.map((sede) => (
                        <div key={sede._id} className="text-xs">
                          {sede.nombre}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">Sin sedes</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {admin.activo ? (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    Inactivo
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Link
                    to={`/usuarios/editar-admin/${admin._id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </Link>
                  {admin.activo ? (
                    admin.rol !== 'super_admin' && (
                      <button
                        onClick={() => onEliminar(admin._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Desactivar
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => onReactivar(admin._id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Reactivar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaAdmins;