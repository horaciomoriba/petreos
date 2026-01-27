import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { areaService } from '../../services/areaService';
import { sedeService } from '../../services/sedeService';
import toast from 'react-hot-toast';

const Areas = () => {
  const [areas, setAreas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroSede, setFiltroSede] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [filtroSede, filtroActivo]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const filtros = {};
      if (filtroSede) filtros.sedeId = filtroSede;
      if (filtroActivo !== '') filtros.activo = filtroActivo;

      const [areasRes, sedesRes] = await Promise.all([
        areaService.getAll(filtros),
        sedeService.getAll()
      ]);

      setAreas(areasRes.data);
      setSedes(sedesRes.data);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
      toast.error('Error al cargar áreas');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de desactivar esta área?')) return;

    try {
      await areaService.delete(id);
      toast.success('Área desactivada exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al desactivar área');
    }
  };

  const limpiarFiltros = () => {
    setFiltroSede('');
    setFiltroActivo('');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Áreas</h1>
          <p className="text-gray-600 mt-1">Gestiona las áreas de cada sede</p>
        </div>
        <Link
          to="/areas/nueva"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          Nueva Área
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sede
            </label>
            <select
              value={filtroSede}
              onChange={(e) => setFiltroSede(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las sedes</option>
              {sedes.map((sede) => (
                <option key={sede._id} value={sede._id}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <button
            onClick={limpiarFiltros}
            className="mt-6 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : areas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No hay áreas registradas</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Área
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sede
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
              {areas.map((area) => (
                <tr key={area._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{area.nombre}</div>
                      {area.descripcion && (
                        <div className="text-sm text-gray-500">{area.descripcion}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{area.sede?.nombre}</div>
                    <div className="text-xs text-gray-500">{area.sede?.ciudad}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {area.activo ? (
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
                        to={`/areas/editar/${area._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleEliminar(area._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Areas;