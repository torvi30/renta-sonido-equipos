import React from 'react';
import { Calendar, CheckCircle2, Clock, Info } from 'lucide-react';
import { formatDateFriendly } from '../../services/storageService';

export default function DateBanner({ selectedDate, setSelectedDate }) {
  // Fecha mínima: hoy
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-4 sm:p-6 shadow-xl mb-6">
      {/* Glow decorative background */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Disponibilidad en Vivo
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            ¿Para qué fecha necesitas los equipos de sonido?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            El sistema bloquea inventario y te muestra únicamente lo disponible para ese día.
          </p>
        </div>

        {/* Input Selector de Fecha */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-2 sm:p-2.5 rounded-xl border border-slate-700/80 shadow-inner">
          <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Fecha del Evento
            </label>
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white font-semibold text-sm sm:text-base focus:outline-none cursor-pointer"
            />
          </div>
          <div className="border-l border-slate-800 pl-3 pr-1 text-right hidden sm:block">
            <span className="text-xs font-medium text-amber-300/90 block">
              {formatDateFriendly(selectedDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
