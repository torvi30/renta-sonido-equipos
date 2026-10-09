import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 flex-shrink-0" />
  };

  const bgStyles = {
    success: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50',
    warning: 'bg-amber-950/90 border-amber-500/40 text-amber-100 shadow-amber-950/50',
    info: 'bg-slate-900/95 border-cyan-500/40 text-cyan-100 shadow-cyan-950/50'
  };

  const type = toast.type || 'success';

  return (
    <div className="fixed top-5 right-5 z-50 animate-bounce" style={{ animationDuration: '0.4s', animationIterationCount: 1 }}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl ${bgStyles[type]}`}>
        {icons[type]}
        <div className="text-xs sm:text-sm font-bold pr-2">
          {toast.message}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
