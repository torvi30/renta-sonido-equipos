import React, { useState } from 'react';
import { 
  Calendar, Clock, CheckCircle2, Sparkles, ChevronLeft, 
  ChevronRight, X, Plus, Minus, ArrowRight, Zap, Flame, PartyPopper
} from 'lucide-react';
import { formatDateFriendly } from '../../services/storageService';

export default function DateBanner({ 
  selectedDate, 
  setSelectedDate, 
  rentalDays = 1, 
  setRentalDays 
}) {
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Fecha para navegar en el modal de calendario
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split('-');
      return new Date(Number(y), Number(m) - 1, 1);
    }
    return new Date();
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Calcular fecha de finalización
  const calculateEndDate = (startDate, days) => {
    if (!startDate) return '';
    const d = new Date(startDate + 'T00:00:00');
    d.setDate(d.getDate() + (days - 1));
    return d.toISOString().split('T')[0];
  };

  const endDate = calculateEndDate(selectedDate, rentalDays);

  // Atajos rápidos de fecha
  const getQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const getNextSaturday = () => {
    const d = new Date();
    const day = d.getDay(); // 0 Dom, 6 Sab
    const diff = (6 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  };

  const getNextNextSaturday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = ((6 - day + 7) % 7 || 7) + 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  };

  const handleSelectQuickDate = (dateStr) => {
    setSelectedDate(dateStr);
    const [y, m] = dateStr.split('-');
    setViewDate(new Date(Number(y), Number(m) - 1, 1));
  };

  // Stepper de días
  const handleDecreaseDays = () => {
    if (rentalDays > 1) {
      setRentalDays(rentalDays - 1);
    }
  };

  const handleIncreaseDays = () => {
    setRentalDays(rentalDays + 1);
  };

  // Navegación en el calendario visual
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  // Verifica si una fecha cae dentro del rango seleccionado
  const isDateInRange = (dateStr) => {
    if (!selectedDate || rentalDays <= 1) return false;
    return dateStr > selectedDate && dateStr <= endDate;
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#101728] to-slate-950 border border-amber-500/30 p-4 sm:p-6 shadow-2xl mb-8">
      
      {/* Decorative Glows */}
      <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        
        {/* Info Textual Principal */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Disponibilidad de Sonido en Vivo
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
            ¿Para qué fecha necesitas los equipos de sonido?
          </h2>

          <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm text-slate-300">
            <span>Mostrando stock para:</span>
            <strong className="text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
              {rentalDays === 1 
                ? formatDateFriendly(selectedDate)
                : `${formatDateFriendly(selectedDate)} hasta ${formatDateFriendly(endDate)} (${rentalDays} Días)`}
            </strong>
          </div>
        </div>

        {/* Barra de Controles Rápidos */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Botón Principal para Abrir Calendario */}
          <button
            onClick={() => setIsCalendarModalOpen(true)}
            className="flex items-center gap-3 bg-slate-950/90 hover:bg-slate-900 border border-amber-500/40 hover:border-amber-400 px-4 py-3 rounded-2xl shadow-lg transition-all group active:scale-98 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Fecha del Evento
              </span>
              <span className="text-xs sm:text-sm font-black text-white block capitalize">
                {formatDateFriendly(selectedDate)}
              </span>
            </div>
            <span className="ml-auto text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              Cambiar 📅
            </span>
          </button>

          {/* Stepper Selector de Días de Alquiler */}
          <div className="flex items-center justify-between gap-3 bg-slate-950/90 border border-slate-800 px-3.5 py-2.5 rounded-2xl shadow-lg">
            <div className="flex flex-col min-w-[70px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                Duración
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-400">
                {rentalDays} {rentalDays === 1 ? 'Día' : 'Días'}
              </span>
            </div>

            {/* Botones de + y - para facilitar días */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={handleDecreaseDays}
                disabled={rentalDays <= 1}
                title="Disminuir días"
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-800 text-white flex items-center justify-center font-bold text-xs transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <input
                type="number"
                min="1"
                max="30"
                value={rentalDays}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1) {
                    setRentalDays(val);
                  }
                }}
                className="w-10 bg-transparent text-center font-black text-xs text-white focus:outline-none"
              />

              <button
                type="button"
                onClick={handleIncreaseDays}
                title="Aumentar días"
                className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-black flex items-center justify-center font-black text-xs transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Chips Rápidos de Duración Común */}
      <div className="relative z-10 mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
        <span className="text-[11px] font-bold text-slate-500 shrink-0">
          Duración rápida:
        </span>
        {[
          { days: 1, label: '1 Día (Fiesta)' },
          { days: 2, label: '2 Días (Fin de Semana)' },
          { days: 3, label: '3 Días (Puente)' },
          { days: 5, label: '5 Días' },
          { days: 7, label: '7 Días (Semana)' }
        ].map(item => (
          <button
            key={item.days}
            onClick={() => setRentalDays(item.days)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
              rentalDays === item.days
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* MODAL / DRAWER DE CALENDARIO VISUAL INTERACTIVO Y NOTORIO */}
      {/* ========================================================= */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0d121f] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header del Calendario */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Elige la Fecha de Tu Evento
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calcularemos la disponibilidad de sonido y combos en vivo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCalendarModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Atajos de Un Toque (Quick Chips) */}
            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Atajos:</span>
              <button
                onClick={() => handleSelectQuickDate(getQuickDate(0))}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1 shrink-0"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                Hoy
              </button>
              <button
                onClick={() => handleSelectQuickDate(getQuickDate(1))}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1 shrink-0"
              >
                <Flame className="w-3 h-3 text-rose-400" />
                Mañana
              </button>
              <button
                onClick={() => handleSelectQuickDate(getNextSaturday())}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0"
              >
                <PartyPopper className="w-3 h-3 text-amber-400" />
                Este Sábado
              </button>
              <button
                onClick={() => handleSelectQuickDate(getNextNextSaturday())}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1 shrink-0"
              >
                Próx. Sábado
              </button>
            </div>

            {/* Navegador de Mes */}
            <div className="p-4 flex items-center justify-between bg-[#0e1322]">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                title="Mes anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h4 className="text-base font-black text-white capitalize">
                {monthNames[viewMonth]} {viewYear}
              </h4>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                title="Mes siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Matriz de Días del Mes */}
            <div className="p-4 sm:p-5 pt-0">
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {daysOfWeek.map((d, i) => (
                  <div key={i} className={`text-xs font-black py-1.5 ${i === 0 || i === 6 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {/* Espacios vacíos */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10 sm:h-11 rounded-xl" />
                ))}

                {/* Días del mes */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayFormatted = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                  const monthFormatted = (viewMonth + 1) < 10 ? `0${viewMonth + 1}` : `${viewMonth + 1}`;
                  const dateStr = `${viewYear}-${monthFormatted}-${dayFormatted}`;
                  
                  const isPast = dateStr < todayStr;
                  const isToday = dateStr === todayStr;
                  const isStart = dateStr === selectedDate;
                  const isInRange = isDateInRange(dateStr);

                  return (
                    <button
                      key={dateStr}
                      disabled={isPast}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-10 sm:h-11 rounded-xl font-black text-xs sm:text-sm flex flex-col items-center justify-center transition-all relative ${
                        isPast
                          ? 'opacity-25 cursor-not-allowed text-slate-600'
                          : isStart
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-105 z-10 ring-2 ring-amber-300'
                          : isInRange
                          ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{dayNum}</span>
                      {isToday && !isStart && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 -mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selector de Duración Integrado */}
              <div className="mt-5 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-white block">
                    ¿Cuántos días durará el evento?
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Ajusta para alquileres de fin de semana o giras
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleDecreaseDays}
                    disabled={rentalDays <= 1}
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white flex items-center justify-center font-bold text-sm"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-14 text-center font-black text-sm text-amber-400">
                    {rentalDays} {rentalDays === 1 ? 'Día' : 'Días'}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncreaseDays}
                    className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer con Resumen y Confirmación */}
            <div className="p-4 border-t border-slate-800 bg-[#121828] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Resumen de Alquiler</span>
                <span className="font-bold text-white">
                  {formatDateFriendly(selectedDate)}
                  {rentalDays > 1 && ` → ${formatDateFriendly(endDate)}`}
                </span>
              </div>

              <button
                onClick={() => setIsCalendarModalOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <span>Confirmar y Ver Equipos Libres</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
