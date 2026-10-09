import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DateBanner from './components/Catalog/DateBanner';
import EquipmentCard from './components/Catalog/EquipmentCard';
import ComboCard from './components/Catalog/ComboCard';
import CartModal from './components/Catalog/CartModal';
import AdminDashboard from './components/Admin/AdminDashboard';
import PaymentModal from './components/Admin/PaymentModal';
import ChecklistModal from './components/Admin/ChecklistModal';
import ReceiptModal from './components/Admin/ReceiptModal';
import SettingsModal from './components/Admin/SettingsModal';
import AdminAuthGuard from './components/Admin/AdminAuthGuard';

import { 
  getStoredEquipment, saveStoredEquipment,
  getStoredCombos, saveStoredCombos,
  getStoredBookings, saveStoredBookings,
  checkEquipmentAvailability, getStoredSettings
} from './services/storageService';
import { CATEGORIES } from './data/initialData';
import { Sparkles, ShoppingBag, Music, Disc, Shield, Radio, Volume2 } from 'lucide-react';

export default function App() {
  // Navigation state: 'catalog' o 'admin'
  const [activeTab, setActiveTab] = useState('catalog');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

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
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cart, setCart] = useState([]);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  // Cart operations
  const handleAddToCart = (equipment) => {
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
        price: equipment.pricePerDay,
        quantity: 1
      }];
    });
  };

  const handleAddComboToCart = (combo) => {
    // Agrega el combo como un item estructurado con el precio con descuento
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
        price: combo.discountPrice || combo.pricePerDay,
        quantity: 1,
        isCombo: true
      }];
    });
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
  };

  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: newStatus };
      }
      return b;
    }));
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
  };

  const handleDeleteEquipment = (id) => {
    setEquipmentList(prev => prev.filter(e => e.id !== id));
  };

  // Filtered equipment list for catalog
  const filteredEquipment = equipmentList.filter(eq => {
    if (selectedCategory === 'Todos') return true;
    if (selectedCategory === 'Combos y Paquetes') return false;
    return eq.category === selectedCategory;
  });

  const cartTotalItems = cart.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="min-h-screen bg-[#090c13] text-slate-100 flex flex-col font-sans">
      
      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* PUBLIC CATALOG VIEW */}
        {activeTab === 'catalog' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600/20 via-slate-900 to-cyan-900/20 border border-slate-800 p-6 sm:p-10 shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-amber-500 text-black rounded-lg shadow-sm">
                    {settings.businessName}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    Audio Pro & DJ Gear
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  Alquiler de Sonido Profesional, Iluminación y Cabinas DJ
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 sm:mt-3 leading-relaxed">
                  Arma tu paquete para fiestas, matrimonios, quinceañeros y eventos corporativos. 
                  Selecciona tu fecha, cotiza en vivo y separa tu montaje al instante vía WhatsApp.
                </p>
              </div>
            </div>

            {/* Date Picker Banner with real-time stock computation */}
            <DateBanner
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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

            {/* COMBOS SECTION (if 'Todos' or 'Combos y Paquetes') */}
            {(selectedCategory === 'Todos' || selectedCategory === 'Combos y Paquetes') && (
              <section className="space-y-4 pt-2">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {combosList.map(combo => (
                    <ComboCard
                      key={combo.id}
                      combo={combo}
                      onAddComboToCart={handleAddComboToCart}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* INDIVIDUAL EQUIPMENT GRID */}
            {selectedCategory !== 'Combos y Paquetes' && (
              <section className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    Equipos Individuales
                  </h2>
                  <span className="text-xs text-slate-400">
                    {filteredEquipment.length} disponibles
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEquipment.map(eq => {
                    const availability = checkEquipmentAvailability(eq.id, selectedDate, bookings);
                    const cartItem = cart.find(c => c.id === eq.id);

                    return (
                      <EquipmentCard
                        key={eq.id}
                        equipment={eq}
                        availability={availability}
                        cartItem={cartItem}
                        onAddToCart={handleAddToCart}
                        onUpdateCartQuantity={handleUpdateCartQuantity}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* Floating Mobile Cart Action Bar */}
            {cartTotalItems > 0 && (
              <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold py-3.5 px-5 rounded-2xl shadow-2xl flex items-center justify-between shadow-emerald-950/80 animate-bounce"
                  style={{ animationDuration: '3s' }}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    <span>Ver Cotización ({cartTotalItems} equipos)</span>
                  </div>
                  <span className="bg-black/80 text-emerald-400 px-3 py-1 rounded-xl text-xs font-black">
                    Pedir x WhatsApp →
                  </span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* ADMIN DASHBOARD VIEW */}
        {activeTab === 'admin' && (
          !isAdminAuthenticated ? (
            <AdminAuthGuard
              onUnlock={() => setIsAdminAuthenticated(true)}
              onCancel={() => setActiveTab('catalog')}
            />
          ) : (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                  🔐 Sesión de Administrador Activa
                </span>
                <button
                  onClick={() => setIsAdminAuthenticated(false)}
                  className="text-xs text-slate-400 hover:text-red-400 font-bold bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl transition-colors"
                >
                  Bloquear Panel 🔒
                </button>
              </div>
              <AdminDashboard
                bookings={bookings}
                equipmentList={equipmentList}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onOpenPayment={(b) => setPaymentBooking(b)}
                onOpenChecklist={(b) => setChecklistBooking(b)}
                onOpenReceipt={(b) => setReceiptBooking(b)}
                onSaveEquipment={handleSaveEquipment}
                onDeleteEquipment={handleDeleteEquipment}
              />
            </div>
          )
        )}


      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#07090e] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {settings.businessName} - Sistema de Alquiler de Sonido & Control DJ.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSettingsOpen(true)} className="hover:text-amber-400 transition-colors">
              Ajustes de WhatsApp
            </button>
            <span>•</span>
            <span className="text-emerald-500">100% Gratuito & Serverless</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        selectedDate={selectedDate}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onCreateBooking={handleCreateBooking}
      />

      <PaymentModal
        isOpen={Boolean(paymentBooking)}
        onClose={() => setPaymentBooking(null)}
        booking={paymentBooking}
        onSavePayment={handleSavePayment}
      />

      <ChecklistModal
        isOpen={Boolean(checklistBooking)}
        onClose={() => setChecklistBooking(null)}
        booking={checklistBooking}
        equipmentList={equipmentList}
        onSaveChecklist={handleSaveChecklist}
      />

      <ReceiptModal
        isOpen={Boolean(receiptBooking)}
        onClose={() => setReceiptBooking(null)}
        booking={receiptBooking}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={(newSettings) => setSettings(newSettings)}
      />

    </div>
  );
}
