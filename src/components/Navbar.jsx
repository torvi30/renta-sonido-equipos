import React from 'react';
import { Disc3, ShoppingBag, ShieldCheck, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, cartCount, onOpenCart, onOpenSettings }) {
  return (
    <header className="sticky top-0 z-40 bg-[#0c101a]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & Branding */}
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0" 
            onClick={() => setActiveTab('catalog')}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black flex-shrink-0">
              <Disc3 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-extrabold text-sm sm:text-lg tracking-tight text-white whitespace-nowrap">
                  SOUND & EVENT
                </span>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                Alquiler de Sonido, Luces & DJ Control
              </p>
            </div>
          </div>

          {/* Mode Switcher (Catálogo vs Panel Admin) */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex-shrink-0">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Catálogo</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Panel Admin</span>
              <span className="sm:hidden">Admin</span>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {activeTab === 'catalog' && (
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/40 transition-all transform active:scale-95"
                title="Ver cotización de alquiler"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Cotización</span>
                {cartCount > 0 && (
                  <span className="bg-white text-emerald-950 font-black text-xs px-1.5 sm:px-2 py-0.2 rounded-full shadow-sm animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onOpenSettings}
              title="Configuración de WhatsApp y Negocio"
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
