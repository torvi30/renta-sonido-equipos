import { useState, useEffect, useCallback } from 'react';
import { 
  Inbox, Calendar, Package, DollarSign, 
  TrendingUp, ShieldCheck,
  Layout, BarChart3, Truck, Wrench
} from 'lucide-react';
import OrdersInbox from './OrdersInbox';
import CalendarView from './CalendarView';
import InventoryManager from './InventoryManager';
import LandingManager from './LandingManager';
import FinancialReports from './FinancialReports';
import RepairManager from './RepairManager';
import { formatCurrency } from '../../services/storageService';

export default function AdminDashboard({
  bookings = [],
  equipmentList = [],
  repairs = [],
  settings,
  currentRole = 'superadmin',
  currentWorkerName = '',
  onSaveSettings,
  combosList = [],
  onSaveCombo,
  onDeleteCombo,
  onUpdateBookingStatus,
  onOpenPayment,
  onOpenChecklist,
  onOpenReceipt,
  onSaveEquipment,
  onDeleteEquipment,
  onSaveRepair,
  onDeleteRepair,
  onUpdateRepairStatus,
  payroll = [],
  onOpenReceivablesPayroll,
  adminTab: propAdminTab,
  setAdminTab: propSetAdminTab,
  isSidebarMode = false
}) {
  const [localAdminTab, setLocalAdminTab] = useState('orders');
  const [ordersFilterStatus, setOrdersFilterStatus] = useState('Todos');
  const adminTab = propAdminTab !== undefined ? propAdminTab : localAdminTab;
  const setAdminTab = propSetAdminTab || setLocalAdminTab;

  // Restringir tabs según el rango del usuario
  const isTabAllowed = useCallback((tab) => {
    if (currentRole === 'superadmin') return true;
    if (currentRole === 'admin') return ['orders', 'calendar', 'inventory', 'repairs'].includes(tab);
    if (currentRole === 'staff') return ['orders', 'calendar', 'repairs'].includes(tab);
    return false;
  }, [currentRole]);

  useEffect(() => {
    if (!isTabAllowed(adminTab)) {
      setAdminTab('orders');
    }
  }, [currentRole, adminTab, isTabAllowed, setAdminTab]);

  // KPI Calculations
  const pendingOrders = bookings.filter(b => b.status === 'Pendiente');
  const activeEvents = bookings.filter(b => b.status === 'Aprobado' || b.status === 'En Evento');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = bookings.filter(b => b.eventDate === todayStr && b.status !== 'Cancelado');

  const totalDispatchedItems = activeEvents.reduce((sum, b) => {
    return sum + (b.items || []).reduce((s, it) => s + (it.quantity || 1), 0);
  }, 0);
  
  const totalPendingBalance = bookings
    .filter(b => b.status !== 'Cancelado' && b.status !== 'Finalizado')
    .reduce((sum, b) => sum + (b.balanceDue || 0), 0);

  const totalCollectedDeposits = bookings
    .filter(b => b.status !== 'Cancelado')
    .reduce((sum, b) => sum + (b.depositAmount || 0), 0);

  // Helper para desplazamiento suave hacia el módulo correspondiente
  const scrollToContent = () => {
    setTimeout(() => {
      const el = document.getElementById('admin-content-area');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <div className="space-y-6">
      
      {/* KPI Top Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {currentRole === 'staff' ? (
          <>
            {/* KPI 1 Staff: Eventos Programados */}
            <button 
              type="button"
              onClick={() => {
                setAdminTab('calendar');
                scrollToContent();
              }}
              className={`w-full text-left p-4 rounded-2xl border shadow-lg relative overflow-hidden transition-all group ${
                adminTab === 'calendar'
                  ? 'bg-[#10241e] border-emerald-400 ring-2 ring-emerald-500/50'
                  : 'bg-[#111622] border-emerald-500/30 hover:border-emerald-400 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 group-hover:text-emerald-300 transition-colors">
                  Eventos Programados
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-lg sm:text-xl font-black text-emerald-400 tracking-tight flex items-center justify-between">
                  <span>{todayEvents.length > 0 ? `${todayEvents.length} Para Hoy` : `${activeEvents.length} En Curso`}</span>
                  <span className="text-[10px] font-bold text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">
                    Ver agenda →
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Montajes & logística activa
                </p>
              </div>
            </button>

            {/* KPI 2 Staff: Equipos en Tránsito */}
            <button 
              type="button"
              onClick={() => {
                setAdminTab('calendar');
                scrollToContent();
              }}
              className={`w-full text-left p-4 rounded-2xl border shadow-lg relative overflow-hidden transition-all group ${
                adminTab === 'calendar'
                  ? 'bg-[#111d2c] border-cyan-400 ring-2 ring-cyan-500/50'
                  : 'bg-[#111622] border-cyan-500/30 hover:border-cyan-400 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 group-hover:text-cyan-300 transition-colors">
                  Equipos en Tránsito
                </span>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-all">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center justify-between">
                  <span>{totalDispatchedItems} Ítems</span>
                  <span className="text-[10px] font-bold text-cyan-400/80 group-hover:translate-x-0.5 transition-transform">
                    Ver ruta →
                  </span>
                </h3>
                <p className="text-[10px] text-cyan-400 font-semibold mt-0.5">
                  Cabinas, luces y cables en ruta
                </p>
              </div>
            </button>

            {/* KPI 3 Staff: Alistamiento de Pedidos */}
            <button 
              type="button"
              onClick={() => {
                setOrdersFilterStatus('Pendiente');
                setAdminTab('orders');
                scrollToContent();
              }}
              className={`w-full text-left p-4 rounded-2xl border shadow-lg relative overflow-hidden transition-all group ${
                adminTab === 'orders' && ordersFilterStatus === 'Pendiente'
                  ? 'bg-[#161c2b] border-amber-400 ring-2 ring-amber-500/50'
                  : 'bg-[#111622] border-amber-500/30 hover:border-amber-400 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 group-hover:text-amber-300 transition-colors">
                  Alistamiento Pendiente
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                  <Inbox className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-lg sm:text-xl font-black text-amber-400 tracking-tight flex items-center justify-between">
                  <span>{pendingOrders.length} Por Salir</span>
                  <span className="text-[10px] font-bold text-amber-400/80 group-hover:translate-x-0.5 transition-transform">
                    Despachar →
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Revisar checklist de cables
                </p>
              </div>
            </button>

            {/* KPI 4 Staff: Modo Operativo */}
            <button 
              type="button"
              onClick={() => {
                setAdminTab('repairs');
                scrollToContent();
              }}
              className={`w-full text-left p-4 rounded-2xl border shadow-lg relative overflow-hidden transition-all group ${
                adminTab === 'repairs'
                  ? 'bg-[#1e132b] border-purple-400 ring-2 ring-purple-500/50'
                  : 'bg-[#111622] border-purple-500/30 hover:border-purple-400 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 group-hover:text-purple-300 transition-colors">
                  Modo Operativo
                </span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-lg sm:text-xl font-black text-purple-300 tracking-tight truncate flex items-center justify-between">
                  <span>{currentWorkerName || 'Técnico'}</span>
                  <span className="text-[10px] font-bold text-purple-400/80 group-hover:translate-x-0.5 transition-transform">
                    Taller →
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Bodega, rutas y tarima
                </p>
              </div>
            </button>
          </>
        ) : (
          <>
            {/* KPI 1: Saldos por Cobrar / Salarios */}
            <button 
              type="button"
              onClick={() => {
                setOrdersFilterStatus('Por Cobrar');
                setAdminTab('orders');
                scrollToContent();
              }}
              className={`w-full text-left p-4 rounded-2xl border shadow-lg relative overflow-hidden transition-all group ${
                adminTab === 'orders' && ordersFilterStatus === 'Por Cobrar'
                  ? 'bg-[#161c2b] border-amber-400 ring-2 ring-amber-500/50 shadow-amber-500/10'
                  : 'bg-[#111622] border-amber-500/40 hover:border-amber-400 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 group-hover:text-amber-300 transition-colors">
                  Saldos por Cobrar
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-lg sm:text-xl font-black text-amber-400 tracking-tight flex items-center justify-between">
                  <span>{formatCurrency(totalPendingBalance)}</span>
                  <span className="text-[10px] font-bold text-amber-400/90 group-hover:translate-x-0.5 transition-transform">
                    Ver por cobrar →
                  </span>
                </h3>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Por cobrar en eventos</span>
                  <div className="flex items-center gap-2">
                    {onOpenReceivablesPayroll && (
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReceivablesPayroll('receivables');
                        }}
                        className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                        title="Abrir resumen de cobros"
                      >
                        Cobros PRO 📋
                      </span>
                    )}
                    {currentRole === 'superadmin' && onOpenReceivablesPayroll && (
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReceivablesPayroll('payroll');
                        }}
                        className="text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                        title="Ver nómina de colaboradores"
                      >
                        Nómina 👷
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>

            {/* KPI 2: Cotizaciones Pendientes */}
            <button 
              type="button"
              onClick={() => {
                setOrdersFilterStatus('Pendiente');
                setAdminTab('orders');
                scrollToContent();
              }}
              className={`w-full text-left p-4 rounded-2xl border shadow-lg relative overflow-hidden transition-all group ${
                adminTab === 'orders' && ordersFilterStatus === 'Pendiente'
                  ? 'bg-[#111d2c] border-cyan-400 ring-2 ring-cyan-500/50 shadow-cyan-500/10'
                  : 'bg-[#111622] border-slate-800 hover:border-cyan-400 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 group-hover:text-cyan-300 transition-colors">
                  Nuevas Cotizaciones
                </span>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-all">
                  <Inbox className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center justify-between">
                  <span>{pendingOrders.length} {pendingOrders.length === 1 ? 'Pedido' : 'Pedidos'}</span>
                  <span className="text-[10px] font-bold text-cyan-400/90 group-hover:translate-x-0.5 transition-transform">
                    Revisar →
                  </span>
                </h3>
                <p className="text-[10px] text-cyan-400 font-semibold mt-0.5">
                  Esperando aprobación
                </p>
              </div>
            </button>

            {/* KPI 3: Eventos Activos */}
            <button 
              type="button"
              onClick={() => {
                setAdminTab('calendar');
                scrollToContent();
              }}
              className={`w-full text-left p-4 rounded-2xl border shadow-lg relative overflow-hidden transition-all group ${
                adminTab === 'calendar'
                  ? 'bg-[#10241e] border-emerald-400 ring-2 ring-emerald-500/50 shadow-emerald-500/10'
                  : 'bg-[#111622] border-slate-800 hover:border-emerald-400 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 group-hover:text-emerald-300 transition-colors">
                  Eventos en Curso
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center justify-between">
                  <span>{activeEvents.length} {activeEvents.length === 1 ? 'Evento' : 'Eventos'}</span>
                  <span className="text-[10px] font-bold text-emerald-400/90 group-hover:translate-x-0.5 transition-transform">
                    Ver agenda →
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                  Stock comprometido
                </p>
              </div>
            </button>

            {/* KPI 4: Recaudado en Abonos */}
            <button 
              type="button"
              onClick={() => {
                setAdminTab('reports');
                scrollToContent();
              }}
              className={`w-full text-left p-4 rounded-2xl border shadow-lg relative overflow-hidden transition-all group ${
                adminTab === 'reports'
                  ? 'bg-[#1e132b] border-purple-400 ring-2 ring-purple-500/50 shadow-purple-500/10'
                  : 'bg-[#111622] border-slate-800 hover:border-purple-400 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 group-hover:text-purple-300 transition-colors">
                  Abonos Recibidos
                </span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-lg sm:text-xl font-black text-purple-400 tracking-tight flex items-center justify-between">
                  <span>{formatCurrency(totalCollectedDeposits)}</span>
                  <span className="text-[10px] font-bold text-purple-400/90 group-hover:translate-x-0.5 transition-transform">
                    Ver caja →
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  En caja / bancos
                </p>
              </div>
            </button>
          </>
        )}

      </div>

      {/* Contenedor Principal de Pestañas y Vistas */}
      <div id="admin-content-area" className="scroll-mt-24 space-y-6">

      {/* Módulo Header en Modo Sidebar */}
      {isSidebarMode ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
              {adminTab === 'orders' && <Inbox className="w-5 h-5" />}
              {adminTab === 'calendar' && <Calendar className="w-5 h-5" />}
              {adminTab === 'inventory' && <Package className="w-5 h-5" />}
              {adminTab === 'repairs' && <Wrench className="w-5 h-5" />}
              {adminTab === 'reports' && <BarChart3 className="w-5 h-5" />}
              {adminTab === 'landing' && <Layout className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {adminTab === 'orders' && (currentRole === 'staff' ? 'Despacho & Pedidos Activos' : 'Inbox de Pedidos & Cotizaciones')}
                {adminTab === 'calendar' && 'Calendario Maestro de Eventos'}
                {adminTab === 'inventory' && 'Inventario & Control de Stock'}
                {adminTab === 'repairs' && (currentRole === 'staff' ? 'Mi Taller Técnico' : 'Taller Técnico & Mantenimiento')}
                {adminTab === 'reports' && 'Reportes Financieros & Rentabilidad'}
                {adminTab === 'landing' && 'Editor de Tu Página Web'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {adminTab === 'orders' && 'Revisa, aprueba y controla las cotizaciones recibidas de tus clientes'}
                {adminTab === 'calendar' && 'Cronograma de fechas reservadas, montajes y entregas de sonido'}
                {adminTab === 'inventory' && 'Cabinas activas, luces, consolas y combos DJ disponibles para alquilar'}
                {adminTab === 'repairs' && 'Diagnóstico de averías, inventario de repuestos y cobro de garantías'}
                {adminTab === 'reports' && 'Balance de cobros realizados, abonos en cuenta y saldos pendientes'}
                {adminTab === 'landing' && 'Personalización de textos de portada, fotos del portafolio y redes'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sincronizado</span>
            </span>
          </div>
        </div>
      ) : (
        /* Admin Subtabs Fallback si no está el sidebar */
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 border-b border-slate-800 pb-3">
          {isTabAllowed('orders') && (
            <button
              onClick={() => setAdminTab('orders')}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                adminTab === 'orders'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>{currentRole === 'staff' ? 'Despacho & Pedidos' : 'Inbox Pedidos'}</span>
              {pendingOrders.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {pendingOrders.length}
                </span>
              )}
            </button>
          )}

          {isTabAllowed('calendar') && (
            <button
              onClick={() => setAdminTab('calendar')}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                adminTab === 'calendar'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendario</span>
            </button>
          )}

          {isTabAllowed('inventory') && (
            <button
              onClick={() => setAdminTab('inventory')}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                adminTab === 'inventory'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Inventario & Stock</span>
            </button>
          )}

          {isTabAllowed('landing') && (
            <button
              onClick={() => setAdminTab('landing')}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                adminTab === 'landing'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>Tu Página Web</span>
            </button>
          )}

          {isTabAllowed('reports') && (
            <button
              onClick={() => setAdminTab('reports')}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                adminTab === 'reports'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reportes & Finanzas</span>
            </button>
          )}

          {isTabAllowed('repairs') && (
            <button
              onClick={() => setAdminTab('repairs')}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                adminTab === 'repairs'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>{currentRole === 'staff' ? 'Mi Taller' : 'Taller & Reparaciones'}</span>
              {repairs.filter(r => r.status === 'Pendiente' || r.status === 'En Taller').length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {repairs.filter(r => r.status === 'Pendiente' || r.status === 'En Taller').length}
                </span>
              )}
            </button>
          )}
        </div>
      )}


      {/* Tab Panels */}
      {adminTab === 'orders' && (
        <OrdersInbox
          bookings={bookings}
          equipmentList={equipmentList}
          currentRole={currentRole}
          initialFilterStatus={ordersFilterStatus}
          onUpdateStatus={onUpdateBookingStatus}
          onOpenPayment={onOpenPayment}
          onOpenChecklist={onOpenChecklist}
          onOpenReceipt={onOpenReceipt}
          onSaveRepair={onSaveRepair}
        />
      )}

      {adminTab === 'calendar' && (
        <CalendarView
          bookings={bookings}
          equipmentList={equipmentList}
          currentRole={currentRole}
          onOpenPayment={onOpenPayment}
          onOpenChecklist={onOpenChecklist}
          onOpenReceipt={onOpenReceipt}
          onUpdateStatus={onUpdateBookingStatus}
        />
      )}

      {adminTab === 'inventory' && (
        <InventoryManager
          equipmentList={equipmentList}
          onSaveEquipment={onSaveEquipment}
          onDeleteEquipment={onDeleteEquipment}
          combosList={combosList}
          onSaveCombo={onSaveCombo}
          onDeleteCombo={onDeleteCombo}
        />
      )}

      {adminTab === 'landing' && (
        <LandingManager
          settings={settings}
          onSaveSettings={onSaveSettings}
          combosList={combosList}
          onSaveCombo={onSaveCombo}
          onDeleteCombo={onDeleteCombo}
        />
      )}

      {adminTab === 'reports' && (
        <FinancialReports
          bookings={bookings}
          equipmentList={equipmentList}
          combosList={combosList}
          repairs={repairs}
          payroll={payroll}
          onOpenReceivablesPayroll={onOpenReceivablesPayroll}
        />
      )}

      {adminTab === 'repairs' && (
        <RepairManager
          repairs={repairs}
          equipmentList={equipmentList}
          bookings={bookings}
          currentRole={currentRole}
          currentWorkerName={currentWorkerName}
          settings={settings}
          onSaveRepair={onSaveRepair}
          onDeleteRepair={onDeleteRepair}
          onUpdateRepairStatus={onUpdateRepairStatus}
        />
      )}

      </div>

      {/* Footer Status del Dashboard */}
      <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>
            Panel activo: <strong className="text-white">{currentWorkerName || (currentRole === 'superadmin' ? 'Dueño / Super Admin' : currentRole === 'admin' ? 'Encargado de Operaciones' : 'Staff Técnico')}</strong>
          </span>
        </div>
      </div>

    </div>
  );
}
