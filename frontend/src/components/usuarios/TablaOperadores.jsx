import { Link } from 'react-router-dom';

const TablaOperadores = ({ operadores, onEliminar, onRecargar }) => {
  if (operadores.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No hay operadores registrados</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Operador
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sede
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vehículo Asignado
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
          {operadores.map((operador) => (
            <tr key={operador._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{operador.nombre}</div>
                  <div className="text-sm text-gray-500">@{operador.username}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {operador.sedeActual?.nombre || (
                    <span className="text-gray-400">Sin sede</span>
                  )}
                </div>
                {operador.sedeActual?.ciudad && (
                  <div className="text-xs text-gray-500">{operador.sedeActual.ciudad}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {operador.vehiculoAsignado ? (
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {operador.vehiculoAsignado.numeroEconomico}
                    </div>
                    <div className="text-xs text-gray-500">
                      {operador.vehiculoAsignado.placa} • {operador.vehiculoAsignado.tipo}
                    </div>
                  </div>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                    Sin asignar
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {operador.activo ? (
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
                    to={`/usuarios/editar-operador/${operador._id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </Link>
                  {operador.activo ? (
                    <button
                      onClick={() => onEliminar(operador._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      onClick={() => onRecargar()}
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

export default TablaOperadores;