import React, { useState } from 'react';
import { 
  Inbox, Calendar, Package, DollarSign, AlertTriangle, 
  TrendingUp, Clock, CheckCircle2, ShieldCheck, Flame 
} from 'lucide-react';
import OrdersInbox from './OrdersInbox';
import CalendarView from './CalendarView';
import InventoryManager from './InventoryManager';
import LandingManager from './LandingManager';
import { formatCurrency } from '../../services/storageService';
import { Layout } from 'lucide-react';

export default function AdminDashboard({
  bookings,
  equipmentList,
  settings,
  onSaveSettings,
  combosList,
  onSaveCombo,
  onDeleteCombo,
  onUpdateBookingStatus,
  onOpenPayment,
  onOpenChecklist,
  onOpenReceipt,
  onSaveEquipment,
  onDeleteEquipment
}) {
  const [adminTab, setAdminTab] = useState('orders'); // 'orders', 'calendar', 'inventory', 'landing'


  // KPI Calculations
  const pendingOrders = bookings.filter(b => b.status === 'Pendiente');
  const activeEvents = bookings.filter(b => b.status === 'Aprobado' || b.status === 'En Evento');
  
  const totalPendingBalance = bookings
    .filter(b => b.status !== 'Cancelado' && b.status !== 'Finalizado')
    .reduce((sum, b) => sum + (b.balanceDue || 0), 0);

  const totalCollectedDeposits = bookings
    .filter(b => b.status !== 'Cancelado')
    .reduce((sum, b) => sum + (b.depositAmount || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* KPI Top Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1: Saldos por Cobrar */}
        <div className="bg-[#111622] p-4 rounded-2xl border border-amber-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">
              Saldos por Cobrar
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg sm:text-xl font-black text-amber-400 tracking-tight">
              {formatCurrency(totalPendingBalance)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Por cobrar en eventos
            </p>
          </div>
        </div>

        {/* KPI 2: Cotizaciones Pendientes */}
        <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">
              Nuevas Cotizaciones
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {pendingOrders.length} {pendingOrders.length === 1 ? 'Pedido' : 'Pedidos'}
            </h3>
            <p className="text-[10px] text-cyan-400 font-semibold mt-0.5">
              Esperando aprobación
            </p>
          </div>
        </div>

        {/* KPI 3: Eventos Activos */}
        <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">
              Eventos en Curso
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {activeEvents.length} {activeEvents.length === 1 ? 'Evento' : 'Eventos'}
            </h3>
            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
              Stock comprometido
            </p>
          </div>
        </div>

        {/* KPI 4: Recaudado en Abonos */}
        <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">
              Abonos Recibidos
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg sm:text-xl font-black text-purple-400 tracking-tight">
              {formatCurrency(totalCollectedDeposits)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              En caja / bancos
            </p>
          </div>
        </div>

      </div>

      {/* Admin Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setAdminTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            adminTab === 'orders'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Inbox de Pedidos</span>
          {pendingOrders.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            adminTab === 'calendar'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendario Maestro</span>
        </button>

        <button
          onClick={() => setAdminTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            adminTab === 'inventory'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Inventario & Stock</span>
        </button>

        <button
          onClick={() => setAdminTab('landing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            adminTab === 'landing'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>🎨 Tu Página Web</span>
        </button>
      </div>

      {/* Tab Panels */}
      {adminTab === 'orders' && (
        <OrdersInbox
          bookings={bookings}
          onUpdateStatus={onUpdateBookingStatus}
          onOpenPayment={onOpenPayment}
          onOpenChecklist={onOpenChecklist}
          onOpenReceipt={onOpenReceipt}
        />
      )}

      {adminTab === 'calendar' && (
        <CalendarView
          bookings={bookings}
          equipmentList={equipmentList}
        />
      )}

      {adminTab === 'inventory' && (
        <InventoryManager
          equipmentList={equipmentList}
          onSaveEquipment={onSaveEquipment}
          onDeleteEquipment={onDeleteEquipment}
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


    </div>
  );
}
