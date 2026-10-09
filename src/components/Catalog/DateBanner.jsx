import React from 'react';
import { Calendar, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { formatDateFriendly } from '../../services/storageService';

export default function DateBanner({ 
  selectedDate, 
  setSelectedDate, 
  rentalDays = 1, 
  setRentalDays 
}) {
  const today = new Date().toISOString().split('T')[0];

  // Calcular fecha de finalización
  const calculateEndDate = (startDate, days) => {
    if (!startDate) return '';
    const d = new Date(startDate + 'T00:00:00');
    d.setDate(d.getDate() + (days - 1));
    return d.toISOString().split('T')[0];
  };

  const endDate = calculateEndDate(selectedDate, rentalDays);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#101626] to-slate-950 border border-slate-800 p-4 sm:p-6 shadow-xl mb-6">
      {/* Decorative Glow */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
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
            {rentalDays === 1 
              ? `Calculando stock libre para el ${formatDateFriendly(selectedDate)}`
              : `Alquiler de ${rentalDays} días: del ${formatDateFriendly(selectedDate)} al ${formatDateFriendly(endDate)}`}
          </p>
        </div>

        {/* Inputs Date and Duration */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          
          {/* Selector de Fecha Inicio */}
          <div className="flex items-center gap-2.5 bg-slate-950/90 p-2 sm:p-2.5 rounded-2xl border border-slate-700/80 shadow-inner flex-1 sm:flex-initial">
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
                className="bg-transparent text-white font-semibold text-xs sm:text-sm focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Selector de Duración (Días) */}
          <div className="flex items-center gap-2 bg-slate-950/90 p-2 sm:p-2.5 rounded-2xl border border-slate-700/80 shadow-inner">
            <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div className="flex flex-col">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Duración
              </label>
              <select
                value={rentalDays}
                onChange={(e) => setRentalDays(Number(e.target.value))}
                className="bg-transparent text-amber-400 font-extrabold text-xs sm:text-sm focus:outline-none cursor-pointer"
              >
                <option value={1} className="bg-slate-900 text-white">1 Día (Evento puntual)</option>
                <option value={2} className="bg-slate-900 text-white">2 Días (Fin de semana)</option>
                <option value={3} className="bg-slate-900 text-white">3 Días (Puente festivo)</option>
                <option value={4} className="bg-slate-900 text-white">4 Días o más</option>
              </select>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
