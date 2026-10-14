import { useState, useMemo } from 'react';
import { 
  TrendingUp, DollarSign, Calendar, Package, 
  BarChart3, Award, CheckCircle2, XCircle, ArrowUpRight,
  Users, Clock, Sparkles, Flame, 
  Copy, Check, PieChart, Wallet, 
  Receipt, Landmark, BadgeCheck
} from 'lucide-react';
import { formatCurrency } from '../../services/storageService';
import { showAlert } from '../../services/alertService';

export default function FinancialReports({ 
  bookings = [], 
  equipmentList = [], 
  combosList = [],
  repairs = [],
  payroll = [],
  onOpenReceivablesPayroll
}) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('ALL'); // 'ALL' | 'THIS_MONTH' | '30_DAYS' | 'PEAK_SEASON' | custom YYYY-MM
  const [rankingTab, setRankingTab] = useState('equipment'); // 'equipment' | 'combos'
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [copiedBalance, setCopiedBalance] = useState(false);

  // Fecha actual de referencia memorizada
  const today = useMemo(() => new Date(), []);
  const currentMonthStr = useMemo(() => {
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  }, [today]);
  const currentYear = useMemo(() => today.getFullYear(), [today]);

  // Filtrado dinámico de reservas según timeframe
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (!b.eventDate) return false;
      if (selectedTimeframe === 'ALL') return true;
      if (selectedTimeframe === 'THIS_MONTH') return b.eventDate.startsWith(currentMonthStr);
      if (selectedTimeframe === 'PEAK_SEASON') {
        return b.eventDate.startsWith(`${currentYear}-11`) || b.eventDate.startsWith(`${currentYear}-12`);
      }
      if (selectedTimeframe === '30_DAYS') {
        const diffDays = (new Date(b.eventDate) - today) / (1000 * 60 * 60 * 24);
        return diffDays >= -30 && diffDays <= 30;
      }
      // Mes específico YYYY-MM
      return b.eventDate.startsWith(selectedTimeframe);
    });
  }, [bookings, selectedTimeframe, currentMonthStr, currentYear, today]);

  // Cálculos Maestros de Dinero
  const validBookings = useMemo(() => filteredBookings.filter(b => b.status !== 'Cancelado'), [filteredBookings]);
  const totalIncomePotential = validBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
  const totalCollected = validBookings.reduce((sum, b) => sum + (Number(b.depositAmount) || 0), 0);
  const totalPending = validBookings.reduce((sum, b) => sum + (Number(b.balanceDue) || 0), 0);
  const collectionRate = totalIncomePotential > 0 ? Math.round((totalCollected / totalIncomePotential) * 100) : 0;
  const averageTicket = validBookings.length > 0 ? Math.round(totalIncomePotential / validBookings.length) : 0;

  // Métricas de Nómina & Salarios de Personal
  const totalSalaries = payroll.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPaidSalaries = payroll.filter(p => p.status === 'Pagado').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPendingSalaries = payroll.filter(p => p.status === 'Por Pagar').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Métricas de Taller y Mantenimiento
  const totalRepairCosts = repairs.reduce((sum, r) => sum + (Number(r.costSpareParts) || 0), 0);
  const totalWarrantiesRecovered = repairs.filter(r => r.warrantyChargedToClient).reduce((sum, r) => sum + (Number(r.warrantyAmount) || 0), 0);
  const netMaintenanceCost = Math.max(0, totalRepairCosts - totalWarrantiesRecovered);

  // Utilidad Neta Real del Negocio (EBITDA / Ganancia Libre de Bolsillo)
  const totalOperationalCosts = totalSalaries + netMaintenanceCost;
  const netProfit = Math.max(0, totalIncomePotential - totalOperationalCosts);
  const netMarginPercent = totalIncomePotential > 0 ? Math.round((netProfit / totalIncomePotential) * 100) : 100;

  // Efectividad Comercial (Conversión de Cotizaciones)
  const approvedCount = filteredBookings.filter(b => b.status === 'Aprobado' || b.status === 'En Evento' || b.status === 'Finalizado').length;
  const pendingCount = filteredBookings.filter(b => b.status === 'Pendiente').length;
  const cancelledCount = filteredBookings.filter(b => b.status === 'Cancelado').length;
  const totalQuotesCount = filteredBookings.length || 1;
  const conversionRate = Math.round((approvedCount / totalQuotesCount) * 100);

  // Generar meses para el gráfico interactivo (últimos 6 meses hasta el fin de año)
  const monthlyChartData = useMemo(() => {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthsToShow = [6, 7, 8, 9, 10, 11]; // Jul a Dic

    return monthsToShow.map(mIndex => {
      const monthKey = `${currentYear}-${String(mIndex + 1).padStart(2, '0')}`;
      const mBookings = bookings.filter(b => b.eventDate && b.eventDate.startsWith(monthKey) && b.status !== 'Cancelado');
      const gross = mBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
      const collected = mBookings.reduce((sum, b) => sum + (Number(b.depositAmount) || 0), 0);
      const pending = mBookings.reduce((sum, b) => sum + (Number(b.balanceDue) || 0), 0);

      return {
        key: monthKey,
        label: `${monthNames[mIndex]} ${currentYear}`,
        shortLabel: monthNames[mIndex],
        gross,
        collected,
        pending,
        count: mBookings.length,
        isCurrentMonth: monthKey === currentMonthStr
      };
    });
  }, [bookings, currentMonthStr, currentYear]);

  const maxMonthGross = useMemo(() => {
    const maxVal = Math.max(...monthlyChartData.map(m => m.gross), 1500000);
    return maxVal;
  }, [monthlyChartData]);

  // Desglose de ingresos por categoría
  const categoryBreakdown = useMemo(() => {
    const categoryTotals = {};
    const defaultCategories = ['Consolas y DJ', 'Cabinas y Sonido', 'Iluminación y Efectos', 'Combos y Paquetes', 'Microfonía'];
    defaultCategories.forEach(c => { categoryTotals[c] = { total: 0, count: 0 }; });

    validBookings.forEach(b => {
      b.items.forEach(it => {
        // Detectar si es combo
        if (it.isCombo || it.id?.startsWith('combo-')) {
          categoryTotals['Combos y Paquetes'].total += (Number(it.price) || 0) * (Number(it.quantity) || 1);
          categoryTotals['Combos y Paquetes'].count += Number(it.quantity || 1);
        } else {
          // Buscar equipo
          const eq = equipmentList.find(e => e.id === (it.equipmentId || it.id));
          const cat = eq?.category || 'Consolas y DJ';
          const normalizedCat = cat.includes('DJ') ? 'Consolas y DJ' 
            : (cat.includes('Cabina') || cat.includes('Bajo') || cat.includes('Sonido')) ? 'Cabinas y Sonido'
            : (cat.includes('Iluminación') || cat.includes('Luz') || cat.includes('Efecto')) ? 'Iluminación y Efectos'
            : (cat.includes('Micrófono')) ? 'Microfonía' : 'Consolas y DJ';

          if (!categoryTotals[normalizedCat]) categoryTotals[normalizedCat] = { total: 0, count: 0 };
          categoryTotals[normalizedCat].total += (Number(it.price) || 0) * (Number(it.quantity) || 1);
          categoryTotals[normalizedCat].count += Number(it.quantity || 1);
        }
      });
    });

    const totalCatsRevenue = Object.values(categoryTotals).reduce((sum, c) => sum + c.total, 0) || 1;
    const colors = {
      'Consolas y DJ': { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30', stroke: '#f59e0b' },
      'Cabinas y Sonido': { text: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500/30', stroke: '#06b6d4' },
      'Iluminación y Efectos': { text: 'text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500/30', stroke: '#a855f7' },
      'Combos y Paquetes': { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/30', stroke: '#10b981' },
      'Microfonía': { text: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500/30', stroke: '#f43f5e' }
    };

    return Object.entries(categoryTotals).map(([name, data]) => {
      const percentage = Math.round((data.total / totalCatsRevenue) * 100);
      return {
        name,
        total: data.total,
        count: data.count,
        percentage,
        colors: colors[name] || colors['Consolas y DJ']
      };
    }).sort((a, b) => b.total - a.total);
  }, [validBookings, equipmentList]);

  // Ranking de Equipos Individuales
  const equipmentStats = useMemo(() => {
    return equipmentList.map(eq => {
      let timesRented = 0;
      let totalGenerated = 0;

      validBookings.forEach(b => {
        b.items.forEach(it => {
          if (it.equipmentId === eq.id || it.id === eq.id) {
            const qty = Number(it.quantity || 1);
            timesRented += qty;
            totalGenerated += (Number(it.price || eq.pricePerDay || 0) * qty);
          }
        });
      });

      const revenueShare = totalIncomePotential > 0 ? Math.round((totalGenerated / totalIncomePotential) * 100) : 0;

      return {
        ...eq,
        timesRented,
        totalGenerated,
        revenueShare
      };
    }).sort((a, b) => b.totalGenerated - a.totalGenerated);
  }, [equipmentList, validBookings, totalIncomePotential]);

  // Ranking de Combos
  const comboStats = useMemo(() => {
    return combosList.map(combo => {
      let timesRented = 0;
      let totalGenerated = 0;

      validBookings.forEach(b => {
        b.items.forEach(it => {
          if (it.id === combo.id || it.name === combo.name) {
            const qty = Number(it.quantity || 1);
            timesRented += qty;
            totalGenerated += (Number(it.price || combo.discountPrice || combo.pricePerDay) * qty);
          }
        });
      });

      const revenueShare = totalIncomePotential > 0 ? Math.round((totalGenerated / totalIncomePotential) * 100) : 0;

      return {
        ...combo,
        timesRented,
        totalGenerated,
        revenueShare
      };
    }).sort((a, b) => b.totalGenerated - a.totalGenerated);
  }, [combosList, validBookings, totalIncomePotential]);

  // Función para copiar informe ejecutivo
  const handleCopyFinancialSummary = () => {
    const text = `📊 *RESUMEN FINANCIERO EJECUTIVO - SOUND CONTROL PRO* 🎧\n\n` +
      `📅 *Período:* ${selectedTimeframe === 'ALL' ? 'Historial Completo' : selectedTimeframe}\n` +
      `💰 *Total Facturado:* ${formatCurrency(totalIncomePotential)}\n` +
      `💵 *Caja Real Recaudada:* ${formatCurrency(totalCollected)} (${collectionRate}%)\n` +
      `⏳ *Saldos por Cobrar en Locación:* ${formatCurrency(totalPending)}\n` +
      `👥 *Nómina de Personal:* ${formatCurrency(totalPaidSalaries)} pagado (${formatCurrency(totalPendingSalaries)} pendiente)\n` +
      `🔧 *Mantenimiento y Taller:* ${formatCurrency(totalRepairCosts)} (Garantías recuperadas: ${formatCurrency(totalWarrantiesRecovered)})\n` +
      `💎 *Utilidad Neta Libre:* ${formatCurrency(netProfit)} (Margen: ${netMarginPercent}%)\n` +
      `🎯 *Tasa de Conversión:* ${conversionRate}% (${approvedCount} eventos confirmados / ${totalQuotesCount} cotizaciones)\n\n` +
      `_Generado desde el Panel de Control Antigravity._`;

    navigator.clipboard.writeText(text);
    setCopiedBalance(true);
    setTimeout(() => setCopiedBalance(false), 3000);
    showAlert({
      title: '¡Resumen Copiado!',
      text: 'El reporte financiero ha sido copiado al portapapeles listo para enviar por WhatsApp.',
      icon: 'success'
    });
  };

  // Cálculo de circunferencia para el Radial Gauge de conversión
  const gaugeRadius = 42;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCircumference - (conversionRate / 100) * gaugeCircumference;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* ============================================================== */}
      {/* 1. TOP HEADER & ADVANCED TIMEFRAME SELECTOR */}
      {/* ============================================================== */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0d1322] via-[#10182b] to-[#0c1220] border border-slate-800 p-5 sm:p-7 shadow-2xl overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-0 w-80 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <BarChart3 className="w-3.5 h-3.5" />
                Business Intelligence Pro
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-900/90 border border-slate-800 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Métricas en Tiempo Real</span>
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Reportes Financieros & Rendimiento de Equipos
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Analiza el flujo de caja, la efectividad comercial de cotizaciones, saldos por cobrar y rentabilidad neta de cada equipo.
            </p>
          </div>

          {/* Quick Controls & Timeframe Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setSelectedTimeframe('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTimeframe === 'ALL'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Historial
              </button>
              <button
                onClick={() => setSelectedTimeframe('THIS_MONTH')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTimeframe === 'THIS_MONTH'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Este Mes
              </button>
              <button
                onClick={() => setSelectedTimeframe('PEAK_SEASON')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTimeframe === 'PEAK_SEASON'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Temporada Alta 🎄
              </button>
            </div>

            {/* Custom Month Dropdown */}
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs font-bold text-amber-400 rounded-xl px-3 py-2 focus:outline-none cursor-pointer shadow-sm hover:border-amber-500/50"
            >
              <option value="ALL">Todo el Historial</option>
              <option value="THIS_MONTH">Octubre 2026 (Actual)</option>
              <option value="2026-11">Noviembre 2026</option>
              <option value="2026-12">Diciembre 2026</option>
              <option value="30_DAYS">Últimos 30 Días</option>
              <option value="PEAK_SEASON">Temporada Nov - Dic</option>
            </select>

            {/* Copy Executive Report Button */}
            <button
              onClick={handleCopyFinancialSummary}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Copiar balance ejecutivo para WhatsApp"
            >
              {copiedBalance ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar Balance</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MASTER EXECUTIVE KPI CARDS (THE "COSA LOCA" TOP STATS) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* KPI 1: Facturación Bruta Contratada */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#141a29] to-[#0f1422] border border-amber-500/30 p-5 shadow-xl hover:border-amber-500/60 transition-all duration-300 group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 group-hover:text-amber-300 transition-colors">
              Valor Contratado
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatCurrency(totalIncomePotential)}
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                {validBookings.length} eventos
              </span>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                Prom: {formatCurrency(averageTicket)}
              </span>
            </div>
          </div>

          {/* Subtítulo informativo */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            Total acumulado en cotizaciones confirmadas
          </div>
        </div>

        {/* KPI 2: Dinero en Caja & Bancos (Recaudado Efectivo) */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#10221e] to-[#0c1815] border border-emerald-500/30 p-5 shadow-xl hover:border-emerald-500/60 transition-all duration-300 group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300/80">
              Caja & Bancos (Abonos)
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              {formatCurrency(totalCollected)}
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                {collectionRate}% recaudado
              </span>
              <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                Líquido
              </span>
            </div>
          </div>

          {/* Barra de progreso de recaudo */}
          <div className="mt-3 pt-2.5 border-t border-emerald-950/80">
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, collectionRate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3: Saldos Pendientes en Sitio (Interactivo con Botón de Cobro) */}
        <div 
          onClick={() => onOpenReceivablesPayroll && onOpenReceivablesPayroll('receivables')}
          className="relative rounded-3xl bg-gradient-to-b from-[#221c10] to-[#17130a] border border-amber-500/50 p-5 shadow-xl hover:border-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/15 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/25 transition-all" />

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>Saldos por Cobrar</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500/30 transition-all">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight flex items-center justify-between">
              <span>{formatCurrency(totalPending)}</span>
              <ArrowUpRight className="w-5 h-5 text-amber-400/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-amber-200/90 font-medium">
                {validBookings.filter(b => (b.balanceDue || 0) > 0).length} clientes pendientes
              </span>
              <span className="text-[10px] font-black text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-lg border border-amber-400/30">
                Cobrar en Sitio ⚡
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-amber-900/50 text-[11px] text-amber-300/80 flex items-center justify-between">
            <span>Haz clic para gestionar cobros</span>
            <span className="font-bold text-amber-400">Ver lista →</span>
          </div>
        </div>

        {/* KPI 4: Utilidad Neta Real Estimada */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#10192e] to-[#0a1120] border border-cyan-500/30 p-5 shadow-xl hover:border-cyan-500/60 transition-all duration-300 group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
              Utilidad Neta Libre
            </span>
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight">
              {formatCurrency(netProfit)}
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-cyan-200/90 font-medium">
                Margen operativo
              </span>
              <span className="text-[11px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                {netMarginPercent}% Rentable
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            Descontando nómina ({formatCurrency(totalSalaries)}) y taller
          </div>
        </div>

        {/* KPI 5: Nómina & Colaboradores (Interactivo) */}
        <div 
          onClick={() => onOpenReceivablesPayroll && onOpenReceivablesPayroll('payroll')}
          className="relative rounded-3xl bg-gradient-to-b from-[#1e142e] to-[#140c20] border border-purple-500/40 p-5 shadow-xl hover:border-purple-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/15 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/25 transition-all" />

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-300">
              Nómina & DJs Staff
            </span>
            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30 group-hover:bg-purple-500/30 transition-all">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-purple-400 tracking-tight flex items-center justify-between">
              <span>{formatCurrency(totalPaidSalaries)}</span>
              <ArrowUpRight className="w-5 h-5 text-purple-400/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-purple-300/90 font-medium">
                Por pagar: {formatCurrency(totalPendingSalaries)}
              </span>
              <span className="text-[10px] font-black text-purple-400 bg-purple-400/20 px-2 py-0.5 rounded-lg border border-purple-400/30">
                Liquidaciones →
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-purple-900/50 text-[11px] text-purple-300/80 flex items-center justify-between">
            <span>{payroll.filter(p => p.status === 'Por Pagar').length} salarios pendientes</span>
            <span className="font-bold text-purple-400">Ver nómina →</span>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 3. INTERACTIVE VISUAL CHARTS ROW (DUAL BAR + CATEGORY DONUT) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: EVOLUCIÓN MENSUAL DE FACTURACIÓN & RECAUDO (2 COLS) */}
        <div className="lg:col-span-2 rounded-3xl bg-[#111622] border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Evolución de Facturación & Cobros Mensuales
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparativa de valor contratado (Ámbar) vs dinero efectivamente recaudado en caja (Verde)
                </p>
              </div>

              {/* Leyenda del gráfico */}
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-3 rounded-md bg-amber-500 shadow-sm" />
                  <span>Contratado</span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-sm" />
                  <span>Recaudado</span>
                </span>
              </div>
            </div>

            {/* Visual SVG Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="h-56 sm:h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
                {monthlyChartData.map((item) => {
                  const grossHeightPct = Math.max(8, Math.round((item.gross / maxMonthGross) * 100));
                  const collectedHeightPct = Math.max(6, Math.round((item.collected / maxMonthGross) * 100));
                  const isHovered = hoveredMonth === item.key;
                  const isSelected = selectedTimeframe === item.key;

                  return (
                    <div 
                      key={item.key}
                      onMouseEnter={() => setHoveredMonth(item.key)}
                      onMouseLeave={() => setHoveredMonth(null)}
                      onClick={() => setSelectedTimeframe(item.key)}
                      className={`flex-1 flex flex-col items-center justify-end h-full cursor-pointer group relative p-1 rounded-2xl transition-all ${
                        isSelected ? 'bg-amber-500/10 ring-1 ring-amber-500/40' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      {/* Hover Tooltip Floating Card */}
                      {isHovered && (
                        <div className="absolute -top-20 z-30 bg-slate-950 border border-slate-700 p-2.5 rounded-2xl shadow-2xl text-[11px] whitespace-nowrap animate-fade-in pointer-events-none">
                          <p className="font-extrabold text-white text-xs mb-1">{item.label}</p>
                          <div className="flex items-center justify-between gap-3 text-amber-400">
                            <span>Contratado:</span>
                            <span className="font-bold">{formatCurrency(item.gross)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-emerald-400">
                            <span>Cobrado:</span>
                            <span className="font-bold">{formatCurrency(item.collected)}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-800">
                            {item.count} {item.count === 1 ? 'evento registrado' : 'eventos registrados'}
                          </div>
                        </div>
                      )}

                      {/* Month Bars Container */}
                      <div className="w-full max-w-[50px] flex items-end justify-center gap-1.5 h-full pb-2">
                        {/* Bar 1: Gross Revenue */}
                        <div 
                          className="w-1/2 rounded-t-xl bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 transition-all duration-500 group-hover:brightness-125 shadow-lg shadow-amber-500/10"
                          style={{ height: `${grossHeightPct}%` }}
                        />
                        {/* Bar 2: Collected Cash */}
                        <div 
                          className="w-1/2 rounded-t-xl bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 transition-all duration-500 group-hover:brightness-125 shadow-lg shadow-emerald-500/10"
                          style={{ height: `${collectedHeightPct}%` }}
                        />
                      </div>

                      {/* Month Label */}
                      <span className={`text-[11px] font-black uppercase transition-colors ${
                        item.isCurrentMonth ? 'text-amber-400' : isSelected ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      }`}>
                        {item.shortLabel}
                      </span>
                      {item.isCurrentMonth && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <span>💡 Haz clic en cualquier barra de mes para filtrar los reportes a ese período.</span>
            <span className="font-semibold text-amber-400">Proyección Temporada Alta: Activa</span>
          </div>
        </div>

        {/* CHART 2: PARTICIPACIÓN POR CATEGORÍA & SERVICIO (1 COL) */}
        <div className="rounded-3xl bg-[#111622] border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Ingresos x Categoría
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                Mix de Negocio
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2 mb-4">
              Distribución de ingresos generados según el tipo de servicio o equipamiento.
            </p>

            {/* List of categories with progress bars */}
            <div className="space-y-3.5">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.colors.bg}`} />
                      <span>{cat.name}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">
                        {formatCurrency(cat.total)}
                      </span>
                      <span className={`font-black text-xs ${cat.colors.text}`}>
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                    <div 
                      className={`h-full ${cat.colors.bg} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.max(4, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Categoría líder: <strong className="text-amber-400">{categoryBreakdown[0]?.name || 'Consolas'}</strong></span>
            <span className="text-emerald-400 font-bold">{categoryBreakdown[0]?.percentage || 0}% de la caja</span>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 4. SALES FUNNEL RADAR & PRO RANKING OF EQUIPMENT / COMBOS */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COL 1: EMBUDO DE CONVERSIÓN & VELOCIDAD COMERCIAL */}
        <div className="rounded-3xl bg-[#111622] border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Embudo de Conversión Comercial
              </h3>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                WhatsApp ➔ Venta
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Porcentaje de clientes que cotizan en la web y terminan contratando el sonido.
            </p>

            {/* Circular Neon Radial Gauge */}
            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r={gaugeRadius}
                    className="text-slate-800"
                    strokeWidth="9"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Animated Foreground Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r={gaugeRadius}
                    stroke="url(#conversionGradient)"
                    strokeWidth="9"
                    strokeDasharray={gaugeCircumference}
                    strokeDashoffset={gaugeOffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="conversionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-white tracking-tight">
                    {conversionRate}%
                  </span>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    Efectividad
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-300 mt-2">
                {conversionRate >= 70 ? '🔥 Tasa de Cierre Extraordinaria' : '⚡ Tasa de Cierre Estable'}
              </span>
            </div>

            {/* Funnel Stages Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
                <span className="flex items-center gap-2 font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprobados / Montados:</span>
                </span>
                <span className="font-black text-white">{approvedCount} eventos</span>
              </div>

              <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
                <span className="flex items-center gap-2 font-semibold text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span>Pendientes de Abono:</span>
                </span>
                <span className="font-black text-white">{pendingCount} cotizaciones</span>
              </div>

              <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
                <span className="flex items-center gap-2 font-semibold text-rose-400">
                  <XCircle className="w-4 h-4" />
                  <span>Cancelados / No Concretados:</span>
                </span>
                <span className="font-black text-white">{cancelledCount} pedidos</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            💡 <strong>Estrategia DJ:</strong> Cuando un cliente cotice por WhatsApp, envía de inmediato el comprobante con el botón de abono del 50% para congelar la fecha.
          </div>
        </div>

        {/* COL 2 & 3: LEADERBOARD "HALL OF FAME" EQUIPOS Y COMBOS (2 COLS) */}
        <div className="lg:col-span-2 rounded-3xl bg-[#111622] border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Ranking de Equipos & Paquetes Más Rentables
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Los equipos que generan mayor facturación y retorno de inversión en el negocio.
                </p>
              </div>

              {/* Tab Selector: Equipos vs Combos */}
              <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setRankingTab('equipment')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    rankingTab === 'equipment'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔊 Equipos Individuales ({equipmentStats.length})
                </button>
                <button
                  onClick={() => setRankingTab('combos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    rankingTab === 'combos'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🎁 Combos DJ ({comboStats.length})
                </button>
              </div>
            </div>

            {/* List of Ranked Items */}
            <div className="mt-4 space-y-3">
              {rankingTab === 'equipment' ? (
                equipmentStats.slice(0, 5).map((eq, idx) => (
                  <div
                    key={eq.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 hover:bg-slate-900 p-3.5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Rank Medal */}
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 shadow-md ${
                        idx === 0 
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black font-extrabold ring-2 ring-amber-400/50' 
                          : idx === 1
                          ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-black'
                          : idx === 2
                          ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-200'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        #{idx + 1}
                      </span>

                      {/* Equipment Image with fallback */}
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0">
                        <img
                          src={eq.imageUrl}
                          alt={eq.name}
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80";
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-white text-xs sm:text-sm truncate">
                            {eq.name}
                          </h4>
                          {eq.isDjService && (
                            <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              🎧 Show DJ
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>Alquilado <strong>{eq.timesRented}</strong> veces</span>
                          <span>•</span>
                          <span>{formatCurrency(eq.pricePerDay)}/día</span>
                          {eq.revenueShare > 0 && (
                            <span className="text-emerald-400 font-bold">
                              ({eq.revenueShare}% de la facturación)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Revenue Display & Progress Indicator */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0 flex-shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Total Facturado
                      </span>
                      <span className="text-base sm:text-lg font-black text-amber-400">
                        {formatCurrency(eq.totalGenerated)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                comboStats.slice(0, 5).map((combo, idx) => (
                  <div
                    key={combo.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 hover:bg-slate-900 p-3.5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 shadow-md ${
                        idx === 0 
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black font-extrabold ring-2 ring-amber-400/50' 
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        #{idx + 1}
                      </span>

                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex-shrink-0">
                        <Package className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-extrabold text-white text-xs sm:text-sm truncate">
                          {combo.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>Contratado <strong>{combo.timesRented}</strong> veces</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{combo.tag || 'Solución Completa'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0 flex-shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Facturado en Paquetes
                      </span>
                      <span className="text-base sm:text-lg font-black text-amber-400">
                        {formatCurrency(combo.totalGenerated)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Leaderboard Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <span>Mostrando el Top 5 de mayor rendimiento económico</span>
            <span className="text-cyan-400 font-semibold">Total catálogo: {equipmentList.length} equipos activos</span>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 5. FINANCIAL HEALTH & WORKSHOP/SALARIES QUICK ACTION CALLOUTS */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Callout 1: Cartera & Cobro Rápido */}
        <div className="rounded-3xl bg-gradient-to-r from-[#17130a] to-[#120f08] border border-amber-500/40 p-5 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">
                Gestión de Cuentas por Cobrar
              </h4>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Tienes <strong className="text-amber-400">{formatCurrency(totalPending)}</strong> pendientes por recaudar al momento del montaje en eventos.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenReceivablesPayroll && onOpenReceivablesPayroll('receivables')}
            className="flex-shrink-0 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 whitespace-nowrap"
          >
            Cobrar Saldos →
          </button>
        </div>

        {/* Callout 2: Nómina & Pagos de Personal */}
        <div className="rounded-3xl bg-gradient-to-r from-[#170e24] to-[#100a1a] border border-purple-500/40 p-5 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex-shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">
                Control de Nómina & Salarios
              </h4>
              <p className="text-xs text-purple-200/80 mt-0.5">
                Salarios pagados: <strong className="text-purple-300">{formatCurrency(totalPaidSalaries)}</strong> | Por liquidar: <strong className="text-amber-400">{formatCurrency(totalPendingSalaries)}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenReceivablesPayroll && onOpenReceivablesPayroll('payroll')}
            className="flex-shrink-0 bg-purple-500 hover:bg-purple-400 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95 whitespace-nowrap"
          >
            Gestionar Nómina →
          </button>
        </div>

      </div>

    </div>
  );
}
