import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-pulse" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
  };

  const bgStyles = {
    success: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/60',
    warning: 'bg-amber-950/90 border-amber-500/40 text-amber-100 shadow-amber-950/60',
    info: 'bg-slate-900/95 border-cyan-500/40 text-cyan-100 shadow-cyan-950/60',
    error: 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-950/60'
  };

  const type = toast.type || 'success';

  return (
    <div className="fixed top-5 right-5 z-50 transition-all duration-300 ease-out transform translate-y-0 opacity-100 max-w-sm w-full pointer-events-auto">
      <div className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${bgStyles[type] || bgStyles.info}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          {icons[type] || icons.info}
          <p className="text-xs sm:text-sm font-semibold tracking-wide truncate">
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors hover:bg-white/10 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
