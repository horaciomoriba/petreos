import toast from 'react-hot-toast';

// Toast helpers con estilos consistentes del sistema de diseño
export const showToast = {
  success: (message) => {
    toast.success(message, {
      duration: 3000,
    });
  },

  error: (message) => {
    toast.error(message, {
      duration: 4000,
    });
  },

  loading: (message) => {
    return toast.loading(message);
  },

  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Cargando...',
      success: messages.success || 'Completado',
      error: messages.error || 'Error',
    });
  },

  // Custom toast para casos especiales
  custom: (message, options = {}) => {
    toast(message, options);
  },

  // Dismiss toast específico o todos
  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};

export default showToast;