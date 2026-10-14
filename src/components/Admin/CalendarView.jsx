import { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Eye, MapPin 
} from 'lucide-react';
import { formatCurrency, formatDateFriendly } from '../../services/storageService';
import EventDetailModal from './EventDetailModal';
import WhatsAppTemplatesModal from './WhatsAppTemplatesModal';

export default function CalendarView({ 
  bookings = [], 
  equipmentList = [],
  onOpenPayment,
  onOpenChecklist,
  onOpenReceipt,
  onUpdateStatus
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState(new Date().toISOString().split('T')[0]);
  const [detailBooking, setDetailBooking] = useState(null);
  const [whatsAppBooking, setWhatsAppBooking] = useState(null);

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
      if (b.status === 'Cancelado') return false;
      const start = b.eventDate;
      const end = b.endDate || b.eventDate;
      return dateStr >= start && dateStr <= end;
    });
  };

  // Reservas del día seleccionado
  const dayBookings = getBookingsForDay(selectedDayStr);

  // Calcular el inventario comprometido en la fecha seleccionada
  const equipmentStatusForDay = equipmentList.map(eq => {
    let rentedQty = 0;
    dayBookings.forEach(b => {
      if (b.status === 'Aprobado' || b.status === 'En Evento') {
        (b.items || []).forEach(it => {
          if ((it.equipmentId || it.id) === eq.id) {
            rentedQty += Number(it.quantity || 1);
          }
        });
      }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente':
        return {
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/30',
          text: 'text-amber-300',
          dot: 'bg-amber-400'
        };
      case 'Aprobado':
        return {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/30',
          text: 'text-emerald-300',
          dot: 'bg-emerald-400'
        };
      case 'En Evento':
        return {
          bg: 'bg-cyan-500/20',
          border: 'border-cyan-500/30',
          text: 'text-cyan-300',
          dot: 'bg-cyan-400'
        };
      case 'Finalizado':
        return {
          bg: 'bg-purple-500/20',
          border: 'border-purple-500/30',
          text: 'text-purple-300',
          dot: 'bg-purple-400'
        };
      default:
        return {
          bg: 'bg-slate-800',
          border: 'border-slate-700',
          text: 'text-slate-300',
          dot: 'bg-slate-400'
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Month Navigator Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111622] p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white capitalize">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-400">
              Toca cualquier evento en el calendario para abrir su expediente completo
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 flex-wrap">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setCurrentDate(now);
              setSelectedDayStr(now.toISOString().split('T')[0]);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-amber-400 border border-slate-800 transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => {
              const now = new Date();
              const day = now.getDay();
              const diff = (6 - day + 7) % 7 || 7;
              now.setDate(now.getDate() + diff);
              setCurrentDate(now);
              setSelectedDayStr(now.toISOString().split('T')[0]);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-300 border border-amber-500/30 transition-colors"
          >
            Fin de Semana 🎉
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Legend Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none px-2 py-1 text-[11px] text-slate-400">
        <span className="font-bold text-slate-500 shrink-0">Estados:</span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Aprobado / Stock Bloqueado</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>En Evento</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Pendiente</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Devuelto / Finalizado</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid (2 Cols on desktop) */}
        <div className="lg:col-span-2 bg-[#111622] p-3 sm:p-5 rounded-3xl border border-slate-800 shadow-xl">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysOfWeek.map((d, i) => (
              <div key={i} className={`text-xs font-black py-2 ${i === 0 || i === 6 ? 'text-amber-400' : 'text-slate-400'}`}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Espacios vacíos antes del primer día */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[64px] sm:min-h-[92px] rounded-2xl bg-slate-950/20 border border-transparent" />
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
                  className={`min-h-[70px] sm:min-h-[100px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                      : hasBookings
                      ? 'bg-slate-900/90 border-slate-700/80 hover:border-slate-500'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar inside day cell */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm font-black ${isSelected ? 'text-amber-400 font-black' : 'text-slate-200'}`}>
                      {dayNum}
                    </span>
                    {hasBookings && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse sm:hidden" />
                    )}
                  </div>

                  {/* MOBILE INDICATOR (Clean dots & count for narrow screens) */}
                  {hasBookings && (
                    <div className="sm:hidden flex items-center justify-center gap-1 mt-auto pt-1">
                      <span className="text-[10px] font-black bg-cyan-950/90 text-cyan-300 border border-cyan-500/30 px-1 py-0.2 rounded leading-none">
                        {activeBookings.length}
                      </span>
                    </div>
                  )}

                  {/* DESKTOP/TABLET EVENT PILLS: Click directly to open event detail! */}
                  <div className="hidden sm:flex sm:flex-col space-y-1 mt-1 flex-1 justify-end">
                    {activeBookings.slice(0, 2).map((b) => {
                      const colors = getStatusColor(b.status);
                      return (
                        <div
                          key={b.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDayStr(dateStr);
                            setDetailBooking(b);
                          }}
                          className={`px-1.5 py-0.5 rounded-lg border text-[10px] font-bold truncate transition-all cursor-pointer hover:scale-[1.02] flex items-center gap-1 shadow-sm ${colors.bg} ${colors.border} ${colors.text}`}
                          title={`Tocar para abrir: ${b.clientName} (#${b.id})`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                          <span className="truncate">{b.clientName}</span>
                        </div>
                      );
                    })}

                    {activeBookings.length > 2 && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayStr(dateStr);
                        }}
                        className="text-[9px] text-amber-400 font-extrabold text-center hover:underline"
                      >
                        +{activeBookings.length - 2} más...
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Selected Day Dossier & Real-Time Stock Checker */}
        <div className="bg-[#111622] p-4 sm:p-5 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            
            {/* Header del día */}
            <div className="border-b border-slate-800 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Logística para la fecha:
                </span>
                <h3 className="text-base sm:text-lg font-black text-amber-400 mt-0.5">
                  {formatDateFriendly(selectedDayStr)}
                </h3>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                {dayBookings.length} {dayBookings.length === 1 ? 'evento' : 'eventos'}
              </span>
            </div>

            {/* Eventos programados en este día */}
            <div className="mt-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                Eventos del Día (Toca para Abrir)
              </span>

              {dayBookings.length === 0 ? (
                <div className="text-center py-6 px-3 bg-slate-950/70 rounded-2xl border border-slate-800/80">
                  <p className="text-xs text-slate-400 italic">
                    No hay eventos activos programados para este día.
                  </p>
                  <p className="text-[11px] text-emerald-400 font-bold mt-1">
                    ✓ Todo el inventario está libre para cotizar.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {dayBookings.map(b => {
                    const colors = getStatusColor(b.status);
                    const hasPending = (b.balanceDue || 0) > 0 && b.status !== 'Cancelado';

                    return (
                      <div 
                        key={b.id} 
                        onClick={() => setDetailBooking(b)}
                        className="bg-slate-950/90 hover:bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 hover:border-amber-500/60 cursor-pointer transition-all shadow-md group space-y-2"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <span className="group-hover:text-amber-400 transition-colors font-black text-white text-xs sm:text-sm block truncate">
                              {b.clientName}
                            </span>
                            <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                              <span className="truncate">{b.eventLocation || 'Lugar por definir'}</span>
                            </p>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border flex-shrink-0 ${colors.bg} ${colors.border} ${colors.text}`}>
                            {b.status}
                          </span>
                        </div>

                        {/* Financial summary on card */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Total:</span>
                            <span className="font-extrabold text-white">
                              {formatCurrency(b.totalAmount)}
                            </span>
                          </div>

                          {hasPending ? (
                            <div className="text-right">
                              <span className="text-[10px] text-amber-500 block uppercase font-bold">Debe:</span>
                              <span className="font-extrabold text-amber-400">
                                {formatCurrency(b.balanceDue)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                              ✓ 100% Pagado
                            </span>
                          )}
                        </div>

                        {/* Call to action button */}
                        <div className="w-full py-1.5 px-3 rounded-xl bg-slate-900 group-hover:bg-amber-500 group-hover:text-black text-amber-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-800 group-hover:border-amber-500">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Expediente Completo →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Anti-Cachos Real-Time Stock Checker for this Day */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Stock Disponible en esta Fecha
                </span>
                <span className="text-[10px] text-cyan-400 font-black">En Vivo</span>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {equipmentStatusForDay.map(eq => (
                  <div
                    key={eq.id}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                      eq.isSoldOut
                        ? 'bg-red-950/20 border-red-500/40 text-red-300'
                        : eq.isLowStock
                        ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                        : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <span className="truncate max-w-[170px] font-medium">{eq.name}</span>
                    <span className="font-black text-[11px] flex-shrink-0">
                      {eq.remaining} / {eq.totalStock} {eq.isSoldOut ? '(AGOTADO)' : 'Libres'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="bg-slate-950/90 p-3 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400">
            <p className="flex items-center gap-1.5 font-medium">
              <span>💡</span>
              <span><strong>Tip:</strong> Puedes tocar cualquier evento en el calendario para gestionar abonos, checklist de cables y recibo.</span>
            </p>
          </div>

        </div>

      </div>

      {/* Modal Detallado de Evento / Hoja de Ruta PRO */}
      <EventDetailModal
        isOpen={Boolean(detailBooking)}
        onClose={() => setDetailBooking(null)}
        booking={detailBooking}
        equipmentList={equipmentList}
        onOpenPayment={(b) => {
          setDetailBooking(null);
          if (onOpenPayment) onOpenPayment(b);
        }}
        onOpenChecklist={(b) => {
          setDetailBooking(null);
          if (onOpenChecklist) onOpenChecklist(b);
        }}
        onOpenReceipt={(b) => {
          setDetailBooking(null);
          if (onOpenReceipt) onOpenReceipt(b);
        }}
        onOpenWhatsApp={(b) => setWhatsAppBooking(b)}
        onUpdateStatus={(id, st) => {
          if (onUpdateStatus) onUpdateStatus(id, st);
          // Actualizar el booking actual en el modal si sigue abierto
          setDetailBooking(prev => prev && prev.id === id ? { ...prev, status: st } : prev);
        }}
      />

      {/* WhatsApp Smart Templates Modal */}
      <WhatsAppTemplatesModal
        isOpen={Boolean(whatsAppBooking)}
        onClose={() => setWhatsAppBooking(null)}
        booking={whatsAppBooking}
      />

    </div>
  );
}
