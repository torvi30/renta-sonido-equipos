import React, { useState, useEffect, memo } from 'react';
import { 
  Calendar, Clock, ShoppingBag, Trash2, Plus, Minus, 
  ChevronLeft, ChevronRight, X, MessageSquare, Volume2
} from 'lucide-react';
import { formatCurrency, formatDateFriendly } from '../../services/storageService';

function LiveQuoteSidebar({
  selectedDate,
  setSelectedDate,
  rentalDays = 1,
  setRentalDays,
  rentalMode = 'days',
  setRentalMode,
  rentalHours = 4,
  setRentalHours,
  eventStartTime = '20:00',
  setEventStartTime,
  cart = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCartModal
}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Fecha para navegar en el popup de calendario
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split('-');
      return new Date(Number(y), Number(m) - 1, 1);
    }
    return new Date();
  });

  // Cerrar popup de calendario con Escape
  useEffect(() => {
    if (!isCalendarOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsCalendarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCalendarOpen]);

  // Cálculos de fecha de fin
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
    const day = d.getDay();
    const diff = (6 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  };

  const handleSelectQuickDate = (dateStr) => {
    setSelectedDate(dateStr);
    const [y, m] = dateStr.split('-');
    setViewDate(new Date(Number(y), Number(m) - 1, 1));
  };

  // Steppers
  const handleDecreaseDays = () => {
    if (rentalDays > 1) setRentalDays(rentalDays - 1);
  };

  const handleIncreaseDays = () => {
    setRentalDays(rentalDays + 1);
  };

  const handleDecreaseHours = () => {
    if (rentalHours > 1) setRentalHours(rentalHours - 1);
  };

  const handleIncreaseHours = () => {
    setRentalHours(rentalHours + 1);
  };

  // Cálculos de Totales en Tiempo Real
  const itemsTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const totalAmount = rentalMode === 'hours' ? itemsTotal : itemsTotal * rentalDays;
  const depositAmount = totalAmount * 0.5;
  const cartTotalItems = cart.reduce((sum, it) => sum + it.quantity, 0);

  // Días y nombres del mes para el mini-calendario popup
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Lunes = 0

  const prevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewYear, viewMonth + 1, 1));

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-[#111728] via-[#0d1322] to-[#090d16] border border-amber-500/30 p-4 sm:p-5 shadow-2xl shadow-black/80 space-y-4">
      
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* HEADER: COTIZADOR EN VIVO */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <span>Tu Cotización en Vivo</span>
            </h3>
            <span className="text-[10px] text-slate-400 block">
              Precios y disponibilidad al instante
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>En vivo</span>
        </span>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 1: MODALIDAD & FECHA DEL EVENTO (UNIFICADA) */}
      {/* ============================================================== */}
      <div className="relative z-10 space-y-3 bg-[#0a0e1a]/90 p-3.5 rounded-2xl border border-slate-800/80">
        
        {/* Toggle de Modalidad: Días vs Horas */}
        <div className="flex items-center justify-between bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setRentalMode('days')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              rentalMode === 'days'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Alquiler x Días</span>
          </button>

          <button
            type="button"
            onClick={() => setRentalMode('hours')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              rentalMode === 'hours'
                ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Show x Horas</span>
          </button>
        </div>

        {/* Trigger de Selector de Fecha */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
            Fecha del Evento:
          </label>
          <button
            type="button"
            onClick={() => setIsCalendarOpen(true)}
            className="w-full flex items-center justify-between gap-2 bg-slate-900 hover:bg-slate-800/90 border border-slate-700/80 hover:border-amber-500/50 p-2.5 rounded-xl transition-all group text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-extrabold text-white truncate">
                {formatDateFriendly(selectedDate)}
              </span>
            </div>
            <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 shrink-0">
              Cambiar 📅
            </span>
          </button>
        </div>

        {/* Controles de Duración según Modalidad */}
        {rentalMode === 'hours' ? (
          /* MODO HORAS */
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Duración del Show:</span>
                <span className="text-[10px] text-slate-400">DJ / Sonido continuo</span>
              </div>

              {/* Stepper Horas */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={handleDecreaseHours}
                  disabled={rentalHours <= 1}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white flex items-center justify-center font-bold text-xs"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center font-black text-xs text-cyan-300">
                  {rentalHours}h
                </span>
                <button
                  type="button"
                  onClick={handleIncreaseHours}
                  disabled={rentalHours >= 24}
                  className="w-7 h-7 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center font-black text-xs shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Chips rápidos de horas */}
            <div className="flex items-center gap-1 pt-1 overflow-x-auto scrollbar-none">
              {[2, 4, 6, 8].map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setRentalHours(h)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-all ${
                    rentalHours === h
                      ? 'bg-cyan-400 text-black shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>

            {/* Selector de Horario de Inicio */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Hora de inicio aprox:</span>
              <input
                type="time"
                value={eventStartTime}
                onChange={(e) => setEventStartTime(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-cyan-300 font-bold text-xs px-2 py-0.5 rounded-lg focus:outline-none"
              />
            </div>
          </div>
        ) : (
          /* MODO DÍAS */
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Días de Alquiler:</span>
                <span className="text-[10px] text-slate-400">
                  {rentalDays > 1 ? `Hasta el ${formatDateFriendly(endDate)}` : 'Tarifa 24h completa'}
                </span>
              </div>

              {/* Stepper Días */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={handleDecreaseDays}
                  disabled={rentalDays <= 1}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white flex items-center justify-center font-bold text-xs"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-9 text-center font-black text-xs text-amber-400">
                  {rentalDays} {rentalDays === 1 ? 'Día' : 'Días'}
                </span>
                <button
                  type="button"
                  onClick={handleIncreaseDays}
                  className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center font-black text-xs shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Chips rápidos de días */}
            <div className="flex items-center gap-1 pt-1 overflow-x-auto scrollbar-none">
              {[
                { d: 1, label: '1 Día' },
                { d: 2, label: '2 Días' },
                { d: 3, label: '3 Días' },
                { d: 5, label: '5 Días' }
              ].map(item => (
                <button
                  key={item.d}
                  type="button"
                  onClick={() => setRentalDays(item.d)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-all ${
                    rentalDays === item.d
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 2: LISTA DE EQUIPOS EN EL CARRITO */}
      {/* ============================================================== */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400">
          <span>Equipos Seleccionados ({cartTotalItems})</span>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="text-[11px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Vaciar
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          /* Estado Vacío Invitador */
          <div className="text-center py-6 px-3 rounded-2xl bg-slate-950/70 border border-dashed border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-slate-500 flex items-center justify-center mx-auto border border-slate-800">
              <Volume2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-300">
              Tu cotización está vacía
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Haz clic en <strong>"+ Agregar"</strong> en cualquier equipo o combo del catálogo para verlo cotizado en vivo.
            </p>
          </div>
        ) : (
          /* Lista de Items con Scroll */
          <div className="max-h-52 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/90 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white truncate text-xs leading-tight">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                    <span>{formatCurrency(item.price)}</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-medium">
                      {item.unitLabel || (rentalMode === 'hours' ? `x ${rentalHours}h` : '/ día')}
                    </span>
                  </div>
                </div>

                {/* Controles de Cantidad */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-amber-400 text-[11px]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 3: TOTALES & ABONO REQUERIDO */}
      {/* ============================================================== */}
      <div className="relative z-10 bg-gradient-to-br from-slate-900 to-[#101728] p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
        {rentalMode === 'days' && rentalDays > 1 && (
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Subtotal x Día:</span>
            <span>{formatCurrency(itemsTotal)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-400 text-[11px]">
          <span>Modalidad:</span>
          <span className="text-cyan-400 font-bold">
            {rentalMode === 'hours' ? `⏱️ Evento de ${rentalHours} Horas` : `📅 ${rentalDays} ${rentalDays === 1 ? 'Día (24h)' : 'Días de Alquiler'}`}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm font-bold text-slate-200 pt-1 border-t border-slate-800/80">
          <span>Valor Total:</span>
          <span className="text-lg font-black text-amber-400">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold border-t border-slate-800/80 pt-1.5">
          <span>Abono requerido (50%):</span>
          <span className="font-black text-sm text-emerald-400">
            {formatCurrency(depositAmount)}
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 4: BOTÓN DE ACCIÓN (WHATSAPP DIRECTO O CHECKOUT) */}
      {/* ============================================================== */}
      <div className="relative z-10 pt-1">
        <button
          type="button"
          onClick={onOpenCartModal}
          disabled={cart.length === 0}
          className="w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-black font-black py-3 px-4 rounded-2xl shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-98"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Pedir Cotización x WhatsApp →</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* POPUP / MODAL DE CALENDARIO VISUAL INTERACTIVO */}
      {/* ============================================================== */}
      {isCalendarOpen && (
        <div 
          onClick={() => setIsCalendarOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#0d121f] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Header del Calendario */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#121828]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Selecciona la Fecha del Evento</h4>
                  <span className="text-[10px] text-slate-400">Verificamos stock en tiempo real</span>
                </div>
              </div>
              <button 
                onClick={() => setIsCalendarOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Atajos Rápidos */}
            <div className="p-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
              <button
                type="button"
                onClick={() => handleSelectQuickDate(getQuickDate(0))}
                className="px-2.5 py-1 rounded-lg font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => handleSelectQuickDate(getQuickDate(1))}
                className="px-2.5 py-1 rounded-lg font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0"
              >
                Mañana
              </button>
              <button
                type="button"
                onClick={() => handleSelectQuickDate(getNextSaturday())}
                className="px-2.5 py-1 rounded-lg font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0"
              >
                Este Sábado
              </button>
            </div>

            {/* Navegador de Mes */}
            <div className="p-3.5 flex items-center justify-between bg-[#0e1322]">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h5 className="font-extrabold text-white text-sm capitalize">
                {monthNames[viewMonth]} {viewYear}
              </h5>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Grid de Días */}
            <div className="p-4 bg-slate-950/80">
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-500 mb-2">
                <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateStr;
                  const isPast = dateStr < todayStr;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={isPast}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setIsCalendarOpen(false);
                      }}
                      className={`h-9 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                        isSelected
                          ? 'bg-amber-500 text-black font-black shadow-md shadow-amber-500/20 scale-105 ring-2 ring-amber-400'
                          : isPast
                          ? 'text-slate-600 opacity-30 cursor-not-allowed'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800/80 hover:border-amber-500/40'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer de Confirmación */}
            <div className="p-3 border-t border-slate-800 bg-[#121828] flex items-center justify-between">
              <span className="text-xs text-slate-300">
                Seleccionado: <strong className="text-amber-400">{formatDateFriendly(selectedDate)}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(false)}
                className="bg-amber-500 text-black font-black px-4 py-1.5 rounded-xl text-xs hover:bg-amber-400"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default memo(LiveQuoteSidebar);
