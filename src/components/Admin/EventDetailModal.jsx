import React, { useState } from 'react';
import { 
  X, Calendar, MapPin, Phone, MessageCircle, DollarSign, 
  Cable, FileText, CheckCircle2, Clock, Truck, ShieldCheck, 
  ExternalLink, User, AlertTriangle, Sparkles, Navigation, 
  Copy, Check, Share2, Compass, Layers, ArrowRight, ShieldAlert,
  HelpCircle, ChevronRight
} from 'lucide-react';
import { formatCurrency, formatDateFriendly } from '../../services/storageService';

export default function EventDetailModal({ 
  isOpen, 
  onClose, 
  booking, 
  equipmentList = [],
  onOpenPayment,
  onOpenChecklist,
  onOpenReceipt,
  onOpenWhatsApp,
  onUpdateStatus
}) {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'equipment', 'finances'

  if (!isOpen || !booking) return null;

  const totalAmount = Number(booking.totalAmount || 0);
  const depositAmount = Number(booking.depositAmount || 0);
  const balanceDue = Number(booking.balanceDue || 0);
  const hasPendingBalance = balanceDue > 0 && booking.status !== 'Cancelado';
  const paymentPercentage = totalAmount > 0 
    ? Math.min(100, Math.max(0, Math.round((depositAmount / totalAmount) * 100))) 
    : 0;

  const cleanPhone = booking.clientPhone ? booking.clientPhone.replace(/\D/g, '') : '';
  const mapQuery = encodeURIComponent(booking.eventLocation || '');

  // Cálculo de tiempo restante / urgencia
  const getEventTimeStatus = () => {
    if (!booking.eventDate) return null;
    const today = new Date().toISOString().split('T')[0];
    if (booking.eventDate === today) {
      return { label: '🔥 ¡ES HOY!', style: 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' };
    }
    const todayDate = new Date(today);
    const eventDate = new Date(booking.eventDate);
    const diffTime = eventDate.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return { label: '⚡ Mañana', style: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    } else if (diffDays > 1 && diffDays <= 7) {
      return { label: `En ${diffDays} días`, style: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
    } else if (diffDays > 7) {
      return { label: `En ${diffDays} días`, style: 'bg-slate-800 text-slate-300 border-slate-700' };
    } else {
      return { label: `Concluido (${Math.abs(diffDays)}d atrás)`, style: 'bg-slate-900 text-slate-400 border-slate-800' };
    }
  };

  const timeStatus = getEventTimeStatus();

  // Consolidar todos los accesorios y cables que se necesitan para este evento
  const consolidatedAccessories = [];
  (booking.items || []).forEach(item => {
    const eq = equipmentList.find(e => e.id === item.equipmentId);
    if (eq && Array.isArray(eq.includes)) {
      eq.includes.forEach(inc => {
        consolidatedAccessories.push({
          item: inc,
          parentEquipment: eq.name,
          qty: item.quantity || 1
        });
      });
    }
  });

  // Copiar resumen de orden al portapapeles para enviar a técnicos / chofer
  const handleCopySummary = () => {
    const itemsText = (booking.items || [])
      .map(it => `• ${it.quantity}x ${it.name}`)
      .join('\n');

    const summaryText = `🔊 *FICHA TÉCNICA - ORDEN #${booking.id}*
👤 *Cliente:* ${booking.clientName}
📱 *Teléfono:* ${booking.clientPhone || 'No registrado'}
📅 *Fecha:* ${formatDateFriendly(booking.eventDate)}${booking.endDate && booking.endDate !== booking.eventDate ? ' al ' + formatDateFriendly(booking.endDate) : ''}
📍 *Lugar:* ${booking.eventLocation || 'Por definir'}
🗺️ *Maps:* https://www.google.com/maps/search/?api=1&query=${mapQuery}

🎛️ *EQUIPOS:*
${itemsText}

💰 *FINANZAS:*
Total: ${formatCurrency(totalAmount)}
Abonado: ${formatCurrency(depositAmount)} (${paymentPercentage}%)
Saldo a cobrar en sitio: ${formatCurrency(balanceDue)}
${booking.notes ? `\n📝 *Notas:* "${booking.notes}"` : ''}

_Generado desde Sound & Event Control PRO_`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pendiente':
        return (
          <span className="px-3 py-1 text-xs font-black rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5" /> Pendiente de Aprobación
          </span>
        );
      case 'Aprobado':
        return (
          <span className="px-3 py-1 text-xs font-black rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" /> Aprobado (Stock Bloqueado)
          </span>
        );
      case 'En Evento':
        return (
          <span className="px-3 py-1 text-xs font-black rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm animate-pulse">
            <Truck className="w-3.5 h-3.5" /> En Evento (En Sitio)
          </span>
        );
      case 'Finalizado':
        return (
          <span className="px-3 py-1 text-xs font-black rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" /> Finalizado / Devuelto
          </span>
        );
      case 'Cancelado':
        return (
          <span className="px-3 py-1 text-xs font-black rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" /> Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0d121f] border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[820px] min-h-[580px] my-auto">
        
        {/* HEADER VIP */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-[#111728] via-[#0f1422] to-[#141b2e] flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/10">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                    Expediente #{booking.id}
                  </h3>
                  {getStatusBadge(booking.status)}
                  {timeStatus && (
                    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold border ${timeStatus.style}`}>
                      {timeStatus.label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  Hoja de Ruta Técnica, Logística & Cobranza para DJ y Alquiler
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-all"
                title="Copiar resumen para WhatsApp del equipo"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Copiar Ficha</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'general'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>📍 Logística & Ruta</span>
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'equipment'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>🎛️ Rider & Cables</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                activeTab === 'equipment' ? 'bg-black/20 text-black' : 'bg-slate-800 text-slate-300'
              }`}>
                {(booking.items || []).length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('finances')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'finances'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>💰 Cobros & Abonos</span>
              {hasPendingBalance && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

          {/* TAB 1: LOGÍSTICA & RUTA */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              
              {/* Cliente y Botones Rápidos de Contacto */}
              <div className="bg-[#111728] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Cliente / Responsable del Evento
                    </span>
                    <h4 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2 mt-0.5">
                      <User className="w-4 h-4 text-cyan-400" />
                      {booking.clientName}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      {booking.clientPhone || 'Sin teléfono registrado'}
                    </p>
                  </div>

                  {/* Acciones de Contacto Rápido */}
                  <div className="flex flex-wrap items-center gap-2">
                    {booking.clientPhone && (
                      <a
                        href={`tel:${cleanPhone}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Llamar</span>
                      </a>
                    )}

                    {booking.clientPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp</span>
                      </a>
                    )}

                    <button
                      onClick={() => onOpenWhatsApp && onOpenWhatsApp(booking)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-colors"
                      title="Abrir plantillas pre-redactadas de cobro o confirmación"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Plantillas Pro</span>
                    </button>
                  </div>
                </div>

                {/* Fecha y Ubicación GPS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-1">
                  
                  {/* Fecha */}
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between min-h-[140px]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                        Fecha Programada
                      </span>
                      <p className="font-extrabold text-amber-400 text-base mt-1 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>{formatDateFriendly(booking.eventDate)}</span>
                      </p>
                      {booking.endDate && booking.endDate !== booking.eventDate && (
                        <p className="text-xs text-cyan-300 font-bold mt-1">
                          Hasta {formatDateFriendly(booking.endDate)}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-900 text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>Coordinar horario de montaje con el cliente</span>
                    </div>
                  </div>

                  {/* Locación y Navegación GPS */}
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between min-h-[140px]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                        Ubicación del Montaje
                      </span>
                      <p className="font-bold text-white text-xs sm:text-sm mt-1 flex items-start gap-1.5 line-clamp-2">
                        <MapPin className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>{booking.eventLocation || 'Dirección por definir con el cliente'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-900">
                      {booking.eventLocation ? (
                        <>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center py-1.5 px-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Google Maps</span>
                          </a>
                          <a
                            href={`https://waze.com/ul?q=${mapQuery}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center py-1.5 px-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Waze</span>
                          </a>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic py-1">Sin ubicación GPS</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Notas Especiales / Requerimientos de Tarima */}
                {booking.notes && (
                  <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl text-xs space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Notas & Observaciones del Cliente:
                    </span>
                    <p className="text-amber-100/90 italic pl-1 text-xs sm:text-sm">
                      "{booking.notes}"
                    </p>
                  </div>
                )}

              </div>

              {/* Resumen Express de Finanzas & Equipos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div 
                  onClick={() => setActiveTab('finances')}
                  className="bg-[#111728] hover:bg-[#151c30] p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between min-h-[130px] group shadow-sm"
                >
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span className="font-bold flex items-center gap-1.5 text-slate-300">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Estado Financiero
                    </span>
                    <span className="text-amber-400 font-extrabold group-hover:underline text-[11px]">
                      Ver cobros →
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Orden</span>
                      <span className="text-base font-black text-white">{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] block uppercase font-bold ${hasPendingBalance ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {hasPendingBalance ? 'Por Cobrar' : 'Pagado 100%'}
                      </span>
                      <span className={`text-base font-black ${hasPendingBalance ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {formatCurrency(balanceDue)}
                      </span>
                    </div>
                  </div>
                  {/* Mini Progress Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2.5 overflow-hidden border border-slate-800/80">
                    <div 
                      className={`h-full rounded-full ${paymentPercentage >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${paymentPercentage}%` }}
                    />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('equipment')}
                  className="bg-[#111728] hover:bg-[#151c30] p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col justify-between min-h-[130px] group shadow-sm"
                >
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span className="font-bold flex items-center gap-1.5 text-slate-300">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      Rider Técnico & Equipos
                    </span>
                    <span className="text-cyan-400 font-extrabold group-hover:underline text-[11px]">
                      Ver equipos →
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Carga de Sonido</span>
                    <span className="text-base font-black text-white">
                      {(booking.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0)} unidades asignadas
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-1">
                    {(booking.items || []).map(it => `${it.quantity}x ${it.name}`).join(', ') || 'Sin equipos asignados'}
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: RIDER TÉCNICO & EQUIPOS */}
          {activeTab === 'equipment' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Cable className="w-4 h-4 text-cyan-400" />
                    Equipos Comprometidos en esta Orden
                  </h4>
                  <p className="text-xs text-slate-400">
                    Verifica el inventario antes de salir de la bodega hacia el toque
                  </p>
                </div>

                <button
                  onClick={() => onOpenChecklist && onOpenChecklist(booking)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                    booking.checklistVerified 
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{booking.checklistVerified ? '✓ Checklist Verificado' : 'Checklist de Cables'}</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {(booking.items || []).map((it, idx) => {
                  const eq = equipmentList.find(e => e.id === itemEquipmentId(it));
                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-[#111728] border border-slate-800 text-xs gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {eq && eq.imageUrl ? (
                          <img
                            src={eq.imageUrl}
                            alt={it.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-slate-800 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500">
                            🔊
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-black text-white text-sm block truncate">
                            {it.quantity}x {it.name}
                          </span>
                          {eq && eq.category && (
                            <span className="text-[10px] text-amber-400/90 font-bold uppercase block">
                              {eq.category}
                            </span>
                          )}
                          {eq && Array.isArray(eq.includes) && eq.includes.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {eq.includes.map((inc, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                                  ✓ {inc}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right sm:flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 flex sm:block justify-between items-center">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold sm:hidden">Precio:</span>
                        <div>
                          <span className="font-extrabold text-white text-sm block">
                            {formatCurrency((it.price || 0) * (it.quantity || 1))}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {formatCurrency(it.price || 0)} c/u
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Consolidado de Accesorios y Cables */}
              {consolidatedAccessories.length > 0 && (
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Cable className="w-4 h-4 text-amber-400" />
                      Packing List de Cables y Accesorios Necesarios
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {consolidatedAccessories.length} ítems
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {consolidatedAccessories.map((acc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                        <span className="text-slate-200 font-semibold truncate">{acc.item}</span>
                        <span className="text-[10px] text-slate-500 ml-auto flex-shrink-0 truncate max-w-[100px]">({acc.parentEquipment})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: COBROS & ABONOS */}
          {activeTab === 'finances' && (
            <div className="space-y-4">
              
              <div className="bg-[#111728] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Resumen de Facturación
                    </span>
                    <h4 className="text-base font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Control de Abonos & Saldo
                    </h4>
                  </div>

                  <button
                    onClick={() => onOpenPayment && onOpenPayment(booking)}
                    className="text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 px-3.5 py-1.5 rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Registrar Abono</span>
                  </button>
                </div>

                {/* KPI Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-center">
                  <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex flex-col justify-center items-center min-h-[90px]">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Orden</span>
                    <span className="text-base sm:text-lg font-black text-white block mt-1 tracking-tight">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>

                  <div className="bg-slate-950/90 p-4 rounded-2xl border border-emerald-500/30 flex flex-col justify-center items-center min-h-[90px]">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">Abonado ({paymentPercentage}%)</span>
                    <span className="text-base sm:text-lg font-black text-emerald-400 block mt-1 tracking-tight">
                      {formatCurrency(depositAmount)}
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl border flex flex-col justify-center items-center min-h-[90px] ${
                    hasPendingBalance ? 'bg-amber-950/30 border-amber-500/40' : 'bg-slate-950/90 border-slate-800'
                  }`}>
                    <span className={`text-[10px] uppercase font-bold tracking-wider block ${hasPendingBalance ? 'text-amber-400' : 'text-slate-400'}`}>
                      Saldo por Cobrar
                    </span>
                    <span className={`text-base sm:text-lg font-black block mt-1 tracking-tight ${hasPendingBalance ? 'text-amber-400' : 'text-slate-300'}`}>
                      {formatCurrency(balanceDue)}
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Progreso de Pago:</span>
                    <span className={paymentPercentage >= 100 ? 'text-emerald-400' : 'text-amber-400'}>
                      {paymentPercentage}% Completado
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${paymentPercentage >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-emerald-500'}`}
                      style={{ width: `${paymentPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Payment Metadata */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500 font-semibold">Método registrado:</span>
                    <span className="font-extrabold text-white">{booking.paymentMethod || 'Pendiente por registrar'}</span>
                  </div>
                  {booking.paymentNotes && (
                    <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-900">
                      <span className="text-slate-500 font-semibold">Comprobante / Referencia:</span>
                      <span className="font-mono text-cyan-300 font-bold">{booking.paymentNotes}</span>
                    </div>
                  )}
                </div>

                {/* Recibo Voucher Button */}
                <div className="pt-2">
                  <button
                    onClick={() => onOpenReceipt && onOpenReceipt(booking)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Ver Recibo Oficial & Contrato de Alquiler</span>
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* FOOTER: WORKFLOW ACTIONS & STATUS CHANGES */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#111728] flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenReceipt && onOpenReceipt(booking)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Recibo / Contrato</span>
            </button>

            <button
              onClick={() => onOpenChecklist && onOpenChecklist(booking)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition-colors"
            >
              <Cable className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Cables</span>
            </button>
          </div>

          {/* Estado de Transición Rápida */}
          <div className="flex items-center gap-2">
            {booking.status === 'Pendiente' && (
              <button
                onClick={() => {
                  if (onUpdateStatus) onUpdateStatus(booking.id, 'Aprobado');
                  onClose();
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aprobar y Bloquear Stock</span>
              </button>
            )}

            {booking.status === 'Aprobado' && (
              <button
                onClick={() => {
                  if (onUpdateStatus) onUpdateStatus(booking.id, 'En Evento');
                  onClose();
                }}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>Despachar a Evento</span>
              </button>
            )}

            {booking.status === 'En Evento' && (
              <button
                onClick={() => {
                  if (onUpdateStatus) onUpdateStatus(booking.id, 'Finalizado');
                  onClose();
                }}
                className="bg-purple-500 hover:bg-purple-400 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Recibido / Liberar Stock</span>
              </button>
            )}

            {booking.status !== 'Cancelado' && booking.status !== 'Finalizado' && (
              <button
                onClick={() => {
                  if (confirm('¿Seguro que deseas cancelar esta orden y liberar su stock?')) {
                    if (onUpdateStatus) onUpdateStatus(booking.id, 'Cancelado');
                    onClose();
                  }
                }}
                className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Cancelar Orden
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

// Helper para extraer ID de equipo seguro
function itemEquipmentId(item) {
  return item.equipmentId || item.id;
}
