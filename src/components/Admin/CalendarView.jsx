import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  AlertCircle, CheckCircle2, Clock, ShieldAlert, Sparkles 
} from 'lucide-react';
import { formatCurrency, formatDateFriendly } from '../../services/storageService';

export default function CalendarView({ bookings, equipmentList }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState(new Date().toISOString().split('T')[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Primer día del mes y número de días
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Construir mapa de reservas por día
  const getBookingsForDay = (dateStr) => {
    return bookings.filter(b => {
      if (b.status !== 'Aprobado' && b.status !== 'En Evento') return false;
      const start = b.eventDate;
      const end = b.endDate || b.eventDate;
      return dateStr >= start && dateStr <= end;
    });
  };

  // Calcular el inventario comprometido en la fecha seleccionada
  const dayBookings = getBookingsForDay(selectedDayStr);

  const equipmentStatusForDay = equipmentList.map(eq => {
    let rentedQty = 0;
    dayBookings.forEach(b => {
      b.items.forEach(it => {
        if (it.equipmentId === eq.id) {
          rentedQty += Number(it.quantity || 1);
        }
      });
    });
    const remaining = Math.max(0, eq.totalStock - rentedQty);
    return {
      ...eq,
      rentedQty,
      remaining,
      isSoldOut: remaining === 0,
      isLowStock: remaining > 0 && remaining < eq.totalStock
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Month Navigator */}
      <div className="flex items-center justify-between bg-[#111622] p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-extrabold text-white">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDayStr(new Date().toISOString().split('T')[0]);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-amber-400 border border-slate-800"
          >
            Hoy
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid (2 Cols on lg) */}
        <div className="lg:col-span-2 bg-[#111622] p-4 sm:p-5 rounded-3xl border border-slate-800">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysOfWeek.map((d, i) => (
              <div key={i} className={`text-xs font-bold py-1.5 ${i === 0 || i === 6 ? 'text-amber-400' : 'text-slate-400'}`}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Espacios vacíos antes del primer día */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square rounded-xl bg-slate-900/30 opacity-20" />
            ))}

            {/* Días del mes */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayFormatted = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
              const monthFormatted = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
              const dateStr = `${year}-${monthFormatted}-${dayFormatted}`;
              const isSelected = selectedDayStr === dateStr;

              const activeBookings = getBookingsForDay(dateStr);
              const hasBookings = activeBookings.length > 0;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDayStr(dateStr)}
                  className={`aspect-square sm:aspect-auto sm:min-h-[74px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10'
                      : hasBookings
                      ? 'bg-slate-900/90 border-slate-700 hover:border-slate-500'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm font-extrabold ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                      {dayNum}
                    </span>
                    {hasBookings && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>

                  {hasBookings && (
                    <div className="hidden sm:block">
                      <span className="text-[10px] font-extrabold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded-md truncate block">
                        {activeBookings.length} {activeBookings.length === 1 ? 'Evento' : 'Eventos'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Detail & Anti-Cachos Stock Checker */}
        <div className="bg-[#111622] p-4 sm:p-5 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Logística para el:
              </span>
              <h3 className="text-base font-extrabold text-amber-400 mt-0.5">
                {formatDateFriendly(selectedDayStr)}
              </h3>
            </div>

            {/* Eventos en este día */}
            <div className="mt-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Eventos Programados ({dayBookings.length})
              </span>
              {dayBookings.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  No hay eventos activos programados para este día. ¡Todo el inventario está libre!
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {dayBookings.map(b => (
                    <div key={b.id} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                      <div className="flex justify-between font-bold text-white">
                        <span>{b.clientName}</span>
                        <span className="text-amber-400">#{b.id}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">📍 {b.eventLocation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Anti-Cachos Inventory Status for this specific day */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Disponibilidad de Equipos
                </span>
                <span className="text-[10px] text-cyan-400 font-bold">Tiempo Real</span>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {equipmentStatusForDay.map(eq => (
                  <div
                    key={eq.id}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                      eq.isSoldOut
                        ? 'bg-red-950/20 border-red-500/40 text-red-300'
                        : eq.isLowStock
                        ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="truncate max-w-[170px] font-medium">{eq.name}</span>
                    <span className="font-extrabold text-[11px]">
                      {eq.remaining} / {eq.totalStock} {eq.isSoldOut ? '(AGOTADO)' : 'Libres'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
            <p>💡 <em>Tip Anti-Cruces:</em> Si una solicitud entra para este día con equipos agotados, el sistema no te dejará aprobarla por error.</p>
          </div>

        </div>

      </div>

    </div>
  );
}
