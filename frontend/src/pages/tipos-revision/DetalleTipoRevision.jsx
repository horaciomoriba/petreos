// src/pages/tipos-revision/DetalleTipoRevision.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tipoRevisionService from '../../services/tipoRevisionService';
import { showToast } from '../../utils/toast';
import ConfirmModal from '../../components/common/ConfirmModal';

const DetalleTipoRevision = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tipoRevision, setTipoRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vista-previa');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadTipoRevision();
  }, [id]);

  const loadTipoRevision = async () => {
    try {
      setLoading(true);
      const data = await tipoRevisionService.getById(id);
      setTipoRevision(data);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al cargar tipo de revisión');
      navigate('/tipos-revision');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await tipoRevisionService.delete(id);
      showToast.success('Tipo de revisión desactivado');
      navigate('/tipos-revision');
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Error al desactivar');
    }
  };

  const handleToggleActivo = async () => {
    try {
      await tipoRevisionService.update(id, {
        activo: !tipoRevision.activo
      });
      showToast.success(`Tipo de revisión ${tipoRevision.activo ? 'desactivado' : 'activado'}`);
      loadTipoRevision();
    } catch (error) {
      showToast.error('Error al actualizar estado');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-sm font-medium text-gray-600 mt-4">Cargando tipo de revisión</p>
      </div>
    );
  }

  if (!tipoRevision) return null;

  const totalPreguntas = tipoRevision.secciones?.reduce((sum, sec) => sum + (sec.preguntas?.length || 0), 0) || 0;

  const getTipoVehiculoTexto = (tipo) => {
    const textos = {
      olla_revolvedora: 'Olla Revolvedora',
      planta_de_concreto: 'Planta de Concreto',
      cargador_frontal: 'Cargador Frontal',
      camioneta_pickup: 'Camioneta Pickup',
      grua: 'Grúa'
    };
    return textos[tipo] || tipo;
  };

  const tabs = [
    { id: 'vista-previa', name: 'Vista Previa', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
    { id: 'configuracion', name: 'Configuración', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/tipos-revision')}
          className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a tipos de revisión
        </button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">{tipoRevision.nombre}</h1>
            <p className="text-sm text-gray-600 mb-3">
              {getTipoVehiculoTexto(tipoRevision.tipo_vehiculo)} • {tipoRevision.frecuencia}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-0.5 rounded font-medium bg-gray-100 text-gray-700 border border-gray-200">
                Código: {tipoRevision.codigo}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-semibold border ${
                tipoRevision.activo 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {tipoRevision.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-2">
            {/* 🆕 BOTÓN EDITAR - NUEVO */}
            <button
              onClick={() => navigate(`/tipos-revision/${id}/editar`)}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>

            <button
              onClick={handleToggleActivo}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
            >
              {tipoRevision.activo ? 'Desactivar' : 'Activar'}
            </button>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all border border-red-200"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{tipoRevision.secciones?.length || 0}</p>
              <p className="text-xs text-gray-600">Secciones</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalPreguntas}</p>
              <p className="text-xs text-gray-600">Preguntas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              tipoRevision.revision_llantas?.activa ? 'bg-green-50' : 'bg-gray-100'
            }`}>
              <svg className={`w-5 h-5 ${tipoRevision.revision_llantas?.activa ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {tipoRevision.revision_llantas?.activa ? 'Sí' : 'No'}
              </p>
              <p className="text-xs text-gray-600">Revisión Llantas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              tipoRevision.requiere_licencia_vigente ? 'bg-orange-50' : 'bg-gray-100'
            }`}>
              <svg className={`w-5 h-5 ${tipoRevision.requiere_licencia_vigente ? 'text-orange-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {tipoRevision.requiere_licencia_vigente ? 'Sí' : 'No'}
              </p>
              <p className="text-xs text-gray-600">Licencia Requerida</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        
        {/* TAB: VISTA PREVIA (SIMPLIFICADO) */}
        {activeTab === 'vista-previa' && (
          <>
            {/* Secciones */}
            {tipoRevision.secciones?.map((seccion, sIndex) => (
              <div key={sIndex} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">{seccion.nombre}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {seccion.preguntas?.length || 0} pregunta(s)
                  </p>
                </div>

                {/* Preguntas (SIMPLIFICADO - solo lista) */}
                <div className="space-y-3">
                  {seccion.preguntas?.map((pregunta, pIndex) => (
                    <div key={pIndex} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs font-semibold text-gray-900 border border-gray-200">
                        {pregunta.numero}
                      </div>
                      <p className="text-sm text-gray-900 flex-1">{pregunta.texto}</p>
                    </div>
                  ))}
                </div>

                {/* 🆕 NUEVO - Mostrar configuración de comentarios */}
                {seccion.permite_comentarios && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">Comentarios habilitados</p>
                        <p className="text-xs text-gray-500 mt-0.5">{seccion.placeholder_comentarios}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Revisión de llantas (ACTUALIZADO) */}
            {tipoRevision.revision_llantas?.activa && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Revisión de Neumáticos</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Campos de inspección</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Presión medida (PSI) + Estado (Bien/Mal)</li>
                        <li>Profundidad del callo medida (mm) + Estado (Bien/Mal)</li>
                      </ul>
                      <p className="mt-2 text-xs">
                        El operador revisará cada llanta según la configuración del vehículo.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🆕 NUEVO - Mostrar configuración de comentarios */}
                {tipoRevision.revision_llantas.permite_comentarios && (
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-700">Comentarios habilitados</p>
                      <p className="text-xs text-gray-500 mt-0.5">{tipoRevision.revision_llantas.placeholder_comentarios}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* TAB: CONFIGURACIÓN (SIMPLIFICADO) */}
        {activeTab === 'configuracion' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-6">Configuración del Tipo de Revisión</h2>
            
            <div className="space-y-6">
              {/* Info básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Nombre</label>
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg">{tipoRevision.nombre}</div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Código</label>
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg font-mono">{tipoRevision.codigo}</div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Tipo de Vehículo</label>
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg capitalize">
                    {getTipoVehiculoTexto(tipoRevision.tipo_vehiculo)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Frecuencia</label>
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg capitalize">{tipoRevision.frecuencia}</div>
                </div>
              </div>

              {/* Configuración general */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Opciones Generales</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={tipoRevision.requiere_licencia_vigente}
                      disabled
                      className="w-4 h-4 text-gray-600 rounded"
                    />
                    <span className="text-sm text-gray-900">Requiere licencia vigente</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={tipoRevision.permite_comentarios}
                      disabled
                      className="w-4 h-4 text-gray-600 rounded"
                    />
                    <span className="text-sm text-gray-900">Permite comentarios generales</span>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Información del Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Creado:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(tipoRevision.createdAt).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-600">Última actualización:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(tipoRevision.updatedAt).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="¿Desactivar tipo de revisión?"
        message={`¿Estás seguro de que deseas desactivar "${tipoRevision.nombre}"? Podrás reactivarlo después.`}
        type="danger"
      />
    </div>
  );
};

export default DetalleTipoRevision;