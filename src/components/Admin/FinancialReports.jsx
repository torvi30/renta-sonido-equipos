import React, { useState } from 'react';
import { 
  TrendingUp, DollarSign, Calendar, Package, 
  BarChart3, Award, CheckCircle2, XCircle, ArrowUpRight,
  Users, Wrench, Clock
} from 'lucide-react';
import { formatCurrency, formatDateFriendly } from '../../services/storageService';

export default function FinancialReports({ 
  bookings, 
  equipmentList, 
  repairs = [],
  payroll = [],
  onOpenReceivablesPayroll
}) {
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  // Filtrar bookings por mes si se selecciona uno
  const filteredBookings = bookings.filter(b => {
    if (selectedMonth === 'ALL') return true;
    return b.eventDate && b.eventDate.startsWith(selectedMonth);
  });

  // Métricas de Dinero
  const validBookings = filteredBookings.filter(b => b.status !== 'Cancelado');
  const totalIncomePotential = validBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalCollected = validBookings.reduce((sum, b) => sum + (b.depositAmount || 0), 0);
  const totalPending = validBookings.reduce((sum, b) => sum + (b.balanceDue || 0), 0);

  // Métricas de Nómina & Salarios al Personal
  const totalSalaries = payroll.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPendingSalaries = payroll.filter(p => p.status === 'Por Pagar').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPaidSalaries = payroll.filter(p => p.status === 'Pagado').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Métricas de Taller y Mantenimiento
  const totalRepairCosts = repairs.reduce((sum, r) => sum + (Number(r.costSpareParts) || 0), 0);
  const totalWarrantiesRecovered = repairs.filter(r => r.warrantyChargedToClient).reduce((sum, r) => sum + (Number(r.warrantyAmount) || 0), 0);
  const netMaintenanceCost = Math.max(0, totalRepairCosts - totalWarrantiesRecovered);

  // Efectividad de Cotizaciones
  const approvedCount = filteredBookings.filter(b => b.status === 'Aprobado' || b.status === 'En Evento' || b.status === 'Finalizado').length;
  const pendingCount = filteredBookings.filter(b => b.status === 'Pendiente').length;
  const cancelledCount = filteredBookings.filter(b => b.status === 'Cancelado').length;
  const totalCount = filteredBookings.length || 1;
  const conversionRate = Math.round((approvedCount / totalCount) * 100);

  // Top Equipos Más Alquilados y que Más Ingresos Generan
  const equipmentStats = equipmentList.map(eq => {
    let timesRented = 0;
    let totalGenerated = 0;

    validBookings.forEach(b => {
      b.items.forEach(it => {
        if (it.equipmentId === eq.id) {
          const qty = Number(it.quantity || 1);
          timesRented += qty;
          totalGenerated += (it.price * qty);
        }
      });
    });

    return {
      ...eq,
      timesRented,
      totalGenerated
    };
  }).sort((a, b) => b.totalGenerated - a.totalGenerated);

  const top3Equipment = equipmentStats.slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* Header with Month Filter */}
      <div className="bg-[#111622] p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              Reportes Financieros & Rendimiento de Equipos
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Analiza cuánto has facturado, qué equipos son los más rentables y tu tasa de cierre de clientes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Filtrar Mes:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-bold text-amber-400 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todo el Historial</option>
            <option value="2026-10">Octubre 2026</option>
            <option value="2026-11">Noviembre 2026</option>
            <option value="2026-12">Diciembre 2026 (Temporada)</option>
          </select>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Facturado */}
        <div className="bg-[#111622] p-4 sm:p-5 rounded-3xl border border-slate-800 relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">
              Valor Contratado
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-3 tracking-tight">
            {formatCurrency(totalIncomePotential)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            En {validBookings.length} eventos registrados
          </p>
        </div>

        {/* Abonos Recaudados */}
        <div className="bg-[#111622] p-4 sm:p-5 rounded-3xl border border-emerald-500/30 relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">
              Caja / Bancos
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-3 tracking-tight">
            {formatCurrency(totalCollected)}
          </h3>
          <p className="text-[11px] text-emerald-300/80 mt-1">
            Abonos ya recibidos
          </p>
        </div>

        {/* Saldos por Cobrar (Interactivo) */}
        <div 
          onClick={() => onOpenReceivablesPayroll && onOpenReceivablesPayroll('receivables')}
          className="bg-[#111622] p-4 sm:p-5 rounded-3xl border border-amber-500/40 relative overflow-hidden shadow-lg cursor-pointer hover:border-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400 group-hover:text-amber-300 transition-colors">
              Saldos por Cobrar
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-amber-400 mt-3 tracking-tight flex items-center justify-between">
            <span>{formatCurrency(totalPending)}</span>
            <span className="text-[10px] font-bold text-amber-400/90 group-hover:translate-x-0.5 transition-transform">
              Cobrar →
            </span>
          </h3>
          <p className="text-[11px] text-amber-300/80 mt-1">
            {validBookings.filter(b => (b.balanceDue || 0) > 0).length} clientes con saldo (Gestionar)
          </p>
        </div>

        {/* Nómina & Salarios Personal (Interactivo) */}
        <div 
          onClick={() => onOpenReceivablesPayroll && onOpenReceivablesPayroll('payroll')}
          className="bg-[#111622] p-4 sm:p-5 rounded-3xl border border-purple-500/40 relative overflow-hidden shadow-lg cursor-pointer hover:border-purple-400 hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400 group-hover:text-purple-300 transition-colors">
              Nómina & Salarios
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-purple-400 mt-3 tracking-tight flex items-center justify-between">
            <span>{formatCurrency(totalPaidSalaries)}</span>
            <span className="text-[10px] font-bold text-purple-400/90 group-hover:translate-x-0.5 transition-transform">
              Ver →
            </span>
          </h3>
          <p className="text-[11px] text-purple-300/80 mt-1">
            Por pagar: {formatCurrency(totalPendingSalaries)} (Gestionar)
          </p>
        </div>

        {/* Gasto en Taller & Repuestos */}
        <div className="bg-[#111622] p-4 sm:p-5 rounded-3xl border border-rose-500/30 relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">
              Gastos de Taller
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-rose-400 mt-3 tracking-tight">
            {formatCurrency(totalRepairCosts)}
          </h3>
          <p className="text-[11px] text-cyan-400 mt-1">
            Garantías: {formatCurrency(totalWarrantiesRecovered)}
          </p>
        </div>

      </div>

      {/* Grid: Conversion Rate + Top Equipment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tasa de Cierre de Cotizaciones */}
        <div className="bg-[#111622] p-5 rounded-3xl border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight uppercase">
              Efectividad de Ventas (Conversión)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Porcentaje de cotizaciones de WhatsApp que se convierten en alquileres reales.
            </p>

            <div className="my-6 text-center">
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-amber-500/30 bg-slate-900 shadow-inner">
                <span className="text-3xl font-black text-amber-400">
                  {conversionRate}%
                </span>
              </div>
              <p className="text-xs font-bold text-slate-300 mt-2">
                Tasa de Aprobación
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-xl">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprobados / Realizados:
                </span>
                <span className="font-bold text-white">{approvedCount}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-xl">
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Calendar className="w-3.5 h-3.5" /> Pendientes de Confirmar:
                </span>
                <span className="font-bold text-white">{pendingCount}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-xl">
                <span className="flex items-center gap-1.5 text-red-400 font-semibold">
                  <XCircle className="w-3.5 h-3.5" /> Cancelados:
                </span>
                <span className="font-bold text-white">{cancelledCount}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 text-[11px] text-slate-400 border border-slate-800">
            💡 <em>Consejo pro:</em> Usa las plantillas de recordatorio por WhatsApp para aumentar la tasa de cierre de los pedidos pendientes.
          </div>
        </div>

        {/* Top Equipos Más Rentables */}
        <div className="lg:col-span-2 bg-[#111622] p-5 rounded-3xl border border-slate-800 shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight uppercase flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Equipos Más Rentables (Ranking de Ingresos)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Los equipos que más dinero han generado en el período seleccionado.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {top3Equipment.map((eq, idx) => (
              <div
                key={eq.id}
                className="flex items-center justify-between gap-3 bg-slate-900/90 p-3 sm:p-3.5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                    idx === 0 
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                      : idx === 1
                      ? 'bg-slate-300 text-black'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    #{idx + 1}
                  </span>

                  <img
                    src={eq.imageUrl}
                    alt={eq.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-950 flex-shrink-0 border border-slate-800"
                  />

                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                      {eq.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 block">
                      Alquilado {eq.timesRented} {eq.timesRented === 1 ? 'vez' : 'veces'} • {formatCurrency(eq.pricePerDay)}/día
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Facturado:
                  </span>
                  <span className="text-sm sm:text-base font-black text-amber-400">
                    {formatCurrency(eq.totalGenerated)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* All equipment table toggle or detail */}
          <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400">
            <span>Mostrando los 4 equipos con mayor facturación</span>
            <span className="text-emerald-400 font-semibold">Total catálogo: {equipmentList.length} equipos</span>
          </div>

        </div>

      </div>

    </div>
  );
}
