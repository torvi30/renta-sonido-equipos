import React, { useState } from 'react';
import { 
  Search, Filter, CheckCircle2, Clock, Truck, Check, 
  XCircle, DollarSign, MessageCircle, FileText, Cable, AlertTriangle, 
  ShieldCheck, Eye, Sparkles 
} from 'lucide-react';
import { formatCurrency, formatDateFriendly } from '../../services/storageService';
import WhatsAppTemplatesModal from './WhatsAppTemplatesModal';
import EventDetailModal from './EventDetailModal';

export default function OrdersInbox({
  bookings = [],
  equipmentList = [],
  onUpdateStatus,
  onOpenPayment,
  onOpenChecklist,
  onOpenReceipt
}) {
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWhatsAppBooking, setActiveWhatsAppBooking] = useState(null);
  const [detailBooking, setDetailBooking] = useState(null);

  const statuses = ['Todos', 'Pendiente', 'Aprobado', 'En Evento', 'Finalizado', 'Cancelado'];

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filterStatus === 'Todos' || b.status === filterStatus;
    const matchesSearch = 
      b.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.clientPhone && b.clientPhone.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pendiente':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">⏳ Pendiente</span>;
      case 'Aprobado':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🔒 Aprobado (Stock Bloqueado)</span>;
      case 'En Evento':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">🚚 En Evento</span>;
      case 'Finalizado':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">✓ Devuelto / Finalizado</span>;
      case 'Cancelado':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">✕ Cancelado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111622] p-4 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, ID (#1024) o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === st
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-[#111622] rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">No se encontraron órdenes con estos filtros.</p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const hasPendingBalance = (booking.balanceDue || 0) > 0 && booking.status !== 'Cancelado';

            return (
              <div
                key={booking.id}
                className="bg-[#111622] rounded-2xl border border-slate-800/90 hover:border-slate-700 transition-all p-4 sm:p-5 shadow-lg space-y-4"
              >
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-extrabold text-white text-base">
                      #{booking.id}
                    </span>
                    {getStatusBadge(booking.status)}
                    {hasPendingBalance && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        Debe saldo: {formatCurrency(booking.balanceDue)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDetailBooking(booking)}
                      className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      title="Ver expediente técnico y logístico completo"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Expediente PRO</span>
                    </button>

                    <button
                      onClick={() => setActiveWhatsAppBooking(booking)}
                      className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                      title="Enviar mensaje o recordatorio por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>

                    <button
                      onClick={() => onOpenReceipt(booking)}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Recibo</span>
                    </button>
                  </div>

                </div>

                {/* Details Grid (Clickable to open dossier) */}
                <div 
                  onClick={() => setDetailBooking(booking)}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs cursor-pointer hover:bg-slate-900/30 p-2 -mx-2 rounded-xl transition-colors group"
                  title="Haz clic para ver la ficha completa"
                >
                  {/* Client Info */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Cliente:</span>
                    <p className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                      {booking.clientName}
                    </p>
                    <p className="text-slate-400">{booking.clientPhone}</p>
                    <p className="text-slate-400 mt-1">📍 {booking.eventLocation || 'Por definir'}</p>
                  </div>

                  {/* Date and Items */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Fecha del Evento:</span>
                    <p className="font-bold text-amber-400 text-sm">{formatDateFriendly(booking.eventDate)}</p>
                    <div className="mt-1 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Equipos:</span>
                      {booking.items.map((it, i) => (
                        <p key={i} className="text-slate-300 truncate">
                          • {it.quantity}x {it.name}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between text-slate-400">
                        <span>Total:</span>
                        <span className="font-bold text-white">{formatCurrency(booking.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 mt-1">
                        <span>Abonado:</span>
                        <span className="font-bold">{formatCurrency(booking.depositAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between text-amber-400 mt-1 font-bold pt-1 border-t border-slate-800">
                        <span>Saldo:</span>
                        <span>{formatCurrency(booking.balanceDue || 0)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenPayment(booking)}
                      className="mt-2.5 w-full bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-bold py-1.5 px-2 rounded-lg border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Gestionar Abonos</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Workflow Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenChecklist(booking)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                        booking.checklistVerified
                          ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Cable className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{booking.checklistVerified ? '✓ Cables Verificados' : 'Revisar Checklist de Cables'}</span>
                    </button>
                  </div>

                  {/* State Action Transitions */}
                  <div className="flex items-center gap-2">
                    {booking.status === 'Pendiente' && (
                      <button
                        onClick={() => onUpdateStatus(booking.id, 'Aprobado')}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-3.5 py-1.5 rounded-xl text-xs shadow-md shadow-emerald-500/20"
                      >
                        🔒 Aprobar y Bloquear Stock
                      </button>
                    )}

                    {booking.status === 'Aprobado' && (
                      <button
                        onClick={() => onUpdateStatus(booking.id, 'En Evento')}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold px-3.5 py-1.5 rounded-xl text-xs shadow-md shadow-cyan-500/20"
                      >
                        🚚 Despachar a Evento
                      </button>
                    )}

                    {booking.status === 'En Evento' && (
                      <button
                        onClick={() => onUpdateStatus(booking.id, 'Finalizado')}
                        className="bg-purple-500 hover:bg-purple-400 text-white font-extrabold px-3.5 py-1.5 rounded-xl text-xs shadow-md shadow-purple-500/20"
                      >
                        📦 Recibido / Liberar Stock
                      </button>
                    )}

                    {booking.status !== 'Cancelado' && booking.status !== 'Finalizado' && (
                      <button
                        onClick={() => {
                          if (confirm('¿Seguro que deseas cancelar esta orden y liberar su stock?')) {
                            onUpdateStatus(booking.id, 'Cancelado');
                          }
                        }}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* WhatsApp Smart Templates Modal */}
      <WhatsAppTemplatesModal
        isOpen={Boolean(activeWhatsAppBooking)}
        onClose={() => setActiveWhatsAppBooking(null)}
        booking={activeWhatsAppBooking}
      />

      {/* Event Detail PRO Modal */}
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
        onOpenWhatsApp={(b) => {
          setActiveWhatsAppBooking(b);
        }}
        onUpdateStatus={(id, st) => {
          if (onUpdateStatus) onUpdateStatus(id, st);
          setDetailBooking(prev => prev && prev.id === id ? { ...prev, status: st } : prev);
        }}
      />

    </div>
  );
}
