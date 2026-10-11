import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import DateBanner from './components/Catalog/DateBanner';
import LiveQuoteSidebar from './components/Catalog/LiveQuoteSidebar';
import EquipmentCard from './components/Catalog/EquipmentCard';
import ComboCard from './components/Catalog/ComboCard';
import CartModal from './components/Catalog/CartModal';
import FaqSection from './components/Catalog/FaqSection';
import EventGallery from './components/Catalog/EventGallery';
import Toast from './components/Toast';

import AdminAuthGuard from './components/Admin/AdminAuthGuard';

// Carga resiliente ante nuevos deploys: si falla un chunk antiguo en caché, refresca automáticamente
const safeLazy = (importFn) => lazy(() => 
  importFn().catch(err => {
    console.warn('Recargando por actualización de versión...', err);
    window.location.reload();
    return new Promise(() => {}); // evita que rompa la pantalla mientras recarga
  })
);

const AdminDashboard = safeLazy(() => import('./components/Admin/AdminDashboard'));
const PaymentModal = safeLazy(() => import('./components/Admin/PaymentModal'));
const ChecklistModal = safeLazy(() => import('./components/Admin/ChecklistModal'));
const ReceiptModal = safeLazy(() => import('./components/Admin/ReceiptModal'));
const SettingsModal = safeLazy(() => import('./components/Admin/SettingsModal'));
const PinManagerModal = safeLazy(() => import('./components/Admin/PinManagerModal'));
const ReceivablesAndPayrollModal = safeLazy(() => import('./components/Admin/ReceivablesAndPayrollModal'));

