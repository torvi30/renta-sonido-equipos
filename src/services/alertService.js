import Swal from 'sweetalert2';

// Instancia configurada con tema oscuro luxury
const LuxurySwal = Swal.mixin({
  background: '#0d121f',
  color: '#f8fafc',
  backdrop: 'rgba(0, 0, 0, 0.85)',
  customClass: {
    popup: 'border border-amber-500/30 rounded-3xl shadow-2xl backdrop-blur-md',
    title: 'text-white font-black tracking-tight text-lg sm:text-xl',
    htmlContainer: 'text-slate-300 text-xs sm:text-sm font-medium',
    confirmButton: 'bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all mx-1.5',
    cancelButton: 'bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 border border-slate-700 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all mx-1.5',
    actions: 'gap-2 mt-4'
  },
  buttonsStyling: false
});

/**
 * Muestra un diálogo de confirmación elegante en modo oscuro
 * @returns Promise<boolean> - true si el usuario aceptó, false si canceló
 */
export const showConfirm = async ({
  title = '¿Estás seguro?',
  text = '',
  confirmButtonText = 'Sí, confirmar',
  cancelButtonText = 'Cancelar',
  icon = 'warning'
}) => {
  const result = await LuxurySwal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true
  });
  return result.isConfirmed;
};

/**
 * Muestra una alerta informativa o de éxito
 */
export const showAlert = async ({
  title = '',
  text = '',
  icon = 'info',
  confirmButtonText = 'Entendido'
}) => {
  return LuxurySwal.fire({
    title,
    text,
    icon,
    confirmButtonText
  });
};

export const showSuccess = (title, text = '') => {
  return LuxurySwal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'Genial'
  });
};

export const showError = (title, text = '') => {
  return LuxurySwal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Cerrar'
  });
};

export default LuxurySwal;
