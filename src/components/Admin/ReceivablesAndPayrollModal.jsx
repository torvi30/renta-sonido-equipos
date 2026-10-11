import React, { useState, useEffect } from 'react';
import { 
  X, DollarSign, Users, Calendar, Phone, MapPin, 
  CheckCircle2, Clock, MessageSquare, Plus, Trash2, 
  Send, AlertCircle, ArrowUpRight, TrendingDown,
  ShieldCheck, Wrench, Sparkles, Filter, Search
} from 'lucide-react';
import { formatCurrency, formatDateFriendly } from '../../services/storageService';
import { showConfirm, showAlert, showError, showSuccess } from '../../services/alertService';

export default function ReceivablesAndPayrollModal({
  isOpen,
  onClose,
  bookings = [],
  payroll = [],
  workers = [],
  settings = {},
  onSavePayment,
  onSavePayroll,
  onDeletePayroll,
  onOpenEventDetail,
  onOpenPaymentModal,
  initialTab = 'receivables'
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'receivables' | 'payroll'

  // Manejar Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  const [searchReceivables, setSearchReceivables] = useState('');
  const [filterReceivables, setFilterReceivables] = useState('pending'); // 'pending' | 'all'
  
  // Estado para nuevo pago de nómina
  const [isAddingPayroll, setIsAddingPayroll] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState(workers[2]?.name || 'Técnico de Tarima & Bodega');
  const [newRole, setNewRole] = useState('Técnico de Sonido & Tarima');
  const [newBookingId, setNewBookingId] = useState('');
  const [newConcept, setNewConcept] = useState('Turno de montaje, operación y desmontaje');
  const [newAmount, setNewAmount] = useState('80000');
  const [newStatus, setNewStatus] = useState('Por Pagar'); // 'Por Pagar' | 'Pagado'
  const [newPaymentMethod, setNewPaymentMethod] = useState('Nequi');
  const [newNotes, setNewNotes] = useState('');

  if (!isOpen) return null;

  // Bookings con saldos pendientes
  const pendingBookings = bookings.filter(b => b.status !== 'Cancelado' && (b.balanceDue || 0) > 0);
  const allValidBookings = bookings.filter(b => b.status !== 'Cancelado');

  const displayedBookings = (filterReceivables === 'pending' ? pendingBookings : allValidBookings)
    .filter(b => {
      const q = searchReceivables.toLowerCase();
      return (
        b.clientName.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        (b.clientPhone && b.clientPhone.includes(q)) ||
        (b.eventLocation && b.eventLocation.toLowerCase().includes(q))
      );
    });

  const totalPendingReceivables = pendingBookings.reduce((sum, b) => sum + (b.balanceDue || 0), 0);
  const totalCollectedDeposits = allValidBookings.reduce((sum, b) => sum + (b.depositAmount || 0), 0);

  // Métricas de Nómina / Salarios
  const pendingSalaries = payroll.filter(p => p.status === 'Por Pagar');
  const paidSalaries = payroll.filter(p => p.status === 'Pagado');
  const totalPendingSalariesAmount = pendingSalaries.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPaidSalariesAmount = paidSalaries.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Cobrar saldo por WhatsApp a cliente
  const handleCollectWhatsApp = (booking) => {
    const phone = (booking.clientPhone || '').replace(/\D/g, '');
    const cleanPhone = phone.startsWith('57') ? phone : `57${phone}`;
    const text = `Hola *${booking.clientName}*! 👋 Te saludamos de *${settings.businessName || 'Sound & Event Control'}*.\n\nTe recordamos cordialmente que para tu evento del *${booking.eventDate}* tienes un saldo pendiente de: *${formatCurrency(booking.balanceDue)}*.\n\nPuedes cancelarlo vía transferencia (Nequi / Bancolombia) o en efectivo al momento del montaje del sonido.\n\n¿Deseas que te enviemos los datos de transferencia? ¡Muchas gracias! 🎶`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Liquidar saldo al 100% de inmediato
  const handleSettleFullBalance = async (booking) => {
    const confirmed = await showConfirm({
      title: '¿Confirmar cobro de saldo?',
      text: `¿Confirmas que recibiste el pago completo de ${formatCurrency(booking.balanceDue)} de ${booking.clientName}?`,
      confirmButtonText: 'Sí, liquidar saldo',
      cancelButtonText: 'Cancelar',
      icon: 'question'
    });
    if (!confirmed) return;

    const newDeposit = (Number(booking.depositAmount) || 0) + (Number(booking.balanceDue) || 0);
    onSavePayment({
      bookingId: booking.id,
      depositAmount: newDeposit,
      balanceDue: 0,
      paymentMethod: booking.paymentMethod || 'Efectivo en Sitio',
      paymentNotes: `${booking.paymentNotes ? booking.paymentNotes + ' | ' : ''}Saldo de ${formatCurrency(booking.balanceDue)} liquidado en su totalidad (${new Date().toLocaleDateString('es-CO')}).`
    });
    showSuccess('¡Saldo Liquidado!', `Se registró el cobro completo a ${booking.clientName}.`);
  };

  // Crear nuevo salario / turno
  const handleCreatePayrollSubmit = (e) => {
    e.preventDefault();
    if (!newAmount || Number(newAmount) <= 0) {
      showError('Monto requerido', 'Ingresa un monto válido para el salario.');
      return;
    }

    const selectedBooking = bookings.find(b => b.id === newBookingId);

    const newRecord = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      workerName: newWorkerName.trim(),
      role: newRole,
      bookingId: newBookingId || '',
      eventName: selectedBooking ? `${selectedBooking.clientName} (${selectedBooking.id})` : 'Operación General / Taller',
      eventDate: selectedBooking ? selectedBooking.eventDate : new Date().toISOString().split('T')[0],
      concept: newConcept.trim(),
      amount: Number(newAmount),
      status: newStatus,
      paidDate: newStatus === 'Pagado' ? new Date().toISOString().split('T')[0] : '',
      paymentMethod: newPaymentMethod,
      notes: newNotes.trim(),
      createdAt: new Date().toISOString()
    };

    onSavePayroll(newRecord);
    setIsAddingPayroll(false);
    setNewConcept('Turno de montaje, operación y desmontaje');
    setNewAmount('80000');
    setNewNotes('');
  };

  // Marcar salario como Pagado
  const handleMarkSalaryPaid = (item) => {
    const updated = {
      ...item,
      status: 'Pagado',
      paidDate: new Date().toISOString().split('T')[0]
    };
    onSavePayroll(updated);
  };

  // Enviar comprobante de pago al técnico por WhatsApp
  const handleNotifyWorkerWhatsApp = (item) => {
    const worker = workers.find(w => w.name === item.workerName);
    const rawPhone = (worker?.phone || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length >= 10 ? (rawPhone.startsWith('57') ? rawPhone : `57${rawPhone}`) : '';
    
    const text = `Hola *${item.workerName}*! 👋 Te confirmamos el pago de honorarios de *${formatCurrency(item.amount)}* por: *${item.concept}* (${item.eventName}).\n\nMétodo: *${item.paymentMethod}*.\n¡Muchas gracias por tu compromiso y excelente labor técnica! 🔊⚡`;
    
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0d121f] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#111728] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Gestión de Cartera & Salarios
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Saldos por cobrar a clientes y control de pagos a técnicos y DJs
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-800 bg-[#0a0e18] px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('receivables')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'receivables'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Saldos por Cobrar a Clientes</span>
            {pendingBookings.length > 0 && (
              <span className="bg-amber-500 text-black font-black text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payroll')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'payroll'
                ? 'border-purple-400 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Salarios & Pagos al Personal</span>
            {pendingSalaries.length > 0 && (
              <span className="bg-purple-500 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingSalaries.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* TAB 1: SALDOS POR COBRAR */}
          {activeTab === 'receivables' && (
            <div className="space-y-4">
              
              {/* Resumen KPI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#111728] p-4 rounded-2xl border border-amber-500/40">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Total Pendiente por Cobrar</span>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-amber-400 mt-2">
                    {formatCurrency(totalPendingReceivables)}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    En {pendingBookings.length} alquileres activos
                  </p>
                </div>

                <div className="bg-[#111728] p-4 rounded-2xl border border-emerald-500/30">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Abonos Ya Recaudados</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-2">
                    {formatCurrency(totalCollectedDeposits)}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Dinero seguro en caja
                  </p>
                </div>

                <div className="bg-[#111728] p-4 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Efectividad de Recaudo</span>
                    <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                    {totalPendingReceivables + totalCollectedDeposits > 0
                      ? Math.round((totalCollectedDeposits / (totalPendingReceivables + totalCollectedDeposits)) * 100)
                      : 0}%
                  </h3>
                  <p className="text-[11px] text-cyan-400 mt-0.5">
                    Del valor total contratado
                  </p>
                </div>
              </div>

              {/* Filtro y Buscador */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={searchReceivables}
                    onChange={(e) => setSearchReceivables(e.target.value)}
                    placeholder="Buscar cliente, teléfono o evento..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => setFilterReceivables('pending')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      filterReceivables === 'pending'
                        ? 'bg-amber-500 text-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Solo Pendientes ({pendingBookings.length})
                  </button>
                  <button
                    onClick={() => setFilterReceivables('all')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      filterReceivables === 'all'
                        ? 'bg-amber-500 text-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Todos ({allValidBookings.length})
                  </button>
                </div>
              </div>

              {/* Lista de Saldos */}
              {displayedBookings.length === 0 ? (
                <div className="text-center py-10 bg-[#111728]/50 rounded-2xl border border-slate-800/80">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <h4 className="text-sm font-bold text-white">¡No hay saldos pendientes!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Todos los clientes tienen sus pagos al 100% al día.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedBookings.map(b => {
                    const hasPending = (b.balanceDue || 0) > 0;
                    const percentPaid = b.totalAmount > 0 
                      ? Math.min(100, Math.round(((b.depositAmount || 0) / b.totalAmount) * 100))
                      : 0;

                    return (
                      <div 
                        key={b.id}
                        className={`bg-[#111728] p-4 rounded-2xl border transition-all ${
                          hasPending ? 'border-amber-500/40 shadow-lg shadow-amber-500/5' : 'border-slate-800/80 opacity-75'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          
                          {/* Info Cliente & Evento */}
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-amber-400">#{b.id}</span>
                              <h4 className="text-sm font-black text-white truncate">{b.clientName}</h4>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                hasPending 
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {hasPending ? '⚠️ Saldo por Cobrar' : '✓ 100% Pagado'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                {formatDateFriendly(b.eventDate)}
                              </span>
                              {b.clientPhone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                                  {b.clientPhone}
                                </span>
                              )}
                              {b.eventLocation && (
                                <span className="flex items-center gap-1 truncate max-w-[200px]">
                                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  {b.eventLocation}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Finanzas del Booking */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                Saldo Pendiente
                              </span>
                              <span className={`text-base font-black ${hasPending ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {formatCurrency(b.balanceDue || 0)}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                Abono: {formatCurrency(b.depositAmount || 0)} ({percentPaid}%)
                              </span>
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {hasPending ? (
                                <>
                                  <button
                                    onClick={() => handleCollectWhatsApp(b)}
                                    title="Enviar recordatorio de cobro por WhatsApp"
                                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="hidden sm:inline">Cobrar WhatsApp</span>
                                  </button>

                                  <button
                                    onClick={() => handleSettleFullBalance(b)}
                                    title="Marcar como cobrado 100% de inmediato"
                                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-black text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Liquidar</span>
                                  </button>

                                  {onOpenPaymentModal && (
                                    <button
                                      onClick={() => onOpenPaymentModal(b)}
                                      title="Editar abono o pago"
                                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-all"
                                    >
                                      <DollarSign className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button
                                  onClick={() => onOpenPaymentModal && onOpenPaymentModal(b)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-xs font-medium"
                                >
                                  Ver Pago
                                </button>
                              )}
                            </div>

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: SALARIOS & NÓMINA AL PERSONAL */}
          {activeTab === 'payroll' && (
            <div className="space-y-4">
              
              {/* Resumen KPI Nómina */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#111728] p-4 rounded-2xl border border-purple-500/40">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Salarios Pendientes por Pagar</span>
                    <Clock className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-purple-400 mt-2">
                    {formatCurrency(totalPendingSalariesAmount)}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {pendingSalaries.length} turnos por liquidar
                  </p>
                </div>

                <div className="bg-[#111728] p-4 rounded-2xl border border-emerald-500/30">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Total Salarios Pagados</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-2">
                    {formatCurrency(totalPaidSalariesAmount)}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {paidSalaries.length} turnos liquidados con éxito
                  </p>
                </div>

                <div className="bg-[#111728] p-4 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Margen / Ganancia Neta</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                    {formatCurrency(totalCollectedDeposits - totalPaidSalariesAmount)}
                  </h3>
                  <p className="text-[11px] text-amber-300 mt-0.5">
                    Recaudado menos nómina
                  </p>
                </div>
              </div>

              {/* Botón para abrir formulario de nuevo salario */}
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase text-slate-400">
                  Listado de Pagos a Técnicos, DJs y Montadores
                </h4>
                
                <button
                  onClick={() => setIsAddingPayroll(!isAddingPayroll)}
                  className="px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-purple-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingPayroll ? 'Cancelar' : 'Registrar Salario / Turno'}</span>
                </button>
              </div>

              {/* Formulario desplegable para registrar salario */}
              {isAddingPayroll && (
                <form onSubmit={handleCreatePayrollSubmit} className="bg-[#12192c] p-4 sm:p-5 rounded-2xl border border-purple-500/30 space-y-4 animate-fade-in shadow-xl">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <Wrench className="w-4 h-4 text-purple-400" />
                    <h5 className="text-sm font-bold text-white">Nuevo Registro de Salario / Honorarios</h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Personal / Técnico</label>
                      <input
                        type="text"
                        value={newWorkerName}
                        onChange={(e) => setNewWorkerName(e.target.value)}
                        placeholder="Nombre del técnico o DJ"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Rol / Cargo</label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="Técnico de Sonido & Tarima">Técnico de Sonido & Tarima</option>
                        <option value="DJ & Animador">DJ & Animador</option>
                        <option value="Operador de Luces / Consola">Operador de Luces / Consola</option>
                        <option value="Transporte & Conductor">Transporte & Conductor</option>
                        <option value="Cargue & Desmonte">Cargue & Desmonte</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Evento Asociado</label>
                      <select
                        value={newBookingId}
                        onChange={(e) => setNewBookingId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="">Operación General / Sin Evento Específico</option>
                        {bookings.map(b => (
                          <option key={b.id} value={b.id}>
                            #{b.id} - {b.clientName} ({b.eventDate})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Monto a Pagar (COP)</label>
                      <input
                        type="number"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        placeholder="80000"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-purple-300 font-bold focus:outline-none focus:border-purple-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Estado de Pago</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="Por Pagar">⏳ Por Pagar (Pendiente)</option>
                        <option value="Pagado">✓ Pagado (Ya entregado)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Método de Pago</label>
                      <select
                        value={newPaymentMethod}
                        onChange={(e) => setNewPaymentMethod(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="Nequi">Nequi</option>
                        <option value="Bancolombia">Transferencia Bancolombia</option>
                        <option value="Efectivo">Efectivo en Sitio</option>
                        <option value="Daviplata">Daviplata</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Concepto / Turno Detallado</label>
                    <input
                      type="text"
                      value={newConcept}
                      onChange={(e) => setNewConcept(e.target.value)}
                      placeholder="Ej: Turno de 8 horas, montaje de 2 bajos y prueba de sonido"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingPayroll(false)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 active:scale-95 text-white text-xs font-black shadow-md shadow-purple-500/20"
                    >
                      Guardar Salario / Turno
                    </button>
                  </div>
                </form>
              )}

              {/* Listado de Nómina */}
              {payroll.length === 0 ? (
                <div className="text-center py-10 bg-[#111728]/50 rounded-2xl border border-slate-800/80">
                  <Users className="w-10 h-10 text-purple-400 mx-auto mb-2 opacity-80" />
                  <h4 className="text-sm font-bold text-white">No hay salarios registrados</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Usa el botón "Registrar Salario / Turno" para llevar el control de tus técnicos y DJs.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payroll.map(item => {
                    const isPending = item.status === 'Por Pagar';

                    return (
                      <div
                        key={item.id}
                        className={`bg-[#111728] p-4 rounded-2xl border transition-all ${
                          isPending ? 'border-purple-500/40 shadow-lg shadow-purple-500/5' : 'border-slate-800/80 opacity-80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          
                          {/* Info Técnico & Concepto */}
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-purple-400">#{item.id}</span>
                              <h4 className="text-sm font-black text-white">{item.workerName}</h4>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                {item.role}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isPending 
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {isPending ? '⏳ Por Pagar' : `✓ Pagado (${item.paidDate || 'Hoy'})`}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300">
                              {item.concept}
                            </p>

                            <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                              <span>📅 {item.eventDate || formatDateFriendly(item.createdAt)}</span>
                              {item.eventName && <span>🎉 {item.eventName}</span>}
                              <span>💳 {item.paymentMethod || 'Nequi'}</span>
                            </div>
                          </div>

                          {/* Finanzas & Acciones */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                Honorarios
                              </span>
                              <span className="text-base font-black text-purple-300">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isPending && (
                                <button
                                  onClick={() => handleMarkSalaryPaid(item)}
                                  className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Pagar</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleNotifyWorkerWhatsApp(item)}
                                title="Enviar confirmación por WhatsApp al técnico"
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-all"
                              >
                                <MessageSquare className="w-4 h-4 text-emerald-400" />
                              </button>

                              <button
                                onClick={async () => {
                                  const confirmed = await showConfirm({
                                    title: '¿Eliminar registro de nómina?',
                                    text: `¿Seguro que deseas eliminar el pago registrado para ${item.workerName}?`,
                                    confirmButtonText: 'Sí, eliminar',
                                    icon: 'warning'
                                  });
                                  if (confirmed) {
                                    onDeletePayroll(item.id);
                                  }
                                }}
                                title="Eliminar registro"
                                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 text-xs font-bold transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-[#111728] flex items-center justify-between shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Módulo de Control Financiero Empresarial</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
