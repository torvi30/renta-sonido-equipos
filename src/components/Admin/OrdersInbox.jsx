import { useState, useEffect } from 'react';
import { 
  Search, DollarSign, MessageCircle, FileText, Cable, AlertTriangle, 
  Eye, Wrench, X
} from 'lucide-react';
import { formatCurrency, formatDateFriendly } from '../../services/storageService';
import { showConfirm } from '../../services/alertService';
import WhatsAppTemplatesModal from './WhatsAppTemplatesModal';
import EventDetailModal from './EventDetailModal';

export default function OrdersInbox({
  bookings = [],
  equipmentList = [],
  currentRole = 'superadmin',
  onUpdateStatus,
  onOpenPayment,
  onOpenChecklist,
  onOpenReceipt,
  onSaveRepair,
  initialFilterStatus = 'Todos'
}) {
  const [filterStatus, setFilterStatus] = useState(initialFilterStatus);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialFilterStatus) {
      setFilterStatus(initialFilterStatus);
    }
  }, [initialFilterStatus]);
  const [activeWhatsAppBooking, setActiveWhatsAppBooking] = useState(null);
  const [detailBooking, setDetailBooking] = useState(null);
  
  // Estado para reporte de avería desde un evento
  const [damageModalBooking, setDamageModalBooking] = useState(null);
  const [reportEqId, setReportEqId] = useState('');
  const [reportQty, setReportQty] = useState(1);
  const [reportType, setReportType] = useState('Sonido / Driver');
  const [reportSeverity, setReportSeverity] = useState('Alta');
  const [reportDesc, setReportDesc] = useState('');
  const [reportChargeWarranty, setReportChargeWarranty] = useState(true);
  const [reportWarrantyAmount, setReportWarrantyAmount] = useState(0);

  // Manejar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (damageModalBooking) setDamageModalBooking(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [damageModalBooking]);

  const statuses = ['Todos', 'Por Cobrar', 'Pendiente', 'Aprobado', 'En Evento', 'Finalizado', 'Cancelado'];

  const filteredBookings = bookings.filter(b => {
    let matchesStatus = false;
    if (filterStatus === 'Todos') {
      matchesStatus = true;
    } else if (filterStatus === 'Por Cobrar') {
      matchesStatus = b.status !== 'Cancelado' && (b.balanceDue || 0) > 0;
    } else {
      matchesStatus = b.status === filterStatus;
    }

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
        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map(st => {
            const isPorCobrar = st === 'Por Cobrar';
            const countPorCobrar = bookings.filter(b => b.status !== 'Cancelado' && (b.balanceDue || 0) > 0).length;
            const countPendientes = bookings.filter(b => b.status === 'Pendiente').length;
            const isSelected = filterStatus === st;

            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? isPorCobrar
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : isPorCobrar
                      ? 'bg-amber-500/10 text-amber-400 hover:text-amber-300 border border-amber-500/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{isPorCobrar ? '💰 Por Cobrar' : st}</span>
                {isPorCobrar && countPorCobrar > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-black text-amber-400' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {countPorCobrar}
                  </span>
                )}
                {st === 'Pendiente' && countPendientes > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-black text-amber-400' : 'bg-red-500 text-white'
                  }`}>
                    {countPendientes}
                  </span>
                )}
              </button>
            );
          })}
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
                    {hasPendingBalance && currentRole !== 'staff' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        Debe saldo: {formatCurrency(booking.balanceDue)}
                      </span>
                    )}
                    {currentRole === 'staff' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                        📦 {(booking.items || []).length} Equipos Solicitados
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

                    {currentRole !== 'staff' && (
                      <button
                        onClick={() => onOpenReceipt(booking)}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="hidden sm:inline">Recibo</span>
                      </button>
                    )}
                  </div>

                </div>

                {/* Details Grid (Clickable to open dossier) */}
                <div 
                  onClick={() => setDetailBooking(booking)}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs cursor-pointer group"
                  title="Haz clic para ver la ficha técnica completa"
                >
                  {/* Columna 1: Cliente & Locación */}
                  <div className="bg-slate-950/60 group-hover:border-slate-700/80 p-3.5 rounded-xl border border-slate-800/60 flex flex-col justify-between min-h-[135px] transition-colors">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Cliente</span>
                      <p className="font-extrabold text-white text-sm group-hover:text-amber-400 transition-colors mt-0.5 truncate">
                        {booking.clientName}
                      </p>
                      <p className="text-slate-400 font-mono text-[11px] mt-0.5">{booking.clientPhone || 'Sin teléfono'}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-900 mt-2">
                      <p className="text-slate-400 text-[11px] flex items-center gap-1.5 truncate">
                        <span className="text-red-400 flex-shrink-0">📍</span>
                        <span className="truncate">{booking.eventLocation || 'Lugar por definir'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Columna 2: Fecha & Equipos */}
                  <div className="bg-slate-950/60 group-hover:border-slate-700/80 p-3.5 rounded-xl border border-slate-800/60 flex flex-col justify-between min-h-[135px] transition-colors">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fecha del Evento</span>
                        <span className="text-[10px] text-cyan-400 font-bold">{(booking.items || []).length} ítems</span>
                      </div>
                      <p className="font-extrabold text-amber-400 text-sm mt-0.5">
                        {formatDateFriendly(booking.eventDate)}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 mt-2">
                      <div className="max-h-[48px] overflow-y-auto no-scrollbar space-y-0.5">
                        {(booking.items || []).map((it, i) => (
                          <p key={i} className="text-slate-300 text-[11px] truncate flex items-center gap-1">
                            <span className="text-amber-500/70 font-mono font-bold">•</span>
                            <span className="font-semibold text-white">{it.quantity}x</span>
                            <span className="truncate">{it.name}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Columna 3: Resumen Financiero (Admin/SuperAdmin) o Logística & Salida (Staff) */}
                  {currentRole === 'staff' ? (
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between min-h-[135px]"
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Estado de Cables & Salida</span>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${
                            booking.checklistVerified 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            {booking.checklistVerified ? '✓ Cables Verificados' : '⚠️ Pendiente Alistar'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 truncate">
                          {booking.eventLocation ? `📍 ${booking.eventLocation}` : '📍 Ubicación por confirmar'}
                        </p>
                      </div>

                      <div className="flex gap-1.5 mt-2">
                        <button
                          onClick={() => onOpenChecklist(booking)}
                          className="flex-1 bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 font-bold py-1.5 px-2 rounded-lg border border-cyan-500/30 flex items-center justify-center gap-1 text-xs transition-colors"
                        >
                          <Cable className="w-3.5 h-3.5" />
                          <span>Ver Cables</span>
                        </button>
                        {booking.eventLocation && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.eventLocation)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 font-bold py-1.5 px-2.5 rounded-lg border border-emerald-500/30 flex items-center justify-center gap-1 text-xs transition-colors"
                            title="Abrir en Google Maps"
                          >
                            <span>GPS</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between min-h-[135px]"
                    >
                      <div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Total:</span>
                          <span className="font-extrabold text-white text-xs">{formatCurrency(booking.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400 mt-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Abonado:</span>
                          <span className="font-bold text-xs">{formatCurrency(booking.depositAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center text-amber-400 mt-1 font-bold pt-1 border-t border-slate-800/80">
                          <span className="text-[10px] uppercase font-bold">Saldo:</span>
                          <span className="font-black text-xs">{formatCurrency(booking.balanceDue || 0)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenPayment(booking)}
                        className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-bold py-1 px-2 rounded-lg border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors text-xs"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Gestionar Abonos</span>
                      </button>
                    </div>
                  )}
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

                    {/* Botón Reportar Daño / Avería del Evento */}
                    <button
                      onClick={() => {
                        setDamageModalBooking(booking);
                        setReportEqId(booking.items?.[0]?.equipmentId || booking.items?.[0]?.id || '');
                        setReportQty(1);
                        setReportDesc('');
                        setReportWarrantyAmount(0);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-colors"
                      title="Reportar equipo averiado o con daño en este evento"
                    >
                      <Wrench className="w-3.5 h-3.5 text-rose-400" />
                      <span className="hidden sm:inline">Reportar Daño</span>
                      <span className="sm:hidden">Daño</span>
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
                        onClick={async () => {
                          const confirmed = await showConfirm({
                            title: '¿Cancelar esta orden?',
                            text: 'Al cancelar la orden se liberará inmediatamente el stock comprometido.',
                            confirmButtonText: 'Sí, cancelar orden',
                            icon: 'warning'
                          });
                          if (confirmed) {
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

      {/* Modal Reporte Rápido de Avería desde Evento */}
      {damageModalBooking && (
        <div 
          onClick={() => setDamageModalBooking(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden"
          >
            
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828] flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Reportar Daño en Evento #{damageModalBooking.id}</h3>
                  <p className="text-xs text-slate-400">Cliente: {damageModalBooking.clientName}</p>
                </div>
              </div>
              <button onClick={() => setDamageModalBooking(null)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!onSaveRepair) return;
                const selectedItem = (damageModalBooking.items || []).find(it => (it.equipmentId || it.id) === reportEqId) || damageModalBooking.items?.[0];
                if (!selectedItem) return;

                const newRepair = {
                  id: `REP-${Math.floor(100 + Math.random() * 900)}`,
                  equipmentId: selectedItem.equipmentId || selectedItem.id,
                  equipmentName: selectedItem.name,
                  quantity: Number(reportQty) || 1,
                  reportedDate: new Date().toISOString().split('T')[0],
                  reportedBy: currentRole === 'staff' ? 'Técnico de Tarima & Bodega' : 'Encargado de Operaciones',
                  bookingId: damageModalBooking.id,
                  clientName: damageModalBooking.clientName,
                  clientPhone: damageModalBooking.clientPhone || '',
                  issueType: reportType,
                  severity: reportSeverity,
                  description: reportDesc.trim(),
                  status: 'Pendiente',
                  technicianAssigned: 'Técnico de Tarima & Bodega',
                  costSpareParts: 0,
                  sparePartsNotes: '',
                  solutionNotes: '',
                  repairedDate: '',
                  warrantyChargedToClient: reportChargeWarranty,
                  warrantyAmount: Number(reportWarrantyAmount) || 0,
                  createdAt: new Date().toISOString()
                };

                onSaveRepair(newRepair);
                setDamageModalBooking(null);
                setReportDesc('');
                setReportWarrantyAmount(0);
              }}
              className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs"
            >
              
              {/* Equipo averiado */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Equipo Afectado en este Evento *
                </label>
                <select
                  value={reportEqId}
                  onChange={(e) => setReportEqId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                >
                  {(damageModalBooking.items || []).map((it, i) => (
                    <option key={i} value={it.equipmentId || it.id}>
                      {it.name} (Alquilado: {it.quantity}x)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cantidad Dañada
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={reportQty}
                    onChange={(e) => setReportQty(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono text-center focus:border-amber-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Severidad
                  </label>
                  <select
                    value={reportSeverity}
                    onChange={(e) => setReportSeverity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                  >
                    <option value="Alta">🔴 Alta (Inoperativo)</option>
                    <option value="Media">🟡 Media (Falla Parcial)</option>
                    <option value="Baja">🟢 Baja (Menor)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo de Falla
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                >
                  <option value="Sonido / Driver">🔊 Sonido / Driver / Bobina quemada</option>
                  <option value="Eléctrico / Encendido">⚡ Eléctrico / Fuente / No enciende</option>
                  <option value="Cables / Conectores">🔌 Cables / Conector Speakon / XLR</option>
                  <option value="Estructural / Golpe">🔨 Estructural / Golpe / Plástico roto</option>
                  <option value="Luces / Motor">💡 Luces / Motor / Sensor / LED</option>
                  <option value="Líquidos / Humedad">💧 Líquidos derramados / Lluvia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Diagnóstico Preliminar de Recepción *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalla cómo llegó el equipo tras el evento..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Cobro al Cliente */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportChargeWarranty}
                    onChange={(e) => setReportChargeWarranty(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                  />
                  <span className="font-bold text-white text-xs">Cobrar Garantía / Reparación a {damageModalBooking.clientName}</span>
                </label>

                {reportChargeWarranty && (
                  <div className="pt-2">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Monto a Cobrar por Garantía (COP)
                    </label>
                    <input
                      type="number"
                      value={reportWarrantyAmount}
                      onChange={(e) => setReportWarrantyAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-400 font-mono font-bold outline-none"
                      placeholder="0"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3 rounded-xl text-xs shadow-lg shadow-rose-600/20 active:scale-[0.98] transition-all"
                >
                  Enviar a Taller & Bloquear del Stock
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
