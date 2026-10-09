import React from 'react';
import { 
  Disc3, ShoppingBag, ShieldCheck, Sparkles, SlidersHorizontal, 
  MessageCircle, ExternalLink, Lock, Eye, LogOut 
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  onNavigate, 
  cartCount, 
  onOpenCart, 
  onOpenSettings,
  onLockAdmin,
  settings 
}) {
  const cleanPhone = (settings?.phone || '').replace(/\D/g, '');

  // ----------------------------------------------------
  // VISTA 1: NAVBAR DEL PANEL DE ADMINISTRADOR (Modo Privado)
  // ----------------------------------------------------
  if (activeTab === 'admin') {
    return (
      <header className="sticky top-0 z-40 bg-[#0a0e18]/95 backdrop-blur-md border-b border-amber-500/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            
            {/* Branding Admin */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-sm sm:text-base text-white tracking-tight truncate max-w-[200px] sm:max-w-none">
                    {settings?.businessName || 'SOUND & EVENT PRO'}
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black rounded-md flex-shrink-0">
                    ADMIN
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    En vivo
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Panel de Control, Reservas & Inventario de Sonido
                </p>
              </div>
            </div>

            {/* Acciones del Administrador */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Botón Ver Sitio Público */}
              <button
                onClick={() => onNavigate('catalog')}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
                title="Ir a ver la tienda pública como cliente"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Ver Sitio Web Público</span>
                <span className="sm:hidden">Ver Web</span>
              </button>

              {/* Botón Ajustes de Negocio / WhatsApp */}
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
                title="Configurar teléfono de WhatsApp, PIN y datos del negocio"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Ajustes</span>
              </button>

              {/* Botón Bloquear Panel */}
              <button
                onClick={onLockAdmin}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                title="Bloquear sesión de administrador"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bloquear</span>
              </button>

            </div>

          </div>
        </div>
      </header>
    );
  }

  // ----------------------------------------------------
  // VISTA 2: NAVBAR PÚBLICO PARA CLIENTES (100% Tienda / Catálogo)
  // CERO botones de admin visibles para el cliente
  // ----------------------------------------------------
  return (
    <header className="sticky top-0 z-40 bg-[#0c101a]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & Branding */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer flex-shrink-0" 
            onClick={() => onNavigate('catalog')}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black flex-shrink-0">
              <Disc3 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-lg tracking-tight text-white whitespace-nowrap">
                  {settings?.businessName || 'SOUND & EVENT'}
                </span>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                Alquiler de Sonido, Luces & DJ para Eventos
              </p>
            </div>
          </div>

          {/* Menú de Enlaces para Clientes (Desktop) */}
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

          {/* Acciones del Cliente (WhatsApp Directo + Cotización) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* WhatsApp Directo de Contacto */}
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
              className="relative flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-amber-500/20 transition-all transform active:scale-95"
              title="Ver mi cotización de alquiler"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cotización</span>
              {cartCount > 0 && (
                <span className="bg-black text-amber-400 font-black text-xs px-1.5 sm:px-2 py-0.2 rounded-full shadow-sm animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
