import React, { useState } from 'react';
import { 
  Disc3, ShoppingBag, ShieldCheck, Sparkles, SlidersHorizontal, 
  MessageCircle, ExternalLink, Lock, Eye, LogOut, Crown, Zap, Wrench, 
  KeyRound, Menu, X, ChevronRight, Phone
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  onNavigate, 
  cartCount, 
  onOpenCart, 
  onOpenSettings,
  onOpenPinManager,
  onLockAdmin,
  settings,
  currentRole = 'superadmin',
  currentWorkerName = '',
  isAdminAuthenticated = false
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cleanPhone = (settings?.phone || '').replace(/\D/g, '');

  const closeMenu = () => setIsMobileMenuOpen(false);

  // ----------------------------------------------------
  // VISTA PÚBLICA PARA CLIENTES (100% Tienda / Catálogo)
  // Con menú responsivo completo para móviles y tablets
  // ----------------------------------------------------
  return (
    <>
      <header className="relative w-full z-40 bg-[#0c101a] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            
            {/* Logo & Branding */}
            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0" 
              onClick={() => onNavigate('catalog')}
            >
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black shrink-0">
                <Disc3 className="w-4 h-4 sm:w-6 sm:h-6 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-black text-xs sm:text-base md:text-lg tracking-tight text-white truncate max-w-[115px] xs:max-w-[160px] sm:max-w-none">
                    {settings?.businessName || 'SOUND & EVENT'}
                  </span>
                  <span className="px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded shrink-0">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                  Alquiler de Sonido, Luces & DJ para Eventos
                </p>
              </div>
            </div>

            {/* Menú de Enlaces para Clientes (Desktop lg+) */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-300">
              <a href="#equipos" className="hover:text-amber-400 transition-colors">
                Equipos de Sonido
              </a>
              <a href="#combos" className="hover:text-amber-400 transition-colors">
                Combos & Paquetes
              </a>
              <a href="#galeria" className="hover:text-amber-400 transition-colors">
                Eventos Reales
              </a>
              <a href="#faq" className="hover:text-amber-400 transition-colors">
                Preguntas Frecuentes
              </a>
            </nav>

            {/* Acciones del Cliente (WhatsApp Directo + Cotización + Menú Móvil) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* Acceso Admin Rápido si ya inició sesión */}
              {isAdminAuthenticated && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
                  title="Volver al Panel de Administrador"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Panel Admin</span>
                </button>
              )}

              {/* WhatsApp Directo de Contacto (Desktop) */}
              {cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('¡Hola! Me gustaría cotizar equipos de sonido para un evento.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-extrabold transition-all"
                  title="Escríbenos por WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}

              {/* Botón de Carrito / Cotización */}
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 shrink-0"
                title="Ver mi cotización de alquiler"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span className="hidden xs:inline">Cotizar</span>
                {cartCount > 0 && (
                  <span className="bg-black text-amber-400 font-black text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full shadow-sm animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Botón Hamburguesa Móvil (Aparece en pantallas < lg) */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors shrink-0"
                title="Abrir menú"
              >
                <Menu className="w-4 h-4" />
              </button>

            </div>


          </div>
        </div>
      </header>

      {/* Cajón / Menú Desplegable en Móvil */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Fondo oscuro con Blur */}
          <div 
            onClick={closeMenu}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Panel Lateral Deslizante */}
          <div className="relative ml-auto w-72 max-w-[85vw] h-full bg-[#0c101a] border-l border-slate-800 shadow-2xl flex flex-col justify-between p-5 z-10 animate-slide-left">
            
            {/* Header del Menú Móvil */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-black flex items-center justify-center font-black">
                    <Disc3 className="w-4 h-4" />
                  </div>
                  <span className="font-black text-sm text-white">Menú</span>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Enlaces de Navegación del Catálogo */}
              <nav className="mt-5 space-y-2">
                <a
                  href="#equipos"
                  onClick={closeMenu}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:text-amber-400 hover:bg-slate-900 transition-all"
                >
                  <span>🔊 Equipos de Sonido</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </a>
                <a
                  href="#combos"
                  onClick={closeMenu}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:text-amber-400 hover:bg-slate-900 transition-all"
                >
                  <span>🎛️ Combos & Paquetes</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </a>
                <a
                  href="#galeria"
                  onClick={closeMenu}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:text-amber-400 hover:bg-slate-900 transition-all"
                >
                  <span>📸 Eventos Reales</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </a>
                <a
                  href="#faq"
                  onClick={closeMenu}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:text-amber-400 hover:bg-slate-900 transition-all"
                >
                  <span>❓ Preguntas Frecuentes</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </a>
              </nav>

              {/* Botón WhatsApp en Móvil */}
              {cleanPhone && (
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('¡Hola! Me gustaría cotizar equipos de sonido para un evento.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3 px-4 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Inmediato</span>
                  </a>
                </div>
              )}
            </div>

            {/* Pie de Menú Móvil: Acceso Administrativo Privado */}
            <div className="pt-4 border-t border-slate-800/80">
              <button
                onClick={() => {
                  closeMenu();
                  onNavigate('admin');
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-amber-400 border border-slate-800 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Acceso Panel & Empleados</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