import AdminSidebar from './components/Admin/AdminSidebar';
import { 
  getStoredEquipment, saveStoredEquipment,
  getStoredCombos, saveStoredCombos,
  getStoredBookings, saveStoredBookings,
  getStoredRepairs, saveStoredRepairs,
  getStoredPayroll, saveStoredPayroll,
  checkEquipmentAvailability, getStoredSettings, saveStoredSettings,
  formatCurrency, formatDateFriendly
} from './services/storageService';
import { CATEGORIES } from './data/initialData';
import { 
  Sparkles, ShoppingBag, Music, Disc, Shield, Radio, Volume2, 
  MapPin, Search, ArrowUpDown, Menu, Eye, LogOut,
  Calendar, Clock
} from 'lucide-react';

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function App() {
  // Determinar si la URL es /admin o #admin
  const isInitialAdmin = () => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.startsWith('/admin') || window.location.hash.includes('admin');
  };

  // Navigation state: 'catalog' o 'admin'
  const [activeTab, setActiveTab] = useState(() => isInitialAdmin() ? 'admin' : 'catalog');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentAdminRole, setCurrentAdminRole] = useState('superadmin'); // 'superadmin' | 'admin' | 'staff'
  const [currentWorkerName, setCurrentWorkerName] = useState('');
  const [adminSubTab, setAdminSubTab] = useState('orders');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Navegación limpia con URL History API
  const handleNavigate = (tab) => {
    setActiveTab(tab);
    if (tab === 'admin') {
      if (window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
    } else {
      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Business state
  const [equipmentList, setEquipmentList] = useState(getStoredEquipment);
  const [combosList, setCombosList] = useState(getStoredCombos);
  const [bookings, setBookings] = useState(getStoredBookings);
  const [settings, setSettings] = useState(getStoredSettings);

  // Default event date: Mañana
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTomorrowDate);
  const [rentalDays, setRentalDays] = useState(1);
  const [rentalMode, setRentalMode] = useState('days'); // 'days' | 'hours'
  const [rentalHours, setRentalHours] = useState(4);
  const [eventStartTime, setEventStartTime] = useState('20:00');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };


  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPinManagerOpen, setIsPinManagerOpen] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [checklistBooking, setChecklistBooking] = useState(null);
  const [receiptBooking, setReceiptBooking] = useState(null);

  // Sincronizar persistencia local
  useEffect(() => {
    saveStoredEquipment(equipmentList);
  }, [equipmentList]);

  useEffect(() => {
    saveStoredBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    saveStoredCombos(combosList);
  }, [combosList]);

  const [repairs, setRepairs] = useState(() => getStoredRepairs());

  useEffect(() => {
    saveStoredRepairs(repairs);
  }, [repairs]);

  // Gestión de Nómina y Salarios de Personal (Técnicos, DJs, Cargadores)
  const [payroll, setPayroll] = useState(() => getStoredPayroll());

  useEffect(() => {
    saveStoredPayroll(payroll);
  }, [payroll]);

  const handleSavePayroll = (record) => {
    setPayroll(prev => {
      const exists = prev.find(p => p.id === record.id);
      if (exists) {
        return prev.map(p => p.id === record.id ? record : p);
      }
      return [record, ...prev];
    });
    showToast(`👷 Nómina: ${record.workerName} guardado`);
  };

  const handleDeletePayroll = (payrollId) => {
    setPayroll(prev => prev.filter(p => p.id !== payrollId));
    showToast('🗑️ Registro de nómina eliminado');
  };

  const [isReceivablesPayrollOpen, setIsReceivablesPayrollOpen] = useState(false);
  const [receivablesPayrollTab, setReceivablesPayrollTab] = useState('receivables');

  const handleOpenReceivablesPayroll = (tab = 'receivables') => {
    setReceivablesPayrollTab(tab);
    setIsReceivablesPayrollOpen(true);
  };

  const handleSaveRepair = (repair) => {
    setRepairs(prev => {
      const exists = prev.find(r => r.id === repair.id);
      if (exists) {
        return prev.map(r => r.id === repair.id ? repair : r);
      }
      return [repair, ...prev];
    });
    showToast(`🛠️ Taller: ${repair.equipmentName}`);
  };

  const handleDeleteRepair = (repairId) => {
    setRepairs(prev => prev.filter(r => r.id !== repairId));
    showToast('🗑️ Registro de taller eliminado');
  };

  const handleUpdateRepairStatus = (repairId, newStatus, extraData = {}) => {
    setRepairs(prev => prev.map(r => {
      if (r.id === repairId) {
        return {
          ...r,
          status: newStatus,
          ...extraData,
          repairedDate: newStatus === 'Listo' ? new Date().toISOString().split('T')[0] : r.repairedDate
        };
      }
      return r;
    }));
    showToast(`Estado de taller: ${newStatus}`);
  };

  // Sincronizar historial del navegador y atajo de teclado para el DJ
  useEffect(() => {
    const handlePopState = () => {
      const isNowAdmin = window.location.pathname.startsWith('/admin') || window.location.hash.includes('admin');
      setActiveTab(isNowAdmin ? 'admin' : 'catalog');
    };

    const handleKeyDown = (e) => {
      // Atajo secreto DJ: Ctrl+Shift+A o Alt+A
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        const next = activeTab === 'admin' ? 'catalog' : 'admin';
        handleNavigate(next);
        showToast(next === 'admin' ? '🔐 Acceso a Panel de Control' : '🌐 Catálogo Público');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTab]);

  // Cart operations
  const handleAddToCart = (equipment, options = null) => {
    const calcPrice = options?.calculatedPrice !== undefined 
      ? options.calculatedPrice 
      : (rentalMode === 'hours' && (equipment.pricingType === 'hours' || equipment.pricePerHour)
          ? (equipment.pricePerHour || Math.round(equipment.pricePerDay / 8)) * Math.max(rentalHours, equipment.minHours || 1)
          : equipment.pricePerDay);

    const mode = options?.rentalMode || rentalMode;
    const hours = options?.rentalHours || rentalHours;
    const isDj = Boolean(equipment.isDjService || equipment.category === 'DJs y Controladores' || equipment.id === 'eq-dj');

    setCart(prev => {
      const exists = prev.find(item => item.id === equipment.id);
      if (exists) {
        return prev.map(item =>
          item.id === equipment.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        id: equipment.id,
        name: equipment.name,
        price: calcPrice,
        quantity: 1,
        rentalMode: mode,
        rentalHours: mode === 'hours' ? hours : null,
        unitLabel: mode === 'hours' ? `x ${hours}h` : '/ día',
        isDj
      }];
    });
    showToast(`🔊 Agregado: ${equipment.name}`);
  };

  const handleAddComboToCart = (combo, options = null) => {
    let calcPrice = options?.calculatedPrice;
    if (calcPrice === undefined) {
      if (rentalMode === 'hours') {
        const baseHours = combo.includedHours || 4;
        const extraHours = Math.max(0, rentalHours - baseHours);
        const baseCost = combo.pricePerHour ? (combo.pricePerHour * baseHours) : (combo.discountPrice || combo.pricePerDay);
        const extraCost = extraHours * (combo.extraHourPrice || combo.pricePerHour || 40000);
        calcPrice = baseCost + extraCost;
      } else {
        calcPrice = combo.discountPrice || combo.pricePerDay;
      }
    }

    const mode = options?.rentalMode || rentalMode;
    const hours = options?.rentalHours || rentalHours;

    setCart(prev => {
      const exists = prev.find(item => item.id === combo.id);
      if (exists) {
        return prev.map(item =>
          item.id === combo.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        id: combo.id,
        name: combo.name,
        price: calcPrice,
        quantity: 1,
        isCombo: true,
        rentalMode: mode,
        rentalHours: mode === 'hours' ? hours : null,
        unitLabel: mode === 'hours' ? `x ${hours}h` : '/ día',
        isDj: Boolean(combo.isDjCombo)
      }];
    });
    showToast(`🎁 Combo agregado: ${combo.name}`);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Booking operations
  const handleCreateBooking = (newBooking) => {
    setBookings(prev => [newBooking, ...prev]);
    showToast(`📲 Solicitud #${newBooking.id} enviada`);
  };

  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: newStatus };
      }
      return b;
    }));
    showToast(`Estado actualizado: ${newStatus}`);
  };

  const handleSavePayment = ({ bookingId, depositAmount, balanceDue, paymentMethod, paymentNotes }) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          depositAmount,
          balanceDue,
          paymentMethod,
          paymentNotes
        };
      }
      return b;
    }));
    showToast('💰 Pago y saldo actualizados');
  };

  const handleSaveChecklist = (bookingId, checklistMap, isFull) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          checklistMap,
          checklistVerified: isFull
        };
      }
      return b;
    }));
    showToast('📋 Checklist de cables guardado');
  };

  // Equipment operations
  const handleSaveEquipment = (equipmentData) => {
    setEquipmentList(prev => {
      const index = prev.findIndex(e => e.id === equipmentData.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = equipmentData;
        return copy;
      }
      return [equipmentData, ...prev];
    });
    showToast('📦 Inventario actualizado');
  };

  const handleDeleteEquipment = (id) => {
    setEquipmentList(prev => prev.filter(e => e.id !== id));
    showToast('🗑️ Equipo eliminado del inventario', 'warning');
  };

  // Combo operations
  const handleSaveCombo = (comboData) => {
    setCombosList(prev => {
      const index = prev.findIndex(c => c.id === comboData.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = comboData;
        return copy;
      }
      return [comboData, ...prev];
    });
    showToast('🎁 Combo guardado');
  };

  const handleDeleteCombo = (id) => {
    setCombosList(prev => prev.filter(c => c.id !== id));
    showToast('🗑️ Combo eliminado', 'warning');
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    showToast('🎨 Ajustes de Landing guardados');
  };

  const calculateEndDate = (startDate, days) => {
    if (!startDate) return '';
    const d = new Date(startDate + 'T00:00:00');
    d.setDate(d.getDate() + (days - 1));
    return d.toISOString().split('T')[0];
  };

  const selectedEndDate = calculateEndDate(selectedDate, rentalDays);

  // Cálculo ultra-optimizado de disponibilidad (precalculado una sola vez por cambio de fecha)
  const availabilityMap = useMemo(() => {
    const map = {};
    equipmentList.forEach(eq => {
      map[eq.id] = checkEquipmentAvailability(eq.id, selectedDate, bookings, null, selectedEndDate);
    });
    return map;
  }, [equipmentList, selectedDate, bookings, selectedEndDate]);

  // Mapa de acceso instantáneo O(1) para el carrito
  const cartMap = useMemo(() => {
    const map = {};
    cart.forEach(it => { map[it.id] = it; });
    return map;
  }, [cart]);

  // Lista de equipos filtrada y ordenada con useMemo (cero re-cálculos innecesarios)
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(eq => {
      if (selectedCategory !== 'Todos' && selectedCategory !== 'Combos y Paquetes' && eq.category !== selectedCategory) {
        return false;
      }
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase();
        const matchName = eq.name.toLowerCase().includes(q);
        const matchCat = eq.category.toLowerCase().includes(q);
        const matchDesc = eq.description && eq.description.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.pricePerDay - b.pricePerDay;
      if (sortBy === 'price-high') return b.pricePerDay - a.pricePerDay;
      if (sortBy === 'popular') return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      return 0;
    });
  }, [equipmentList, selectedCategory, catalogSearch, sortBy]);

  const cartTotalItems = useMemo(() => cart.reduce((sum, it) => sum + it.quantity, 0), [cart]);

  const totalAmount = useMemo(() => {
    const itemsTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    return rentalMode === 'hours' ? itemsTotal : itemsTotal * rentalDays;
  }, [cart, rentalMode, rentalDays]);

  return (
    <div className="min-h-screen bg-[#090c13] text-slate-100 flex flex-col font-sans overflow-x-hidden w-full max-w-full">
      
      {/* VISTA 1: PANEL DE ADMINISTRADOR AUTENTICADO (Layout SaaS con Sidebar) */}
      {activeTab === 'admin' && isAdminAuthenticated ? (
        <div className="flex-1 flex flex-col lg:flex-row w-full min-h-screen">
          {/* Sidebar lateral fijo en Desktop y Drawer en Celulares */}
          <AdminSidebar
            adminTab={adminSubTab}
            setAdminTab={setAdminSubTab}
            currentRole={currentAdminRole}
            currentWorkerName={currentWorkerName}
            settings={settings}
            pendingOrdersCount={bookings.filter(b => b.status === 'Pendiente').length}
            activeRepairsCount={repairs.filter(r => r.status === 'Pendiente' || r.status === 'En Taller').length}
            onNavigateWeb={() => handleNavigate('catalog')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenPinManager={() => setIsPinManagerOpen(true)}
            onOpenReceivablesPayroll={handleOpenReceivablesPayroll}
            onLogout={() => {
              setIsAdminAuthenticated(false);
              setCurrentWorkerName('');
              showToast('🔒 Sesión cerrada');
            }}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Área Principal del Dashboard */}
          <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#090c13]">
            {/* Header móvil exclusivo para pantallas pequeñas (<lg) */}
            <header className="lg:hidden sticky top-0 z-30 bg-[#0a0e18]/95 backdrop-blur-md border-b border-amber-500/20 px-3.5 py-3 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:text-white shrink-0 active:scale-95 transition-transform"
                  title="Abrir menú"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <h1 className="font-black text-xs sm:text-sm text-white truncate max-w-[140px]">
                    {settings?.businessName || 'SOUND CONTROL'}
                  </h1>
                  <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider">
                    {currentAdminRole === 'superadmin' ? 'Dueño / Super Admin' : currentAdminRole === 'admin' ? 'Encargado' : 'Técnico'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleNavigate('catalog')}
                  className="p-2 rounded-xl bg-slate-900 text-cyan-400 border border-slate-800 hover:text-white transition-colors"
                  title="Ver Tienda Web"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsAdminAuthenticated(false);
                    setCurrentWorkerName('');
                    showToast('🔒 Sesión cerrada');
                  }}
                  className="p-2 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-500/30 hover:bg-rose-900 hover:text-white transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Contenedor del contenido */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 space-y-6">
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-400">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-amber-400">Cargando Panel de Control...</p>
                </div>
              }>
                <div className="animate-fade-in space-y-6">
                  <AdminDashboard
                    adminTab={adminSubTab}
                    setAdminTab={setAdminSubTab}
                    isSidebarMode={true}
                    bookings={bookings}
                    equipmentList={equipmentList}
                    settings={settings}
                    currentRole={currentAdminRole}
                    currentWorkerName={currentWorkerName}
                    onSaveSettings={handleSaveSettings}
                    combosList={combosList}
                    onSaveCombo={handleSaveCombo}
                    onDeleteCombo={handleDeleteCombo}
                    onUpdateBookingStatus={handleUpdateBookingStatus}
                    onOpenPayment={(b) => setPaymentBooking(b)}
                    onOpenChecklist={(b) => setChecklistBooking(b)}
                    onOpenReceipt={(b) => setReceiptBooking(b)}
                    onSaveEquipment={handleSaveEquipment}
                    onDeleteEquipment={handleDeleteEquipment}
                    repairs={repairs}
                    onSaveRepair={handleSaveRepair}
                    onDeleteRepair={handleDeleteRepair}
                    onUpdateRepairStatus={handleUpdateRepairStatus}
                    payroll={payroll}
                    onSavePayroll={handleSavePayroll}
                    onDeletePayroll={handleDeletePayroll}
                    onOpenReceivablesPayroll={handleOpenReceivablesPayroll}
                    onLogout={() => {
                      setIsAdminAuthenticated(false);
                      setCurrentAdminRole('superadmin');
                      setCurrentWorkerName('');
                      showToast('🔒 Sesión cerrada');
                    }}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onOpenPinManager={() => setIsPinManagerOpen(true)}
                  />
                </div>
              </Suspense>
            </main>
          </div>
        </div>
      ) : (
        /* VISTA 2: CATÁLOGO WEB PÚBLICO O PANTALLA DE ACCESO CON PIN */
        <>
          {/* Main Navbar */}
          <Navbar
            activeTab={activeTab}
            onNavigate={handleNavigate}
            cartCount={cartTotalItems}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenPinManager={() => setIsPinManagerOpen(true)}
            onLockAdmin={() => {
              setIsAdminAuthenticated(false);
              setCurrentWorkerName('');
              showToast('🔒 Panel bloqueado con éxito');
            }}
            settings={settings}
            currentRole={currentAdminRole}
            currentWorkerName={currentWorkerName}
            isAdminAuthenticated={isAdminAuthenticated}
          />

          {/* Main Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* PUBLIC CATALOG VIEW */}
        {activeTab === 'catalog' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Dynamic Hero Banner (Configurable from Admin) */}
            <div className="relative overflow-hidden rounded-3xl bg-[#0f1422] border border-slate-800 shadow-2xl">
              <div className="absolute inset-0 z-0">
                <img
                  src={settings.heroImageUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80"}
                  alt={settings.businessName}
                  className="w-full h-full object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#090c13] via-[#090c13]/90 to-transparent" />
              </div>

              <div className="relative z-10 p-6 sm:p-10 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-amber-500 text-black rounded-lg shadow-sm">
                    {settings.businessName}
                  </span>
                  <span className="text-xs text-amber-300/90 font-bold flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    {settings.heroBadge || "Audio Pro & Cabinas DJ"}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  {settings.heroTitle}
                </h1>
                
                <p className="text-xs sm:text-sm text-slate-300 mt-2 sm:mt-3 leading-relaxed">
                  {settings.heroSubtitle}
                </p>

                {/* Coverage & Social Pills */}
                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  {settings.cityCoverage && (
                    <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-semibold">{settings.cityCoverage}</span>
                    </div>
                  )}

                  {settings.instagramUser && (
                    <a
                      href={`https://instagram.com/${settings.instagramUser.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800 text-amber-400 font-semibold transition-colors"
                    >
                      <InstagramIcon className="w-3.5 h-3.5" />
                      <span>{settings.instagramUser}</span>
                    </a>
                  )}

                </div>
              </div>
            </div>

            {/* UNIFIED EXPERIENCE: Catalog (Left) + Sticky Live Quote Sidebar (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT / MAIN COLUMN: Catalog Filters, Combos & Equipment */}
              <div className="lg:col-span-8 space-y-6 min-w-0">
                
                {/* Compact Date Indicator for Mobile (< lg screens) */}
                <div className="lg:hidden flex items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-slate-900 via-[#101728] to-slate-900 rounded-2xl border border-amber-500/30 shadow-lg">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        {rentalMode === 'hours' ? 'Show de DJ / Sonido' : 'Fecha y Días de Alquiler'}
                      </span>
                      <span className="text-xs font-black text-white truncate block">
                        {formatDateFriendly(selectedDate)} • {rentalMode === 'hours' ? `${rentalHours}h Evento` : `${rentalDays} ${rentalDays === 1 ? 'Día' : 'Días'}`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shrink-0 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    Ajustar 📅
                  </button>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pb-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-102'
                          : 'bg-[#111622] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search and Sort Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111622] p-3 sm:p-3.5 rounded-2xl border border-slate-800">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar equipos por nombre o categoría (JBL, Pioneer, Luces, Humo...)"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="popular">Más Populares</option>
                      <option value="price-low">Menor Precio</option>
                      <option value="price-high">Mayor Precio</option>
                    </select>
                  </div>
                </div>

                {/* COMBOS SECTION (if 'Todos' or 'Combos y Paquetes' and no search filter) */}
                {(selectedCategory === 'Todos' || selectedCategory === 'Combos y Paquetes') && !catalogSearch && (
                  <section id="combos" className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                          Combos y Paquetes Prediseñados
                        </h2>
                      </div>
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        Soluciones llave en mano con descuento
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {combosList.map(combo => (
                        <ComboCard
                          key={combo.id}
                          combo={combo}
                          onAddComboToCart={handleAddComboToCart}
                          rentalMode={rentalMode}
                          rentalHours={rentalHours}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* INDIVIDUAL EQUIPMENT GRID */}
                {selectedCategory !== 'Combos y Paquetes' && (
                  <section id="equipos" className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                        Equipos Individuales
                      </h2>
                      <span className="text-xs text-slate-400">
                        {filteredEquipment.length} {filteredEquipment.length === 1 ? 'equipo encontrado' : 'equipos encontrados'}
                      </span>
                    </div>

                    {filteredEquipment.length === 0 ? (
                      <div className="text-center py-12 bg-[#111622] rounded-2xl border border-slate-800">
                        <p className="text-slate-400 text-sm">No encontramos equipos que coincidan con "{catalogSearch}".</p>
                        <button
                          onClick={() => setCatalogSearch('')}
                          className="mt-2 text-xs text-amber-400 font-bold hover:underline"
                        >
                          Limpiar búsqueda
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {filteredEquipment.map(eq => (
                          <EquipmentCard
                            key={eq.id}
                            equipment={eq}
                            availability={availabilityMap[eq.id]}
                            cartItem={cartMap[eq.id]}
                            onAddToCart={handleAddToCart}
                            onUpdateCartQuantity={handleUpdateCartQuantity}
                            rentalMode={rentalMode}
                            rentalHours={rentalHours}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </div>

              {/* RIGHT / SIDEBAR COLUMN: Live Sticky Quote & Cart Panel (Desktop) */}
              <aside className="hidden lg:block lg:col-span-4 sticky top-6">
                <LiveQuoteSidebar
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  rentalDays={rentalDays}
                  setRentalDays={setRentalDays}
                  rentalMode={rentalMode}
                  setRentalMode={setRentalMode}
                  rentalHours={rentalHours}
                  setRentalHours={setRentalHours}
                  eventStartTime={eventStartTime}
                  setEventStartTime={setEventStartTime}
                  cart={cart}
                  onUpdateQuantity={handleUpdateCartQuantity}
                  onRemoveItem={handleRemoveFromCart}
                  onClearCart={handleClearCart}
                  onOpenCartModal={() => setIsCartOpen(true)}
                />
              </aside>

            </div>

            {/* GALLERY PORTFOLIO SECTION */}
            <div id="galeria">
              <EventGallery gallery={settings.gallery} settings={settings} />
            </div>

            {/* FAQ SECTION (Configurable from Admin) */}
            <div id="faq">
              <FaqSection settings={settings} />
            </div>

            {/* Floating Mobile Cart Action Bar (< lg screens) */}
            {cartTotalItems > 0 && (
              <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-black font-black py-3.5 px-4 rounded-2xl shadow-2xl shadow-black/80 flex items-center justify-between border border-emerald-400/30 active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5 text-left min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4 text-black" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black block leading-tight truncate">
                        {cartTotalItems} {cartTotalItems === 1 ? 'Equipo' : 'Equipos'} • {formatCurrency(totalAmount)}
                      </span>
                      <span className="text-[10px] text-emerald-950 font-bold block truncate">
                        {rentalMode === 'hours' ? `${rentalHours}h Show` : `${rentalDays} Días`} ({formatDateFriendly(selectedDate)})
                      </span>
                    </div>
                  </div>
                  <span className="bg-black text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm shrink-0">
                    Cotizar x WhatsApp →
                  </span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* ADMIN LOGIN GUARD (Si entra a #admin sin PIN) */}
        {activeTab === 'admin' && !isAdminAuthenticated && (
          <AdminAuthGuard
            onUnlock={(auth) => {
              setIsAdminAuthenticated(true);
              setCurrentAdminRole(auth?.role || 'superadmin');
              setCurrentWorkerName(auth?.name || '');
              showToast(`🔓 Bienvenido: ${auth?.roleLabel || 'Panel de Control'}`);
            }}
            onCancel={() => handleNavigate('catalog')}
          />
        )}

      </main>

          {/* Footer Público Profesional (Limpio para Clientes) */}
          {activeTab === 'catalog' && (
            <footer className="border-t border-slate-900 bg-[#07090e] py-8 text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div>
                  <p className="font-bold text-slate-300">
                    © {new Date().getFullYear()} {settings.businessName} • {settings.djName}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Alquiler de Sonido Profesional, Iluminación & Control DJ para Eventos
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  {settings.cityCoverage && (
                    <span className="text-slate-400">📍 {settings.cityCoverage}</span>
                  )}
                  <span className="text-slate-800">•</span>
                  {/* Acceso discreto para el staff/dueño */}
                  <button 
                    onClick={() => handleNavigate('admin')} 
                    className="text-slate-700 hover:text-slate-400 transition-colors flex items-center gap-1.5 py-1 px-2 rounded hover:bg-slate-900"
                    title="Acceso exclusivo para el DJ y Staff"
                  >
                    <span>🔒</span>
                    <span>Acceso Staff</span>
                  </button>
                </div>
              </div>
            </footer>
          )}
        </>
      )}

      {/* MODALS */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        rentalDays={rentalDays}
        setRentalDays={setRentalDays}
        rentalMode={rentalMode}
        setRentalMode={setRentalMode}
        rentalHours={rentalHours}
        setRentalHours={setRentalHours}
        eventStartTime={eventStartTime}
        setEventStartTime={setEventStartTime}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onCreateBooking={handleCreateBooking}
      />

      {Boolean(paymentBooking) && (
        <Suspense fallback={null}>
          <PaymentModal
            isOpen={Boolean(paymentBooking)}
            onClose={() => setPaymentBooking(null)}
            booking={paymentBooking}
            onSavePayment={handleSavePayment}
          />
        </Suspense>
      )}

      {Boolean(checklistBooking) && (
        <Suspense fallback={null}>
          <ChecklistModal
            isOpen={Boolean(checklistBooking)}
            onClose={() => setChecklistBooking(null)}
            booking={checklistBooking}
            equipmentList={equipmentList}
            onSaveChecklist={handleSaveChecklist}
          />
        </Suspense>
      )}

      {Boolean(receiptBooking) && (
        <Suspense fallback={null}>
          <ReceiptModal
            isOpen={Boolean(receiptBooking)}
            onClose={() => setReceiptBooking(null)}
            booking={receiptBooking}
          />
        </Suspense>
      )}

      {isSettingsOpen && (
        <Suspense fallback={null}>
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onSettingsSaved={(newSettings) => setSettings(newSettings)}
            currentRole={currentAdminRole}
            onLogout={() => {
              setIsAdminAuthenticated(false);
              setCurrentAdminRole('superadmin');
              setCurrentWorkerName('');
              showToast('🔒 Sesión cerrada');
            }}
          />
        </Suspense>
      )}

      {isPinManagerOpen && (
        <Suspense fallback={null}>
          <PinManagerModal
            isOpen={isPinManagerOpen}
            onClose={() => setIsPinManagerOpen(false)}
            settings={settings}
            onSettingsSaved={(newSettings) => {
              setSettings(newSettings);
              showToast('🔐 PINs actualizados con éxito');
            }}
          />
        </Suspense>
      )}

      {isReceivablesPayrollOpen && (
        <Suspense fallback={null}>
          <ReceivablesAndPayrollModal
            isOpen={isReceivablesPayrollOpen}
            onClose={() => setIsReceivablesPayrollOpen(false)}
            bookings={bookings}
            payroll={payroll}
            workers={settings?.workers || []}
            settings={settings}
            onSavePayment={handleSavePayment}
            onSavePayroll={handleSavePayroll}
            onDeletePayroll={handleDeletePayroll}
            onOpenPaymentModal={(b) => setPaymentBooking(b)}
            initialTab={receivablesPayrollTab}
          />
        </Suspense>
      )}

      {/* TOAST NOTIFICATION */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}

