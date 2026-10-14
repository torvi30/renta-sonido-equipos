import { 
  Inbox, Calendar, Package, Wrench, BarChart3, Layout, 
  KeyRound, SlidersHorizontal, Eye, LogOut, ShieldCheck, 
  Crown, Zap, ChevronRight, X, DollarSign
} from 'lucide-react';

export default function AdminSidebar({
  adminTab,
  setAdminTab,
  currentRole = 'superadmin',
  currentWorkerName = '',
  settings,
  pendingOrdersCount = 0,
  activeRepairsCount = 0,
  onNavigateWeb,
  onOpenSettings,
  onOpenPinManager,
  onOpenReceivablesPayroll,
  onLogout,
  isOpenMobile,
  onCloseMobile
}) {
  const getRoleDetails = () => {
    if (currentRole === 'superadmin') {
      return {
        label: 'SUPER ADMIN',
        sub: 'Dueño & Master',
        badgeClass: 'bg-amber-500 text-black',
        icon: <Crown className="w-3.5 h-3.5 fill-black" />
      };
    }
    if (currentRole === 'admin') {
      return {
        label: 'ENCARGADO',
        sub: 'Gestión Operativa',
        badgeClass: 'bg-cyan-400 text-black',
        icon: <Zap className="w-3.5 h-3.5 fill-black" />
      };
    }
    return {
      label: 'STAFF TÉCNICO',
      sub: currentWorkerName || 'Tarima & Bodega',
      badgeClass: 'bg-emerald-400 text-black',
      icon: <Wrench className="w-3.5 h-3.5" />
    };
  };

  const role = getRoleDetails();

  const isTabAllowed = (tabKey) => {
    if (currentRole === 'superadmin') return true;
    if (currentRole === 'admin') return ['orders', 'calendar', 'inventory', 'repairs'].includes(tabKey);
    if (currentRole === 'staff') return ['orders', 'calendar', 'repairs'].includes(tabKey);
    return false;
  };

  const menuItems = [
    {
      id: 'orders',
      label: currentRole === 'staff' ? 'Despacho & Pedidos' : 'Inbox de Pedidos',
      icon: Inbox,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: 'bg-red-500 text-white',
      desc: 'Cotizaciones y estados de eventos'
    },
    {
      id: 'calendar',
      label: 'Calendario Maestro',
      icon: Calendar,
      badge: null,
      desc: 'Fechas reservadas y disponibilidad'
    },
    {
      id: 'inventory',
      label: 'Inventario & Stock',
      icon: Package,
      badge: null,
      desc: 'Catálogo de equipos y combos'
    },
    {
      id: 'repairs',
      label: currentRole === 'staff' ? 'Mi Taller' : 'Taller & Mantenimiento',
      icon: Wrench,
      badge: activeRepairsCount > 0 ? activeRepairsCount : null,
      badgeColor: 'bg-rose-500 text-white',
      desc: 'Averías, repuestos y diagnósticos'
    },
    {
      id: 'reports',
      label: 'Reportes & Finanzas',
      icon: BarChart3,
      badge: null,
      desc: 'Ingresos, gastos y rentabilidad'
    },
    ...(currentRole === 'superadmin' && onOpenReceivablesPayroll ? [{
      id: 'receivables_payroll',
      label: 'Cartera & Salarios',
      icon: DollarSign,
      badge: 'PRO',
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
      desc: 'Cuentas por cobrar y nómina de personal',
      isCustomAction: true,
      onClick: () => {
        if (onCloseMobile) onCloseMobile();
        onOpenReceivablesPayroll('receivables');
      }
    }] : []),
    {
      id: 'landing',
      label: 'Tu Página Web',
      icon: Layout,
      badge: null,
      desc: 'Banners, textos y portafolio'
    }
  ].filter(item => item.isCustomAction || isTabAllowed(item.id));

  const handleSelectTab = (item) => {
    if (item.isCustomAction && item.onClick) {
      item.onClick();
      return;
    }
    setAdminTab(item.id);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a0e18] text-slate-100 select-none">
      
      {/* 1. Header con Branding & Datos del Negocio */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-black" />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-sm text-white tracking-tight truncate">
                {settings?.businessName || 'SOUND CONTROL'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${role.badgeClass}`}>
                  {role.icon}
                  <span>{role.label}</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Sistema en línea" />
              </div>
            </div>
          </div>

          {/* Botón Cerrar en Móvil */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Info adicional del operador */}
        <div className="mt-3.5 pt-3 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate">
            Sesión: <strong className="text-slate-200">{role.sub}</strong>
          </span>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            V 2.6
          </span>
        </div>
      </div>

      {/* 2. Lista de Módulos Operativos */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
          Módulos del Sistema
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = adminTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all group ${
                isActive
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/90 border border-transparent hover:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-black' : 'text-amber-400'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge !== null && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse ${
                    isActive ? 'bg-black text-amber-400' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-black shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Panel Inferior: Ajustes, PINs, Web y Cerrar Sesión */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080b13] space-y-1.5">
        <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
          Configuración & Salida
        </p>

        {/* Gestionar PINs (Solo Dueño) */}
        {currentRole === 'superadmin' && onOpenPinManager && (
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenPinManager();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all text-left"
          >
            <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">Gestionar PINs</span>
          </button>
        )}

        {/* Ajustes de Negocio */}
        {currentRole !== 'staff' && onOpenSettings && (
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenSettings();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-left"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">Ajustes & WhatsApp</span>
          </button>
        )}

        {/* Ver Web Pública */}
        {onNavigateWeb && (
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onNavigateWeb();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-left"
          >
            <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">Ver Catálogo Web</span>
          </button>
        )}

        {/* Botón de Cerrar Sesión */}
        <button
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            onLogout();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/70 border border-rose-500/30 transition-all text-left active:scale-95"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Cerrar Sesión</span>
          </div>
          <span className="text-[10px] text-rose-400/80 font-mono">Salir</span>
        </button>

      </div>

    </div>
  );

  return (
    <>
      {/* Sidebar Fijo en Pantallas Grandes (Desktop lg+) */}
      <aside className="hidden lg:flex w-64 xl:w-72 h-screen sticky top-0 flex-col shrink-0 border-r border-slate-800/80 z-30 shadow-2xl">
        {sidebarContent}
      </aside>

      {/* Drawer Desplegable en Móvil y Tablet (< lg) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop con Blur */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
          />

          {/* Menú Lateral Deslizante */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl border-r border-slate-800 z-10 animate-slide-right flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
