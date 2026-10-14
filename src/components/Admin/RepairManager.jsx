import { useState, useEffect } from 'react';
import { 
  Wrench, AlertTriangle, CheckCircle2, Clock, DollarSign, 
  Plus, Search, MessageSquare, ShieldAlert, 
  Trash2, X, Calendar, User, FileText, Check
} from 'lucide-react';
import { formatCurrency, generateDamageReportWhatsAppLink } from '../../services/storageService';
import { showConfirm } from '../../services/alertService';

export default function RepairManager({
  repairs = [],
  equipmentList = [],
  bookings = [],
  currentRole = 'superadmin',
  currentWorkerName = '',
  settings = {},
  onSaveRepair,
  onDeleteRepair
}) {
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [activeDetailRepair, setActiveDetailRepair] = useState(null);

  // Manejar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isNewModalOpen) setIsNewModalOpen(false);
        if (activeDetailRepair) setActiveDetailRepair(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNewModalOpen, activeDetailRepair]);

  // Estados para nuevo ingreso a taller
  const [selectedEqId, setSelectedEqId] = useState(equipmentList[0]?.id || '');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newIssueType, setNewIssueType] = useState('Sonido / Driver');
  const [newSeverity, setNewSeverity] = useState('Alta');
  const [newDescription, setNewDescription] = useState('');
  const [newLinkedBookingId, setNewLinkedBookingId] = useState('');
  const [newTechnician, setNewTechnician] = useState(currentWorkerName || 'Técnico de Tarima & Bodega');

  // Estados para resolver / actualizar reparación en modal
  const [resStatus, setResStatus] = useState('En Taller');
  const [resCost, setResCost] = useState(0);
  const [resSpareNotes, setResSpareNotes] = useState('');
  const [resSolutionNotes, setResSolutionNotes] = useState('');
  const [resWarrantyCharged, setResWarrantyCharged] = useState(false);
  const [resWarrantyAmount, setResWarrantyAmount] = useState(0);

  // Filtrado de reparaciones
  const filteredRepairs = repairs.filter(rep => {
    const matchesStatus = filterStatus === 'Todos' || rep.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      rep.equipmentName.toLowerCase().includes(q) ||
      (rep.issueType && rep.issueType.toLowerCase().includes(q)) ||
      (rep.bookingId && rep.bookingId.toLowerCase().includes(q)) ||
      (rep.clientName && rep.clientName.toLowerCase().includes(q)) ||
      (rep.technicianAssigned && rep.technicianAssigned.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  // KPIs de Taller
  const activeInWorkshop = repairs.filter(r => r.status === 'Pendiente' || r.status === 'En Taller');
  const pendingDiagnosis = repairs.filter(r => r.status === 'Pendiente');
  const totalSparePartsCost = repairs.reduce((sum, r) => sum + (Number(r.costSpareParts) || 0), 0);
  const totalWarrantyCharged = repairs.filter(r => r.warrantyChargedToClient).reduce((sum, r) => sum + (Number(r.warrantyAmount) || 0), 0);

  // Abrir modal de detalles/solución
  const handleOpenDetail = (rep) => {
    setActiveDetailRepair(rep);
    setResStatus(rep.status);
    setResCost(rep.costSpareParts || 0);
    setResSpareNotes(rep.sparePartsNotes || '');
    setResSolutionNotes(rep.solutionNotes || '');
    setResWarrantyCharged(!!rep.warrantyChargedToClient);
    setResWarrantyAmount(rep.warrantyAmount || 0);
  };

  // Guardar nuevo ingreso a taller
  const handleCreateRepair = (e) => {
    e.preventDefault();
    const targetEq = equipmentList.find(eq => eq.id === selectedEqId);
    if (!targetEq) return;

    let clientName = '';
    let clientPhone = '';
    if (newLinkedBookingId) {
      const b = bookings.find(item => item.id === newLinkedBookingId);
      if (b) {
        clientName = b.clientName || '';
        clientPhone = b.clientPhone || '';
      }
    }

    const newRepair = {
      id: `REP-${Math.floor(100 + Math.random() * 900)}`,
      equipmentId: targetEq.id,
      equipmentName: targetEq.name,
      quantity: Number(newQuantity) || 1,
      reportedDate: new Date().toISOString().split('T')[0],
      reportedBy: currentWorkerName || (currentRole === 'superadmin' ? 'Dueño / Super Admin' : 'Técnico de Bodega'),
      bookingId: newLinkedBookingId || '',
      clientName,
      clientPhone,
      issueType: newIssueType,
      severity: newSeverity,
      description: newDescription.trim(),
      status: 'Pendiente',
      technicianAssigned: newTechnician.trim() || 'Técnico de Bodega',
      costSpareParts: 0,
      sparePartsNotes: '',
      solutionNotes: '',
      repairedDate: '',
      warrantyChargedToClient: false,
      warrantyAmount: 0,
      createdAt: new Date().toISOString()
    };

    onSaveRepair(newRepair);
    setIsNewModalOpen(false);
    setNewDescription('');
    setNewQuantity(1);
    setNewLinkedBookingId('');
  };

  // Guardar cambios en el modal de resolución
  const handleSaveResolution = (e) => {
    e.preventDefault();
    if (!activeDetailRepair) return;

    const updated = {
      ...activeDetailRepair,
      status: resStatus,
      costSpareParts: Number(resCost) || 0,
      sparePartsNotes: resSpareNotes.trim(),
      solutionNotes: resSolutionNotes.trim(),
      warrantyChargedToClient: resWarrantyCharged,
      warrantyAmount: Number(resWarrantyAmount) || 0,
      repairedDate: resStatus === 'Listo' ? (activeDetailRepair.repairedDate || new Date().toISOString().split('T')[0]) : ''
    };

    onSaveRepair(updated);
    setActiveDetailRepair(null);
  };

  // Botón directo: Dar de Alta (Listo y probado)
  const handleQuickDischarge = (rep) => {
    const updated = {
      ...rep,
      status: 'Listo',
      repairedDate: new Date().toISOString().split('T')[0]
    };
    onSaveRepair(updated);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Clock className="w-3.5 h-3.5" />
            Por Diagnosticar
          </span>
        );
      case 'En Taller':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Wrench className="w-3.5 h-3.5" />
            En Reparación / Repuestos
          </span>
        );
      case 'Listo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Listo / Alta en Bodega
          </span>
        );
      case 'Baja':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
            ✕ Dado de Baja
          </span>
        );
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Alta':
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-500/30">Urgente</span>;
      case 'Media':
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/30">Media</span>;
      default:
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">Menor</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* KPI Cards del Taller */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1: En Reparación */}
        <div className="bg-[#111622] p-4 rounded-2xl border border-amber-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">
              En Taller Técnico
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
              {activeInWorkshop.length} {activeInWorkshop.length === 1 ? 'Unidad' : 'Unidades'}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Descontadas del stock de alquiler
            </p>
          </div>
        </div>

        {/* KPI 2: Por Diagnosticar */}
        <div className="bg-[#111622] p-4 rounded-2xl border border-rose-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">
              Esperando Revisión
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight">
              {pendingDiagnosis.length} {pendingDiagnosis.length === 1 ? 'Caso' : 'Casos'}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Sin diagnóstico técnico
            </p>
          </div>
        </div>

        {/* KPI 3: Inversión en Repuestos (Solo Admin/SuperAdmin) o Reparados (Staff) */}
        {currentRole !== 'staff' ? (
          <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">
                Gasto en Repuestos
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-xl sm:text-2xl font-black text-purple-400 tracking-tight">
                {formatCurrency(totalSparePartsCost)}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Mantenimientos acumulados
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#111622] p-4 rounded-2xl border border-emerald-500/30 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">
                Dados de Alta
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                {repairs.filter(r => r.status === 'Listo').length} Equipos
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Listos para salir a evento
              </p>
            </div>
          </div>
        )}

        {/* KPI 4: Garantías a Cobrar a Clientes */}
        <div className="bg-[#111622] p-4 rounded-2xl border border-cyan-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">
              Garantías / Clientes
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {formatCurrency(totalWarrantyCharged)}
            </h3>
            <p className="text-[10px] text-cyan-400 font-semibold mt-0.5">
              Por averías en eventos
            </p>
          </div>
        </div>

      </div>

      {/* Barra de Acciones y Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111622] p-4 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por equipo, falla, #evento o técnico..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['Todos', 'Pendiente', 'En Taller', 'Listo', 'Baja'].map(st => (
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

        {/* Botón Ingresar Equipo */}
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-4 py-2 rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ingresar a Taller</span>
        </button>

      </div>

      {/* Lista de Órdenes de Reparación */}
      <div className="space-y-4">
        {filteredRepairs.length === 0 ? (
          <div className="text-center py-16 bg-[#111622] rounded-2xl border border-slate-800">
            <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="font-extrabold text-white text-base">Taller al día</h4>
            <p className="text-slate-400 text-xs mt-1">No hay equipos reportados en este estado de reparación.</p>
          </div>
        ) : (
          filteredRepairs.map((repair) => {
            const isDamagedActive = repair.status === 'Pendiente' || repair.status === 'En Taller';

            return (
              <div
                key={repair.id}
                className={`bg-[#111622] rounded-2xl border transition-all p-4 sm:p-5 shadow-lg space-y-4 ${
                  repair.status === 'Pendiente'
                    ? 'border-rose-500/30 hover:border-rose-500/50'
                    : repair.status === 'En Taller'
                    ? 'border-amber-500/30 hover:border-amber-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header de la Tarjeta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-extrabold text-amber-400 text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {repair.id}
                    </span>
                    {getStatusBadge(repair.status)}
                    {getSeverityBadge(repair.severity)}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Reportado: {repair.reportedDate}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botón WhatsApp de Garantía si viene de un evento */}
                    {repair.clientPhone && (
                      <a
                        href={generateDamageReportWhatsAppLink({
                          repair,
                          businessName: settings.businessName,
                          phone: settings.phone
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                        title="Enviar notificación formal de garantía al cliente"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cobrar Garantía</span>
                      </a>
                    )}

                    {/* Botón rápido dar de alta si está reparado */}
                    {isDamagedActive && (
                      <button
                        onClick={() => handleQuickDischarge(repair)}
                        className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-xl text-xs font-black shadow-sm active:scale-95 transition-all"
                        title="Marcar como reparado y devolver al stock activo"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Dar de Alta</span>
                      </button>
                    )}

                    {/* Botón Abrir Ficha Técnica */}
                    <button
                      onClick={() => handleOpenDetail(repair)}
                      className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ficha Técnica</span>
                    </button>

                    {/* Eliminar (Solo SuperAdmin) */}
                    {currentRole === 'superadmin' && (
                      <button
                        onClick={async () => {
                          const confirmed = await showConfirm({
                            title: '¿Eliminar reporte?',
                            text: `¿Deseas eliminar el reporte ${repair.id} de ${repair.equipmentName}?`,
                            confirmButtonText: 'Sí, eliminar',
                            icon: 'warning'
                          });
                          if (confirmed) {
                            onDeleteRepair(repair.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid de Contenido */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                  
                  {/* Columna 1: Equipo y Cantidad */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                        Equipo & Daño
                      </span>
                      <h4 className="font-extrabold text-white text-sm mt-1">
                        {repair.quantity > 1 && <span className="text-amber-400 mr-1.5 font-mono">{repair.quantity}x</span>}
                        {repair.equipmentName}
                      </h4>
                      <p className="text-amber-300 font-semibold text-xs mt-1 flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 flex-shrink-0" />
                        {repair.issueType}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 mt-2 text-[11px] text-slate-400">
                      Reportado por: <span className="text-slate-200 font-bold">{repair.reportedBy}</span>
                    </div>
                  </div>

                  {/* Columna 2: Diagnóstico y Novedad */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                        Síntoma / Diagnóstico
                      </span>
                      <p className="text-slate-200 mt-1 line-clamp-3 leading-relaxed">
                        {repair.description || 'Sin descripción ingresada.'}
                      </p>
                    </div>

                    {repair.bookingId && (
                      <div className="pt-2 border-t border-slate-900 mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-cyan-400 font-bold">Evento #{repair.bookingId}</span>
                        <span className="text-slate-400 truncate max-w-[120px]">{repair.clientName}</span>
                      </div>
                    )}
                  </div>

                  {/* Columna 3: Costos y Estado de Solución */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                        Técnico Asignado & Costos
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 text-slate-200 font-bold">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span>{repair.technicianAssigned || 'Por asignar'}</span>
                      </div>
                      
                      {repair.costSpareParts > 0 && (
                        <div className="mt-1.5 text-[11px]">
                          <span className="text-slate-400">Repuestos: </span>
                          <span className="font-extrabold text-purple-400">{formatCurrency(repair.costSpareParts)}</span>
                          {repair.sparePartsNotes && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{repair.sparePartsNotes}</p>
                          )}
                        </div>
                      )}

                      {repair.warrantyAmount > 0 && (
                        <div className="mt-1 text-[11px] text-cyan-400 font-bold">
                          Cobro al cliente: {formatCurrency(repair.warrantyAmount)}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-900 mt-2">
                      <span className={`text-[10px] font-bold block ${
                        isDamagedActive ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {isDamagedActive 
                          ? '⛔ No disponible para alquiler en la web' 
                          : '✓ Disponible al 100% en bodega'}
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: NUEVO INGRESO A TALLER */}
      {isNewModalOpen && (
        <div 
          onClick={() => setIsNewModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden"
          >
            
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828] flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Ingresar Equipo a Taller</h3>
                  <p className="text-xs text-slate-400">Reporta daño y descuenta automáticamente del stock</p>
                </div>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRepair} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Equipo a reparar */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Equipo Afectado *
                </label>
                <select
                  value={selectedEqId}
                  onChange={(e) => setSelectedEqId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  required
                >
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} (Stock total: {eq.totalStock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Cantidad de unidades dañadas */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cantidad Dañada
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono text-center"
                    required
                  />
                </div>

                {/* Severidad */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Severidad
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Alta">🔴 Alta (Inoperativo)</option>
                    <option value="Media">🟡 Media (Falla parcial)</option>
                    <option value="Baja">🟢 Baja (Estético / Menor)</option>
                  </select>
                </div>
              </div>

              {/* Tipo de Avería */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo de Falla / Avería
                </label>
                <select
                  value={newIssueType}
                  onChange={(e) => setNewIssueType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Sonido / Driver">🔊 Sonido / Driver / Bobina quemada</option>
                  <option value="Eléctrico / Encendido">⚡ Eléctrico / Fuente / No enciende</option>
                  <option value="Cables / Conectores">🔌 Cables / Conector Speakon / XLR</option>
                  <option value="Estructural / Golpe">🔨 Estructural / Golpe / Plástico roto</option>
                  <option value="Luces / Motor">💡 Luces / Motor / Sensor / LED</option>
                  <option value="Líquidos / Humedad">💧 Líquidos derramados / Lluvia</option>
                </select>
              </div>

              {/* Evento asociado (opcional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ¿Ocurrió en un Evento Específico? (Opcional para cobro de garantía)
                </label>
                <select
                  value={newLinkedBookingId}
                  onChange={(e) => setNewLinkedBookingId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- No vincular a ningún evento (Avería interna) --</option>
                  {bookings.map(b => (
                    <option key={b.id} value={b.id}>
                      #{b.id} - {b.clientName} ({b.eventDate})
                    </option>
                  ))}
                </select>
              </div>

              {/* Descripción de lo ocurrido */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descripción del Daño / Novedad *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ej. La trompeta de agudos no suena. El cliente colocó el master en rojo y sobrecalentó el driver."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Técnico asignado */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Técnico Responsable del Diagnóstico
                </label>
                <input
                  type="text"
                  value={newTechnician}
                  onChange={(e) => setNewTechnician(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3 rounded-xl text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
                >
                  Ingresar a Taller y Bloquear Stock
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: FICHA TÉCNICA Y RESOLUCIÓN */}
      {activeDetailRepair && (
        <div 
          onClick={() => setActiveDetailRepair(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden"
          >
            
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828] flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Ficha Técnica: {activeDetailRepair.id}
                  </h3>
                  <p className="text-xs text-slate-400">{activeDetailRepair.equipmentName}</p>
                </div>
              </div>
              <button onClick={() => setActiveDetailRepair(null)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResolution} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Resumen del Daño */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{activeDetailRepair.equipmentName}</span>
                  <span className="text-amber-400 font-bold">{activeDetailRepair.issueType}</span>
                </div>
                <p className="text-slate-300">{activeDetailRepair.description}</p>
                {activeDetailRepair.bookingId && (
                  <p className="text-[11px] text-cyan-400">
                    Evento #{activeDetailRepair.bookingId} • Cliente: {activeDetailRepair.clientName}
                  </p>
                )}
              </div>

              {/* Cambiar Estado */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Estado de la Reparación
                </label>
                <select
                  value={resStatus}
                  onChange={(e) => setResStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-bold"
                >
                  <option value="Pendiente">🔴 Pendiente (Esperando Diagnóstico)</option>
                  <option value="En Taller">🟡 En Taller (En Proceso / Esperando Repuestos)</option>
                  <option value="Listo">🟢 Listo / Probado (Dar de Alta a Stock Activo)</option>
                  <option value="Baja">⚪ Dar de Baja (Daño Total / Repuesto no viable)</option>
                </select>
              </div>

              {/* Costo de Repuestos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Costo de Repuestos (COP)
                  </label>
                  <input
                    type="number"
                    value={resCost}
                    onChange={(e) => setResCost(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-amber-400 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Detalle de Repuestos
                  </label>
                  <input
                    type="text"
                    value={resSpareNotes}
                    onChange={(e) => setResSpareNotes(e.target.value)}
                    placeholder="Ej. Diafragma JBL 1.75 pulg"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              {/* Cobro al Cliente / Garantía */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resWarrantyCharged}
                      onChange={(e) => setResWarrantyCharged(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                    />
                    <span className="font-bold text-white text-xs">Cobrar Garantía / Daño al Cliente</span>
                  </label>
                  {resWarrantyCharged && (
                    <span className="text-[10px] text-amber-400 font-bold">Cobro Activo</span>
                  )}
                </div>

                {resWarrantyCharged && (
                  <div className="pt-2">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Monto a Cobrar al Cliente por Daño (COP)
                    </label>
                    <input
                      type="number"
                      value={resWarrantyAmount}
                      onChange={(e) => setResWarrantyAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-400 font-mono font-bold outline-none"
                      placeholder="0"
                    />
                  </div>
                )}
              </div>

              {/* Notas de Solución / Pruebas */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notas de Solución Técnica & Pruebas en Bodega
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Se reemplazó el diafragma, se sopló con aire comprimido el entrehierro y se probó a 80% de volumen OK."
                  value={resSolutionNotes}
                  onChange={(e) => setResSolutionNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Botones de Acción */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  Guardar Ficha Técnica
                </button>
                {activeDetailRepair.clientPhone && (
                  <a
                    href={generateDamageReportWhatsAppLink({
                      repair: { ...activeDetailRepair, warrantyAmount: resWarrantyAmount },
                      businessName: settings.businessName,
                      phone: settings.phone
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp al Cliente</span>
                  </a>
                )}
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
