import { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { getStoredSettings } from '../../services/storageService';

export default function AdminAuthGuard({ onUnlock, onCancel }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const settings = getStoredSettings();

  const handleKeyPress = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const verifyPin = (candidate) => {
    // 1. Super Admin (Control Total)
    if (candidate === (settings.adminPin || '1234')) {
      onUnlock({ role: 'superadmin', roleLabel: 'Super Admin', name: 'Dueño / Master' });
      return;
    }
    // 2. Admin Operativo (Encargado)
    if (candidate === (settings.managerPin || '2020')) {
      onUnlock({ role: 'admin', roleLabel: 'Admin Operativo', name: 'Encargado de Operaciones' });
      return;
    }
    // 3. Staff / Técnico (Tarima & Bodega)
    if (candidate === (settings.staffPin || '3030')) {
      onUnlock({ role: 'staff', roleLabel: 'Staff Técnico', name: 'Técnico de Tarima' });
      return;
    }
    // 4. Buscar en lista de trabajadores si existe alguno con PIN personalizado
    const matchedWorker = (settings.workers || []).find(w => w.pin === candidate);
    if (matchedWorker) {
      onUnlock({
        role: matchedWorker.role || 'staff',
        roleLabel: matchedWorker.role === 'superadmin' ? 'Super Admin' : matchedWorker.role === 'admin' ? 'Admin' : 'Staff Técnico',
        name: matchedWorker.name
      });
      return;
    }

    setError(true);
    setTimeout(() => {
      setPin('');
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#0f1422] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
        
        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Acceso al Sistema
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Ingresa tu PIN de 4 dígitos
          </p>
        </div>

        {/* PIN Dots Display */}
        <div className="flex justify-center items-center gap-3 py-1">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  error
                    ? 'border-red-500 bg-red-500 animate-bounce'
                    : isFilled
                    ? 'border-amber-400 bg-amber-400 shadow-md shadow-amber-400/50 scale-110'
                    : 'border-slate-700 bg-slate-900'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-bold text-red-400 animate-pulse">
            PIN no reconocido. Intenta nuevamente.
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 pt-1 max-w-[240px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(String(num))}
              className="h-13 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-amber-500 active:text-black text-white font-extrabold text-xl border border-slate-800 transition-all flex items-center justify-center shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="h-13 py-3 rounded-2xl bg-slate-950 text-slate-400 hover:text-white text-xs font-bold border border-slate-800 transition-all flex items-center justify-center"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-13 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-amber-500 active:text-black text-white font-extrabold text-xl border border-slate-800 transition-all flex items-center justify-center shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-13 py-3 rounded-2xl bg-slate-950 text-slate-400 hover:text-white text-xs font-bold border border-slate-800 transition-all flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        {/* Return to Public Catalog */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-amber-400 font-semibold transition-colors"
          >
            ← Volver a la Tienda Pública
          </button>
        </div>

      </div>
    </div>
  );
}
