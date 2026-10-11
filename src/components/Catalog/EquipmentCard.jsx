import React, { useState } from 'react';
import { Plus, Minus, Check, Cable, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../services/storageService';

export default function EquipmentCard({ 
  equipment, 
  availability, 
  cartItem, 
  onAddToCart, 
  onUpdateCartQuantity,
  rentalMode = 'days',
  rentalHours = 4
}) {
  const [showIncludes, setShowIncludes] = useState(false);

  const isAvailable = availability ? availability.isAvailable : equipment.totalStock > 0;
  const availableCount = availability ? availability.availableStock : equipment.totalStock;
  const inCartQty = cartItem ? cartItem.quantity : 0;

  // Cálculo de precio según modalidad (Horas vs Días)
  let displayPrice = equipment.pricePerDay || 0;
  let priceSubtitle = '/ día';
  let priceModeBadge = null;

  if (rentalMode === 'hours') {
    if (equipment.pricingType === 'hours' || equipment.pricePerHour) {
      const effectiveHours = Math.max(rentalHours, equipment.minHours || 1);
      const hourlyRate = equipment.pricePerHour || Math.round(equipment.pricePerDay / 8);
      displayPrice = hourlyRate * effectiveHours;
      priceSubtitle = `x ${rentalHours} horas`;
      priceModeBadge = (
        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 block w-fit mb-0.5">
          ⏱️ {formatCurrency(hourlyRate)}/hr {equipment.minHours && rentalHours < equipment.minHours ? `(Mín. ${equipment.minHours}h)` : ''}
        </span>
      );
    } else {
      displayPrice = equipment.pricePerDay;
      priceSubtitle = '/ evento 24h';
      priceModeBadge = (
        <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 block w-fit mb-0.5">
          📅 Tarifa Día Completo
        </span>
      );
    }
  } else {
    displayPrice = equipment.pricePerDay;
    priceSubtitle = '/ día';
    if (equipment.pricePerHour) {
      priceModeBadge = (
        <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 block w-fit mb-0.5">
          ⏱️ Opcional: {formatCurrency(equipment.pricePerHour)}/hr
        </span>
      );
    }
  }

  const handleAdd = () => {
    onAddToCart(equipment, { calculatedPrice: displayPrice, rentalMode, rentalHours });
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-[#111622] border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/5">
      
      {/* Top Image & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src={equipment.imageUrl}
          alt={equipment.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111622] via-transparent to-transparent" />

        {/* Category & Tag Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-400 border border-amber-500/30 rounded-lg">
            {equipment.category}
          </span>
          {equipment.isDjService && (
            <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md flex items-center gap-1">
              <span>🎧 Show DJ</span>
            </span>
          )}
          {equipment.isPopular && !equipment.isDjService && (
            <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-lg shadow-md">
              Top Alquiler
            </span>
          )}
        </div>

        {/* Real-time Stock Badge */}
        <div className="absolute top-3 right-3">
          {isAvailable ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {availableCount} {availableCount === 1 ? 'Disponible' : 'Disponibles'}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-red-950/90 backdrop-blur-md text-red-300 border border-red-500/40 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              Agotado esta fecha
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug group-hover:text-amber-400 transition-colors">
            {equipment.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {equipment.description}
          </p>

          {/* Specifications */}
          {equipment.specifications && (
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-300 font-medium bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">{equipment.specifications}</span>
            </div>
          )}

          {/* Includes / Cables toggle */}
          {equipment.includes && equipment.includes.length > 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowIncludes(!showIncludes)}
                className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Cable className="w-3 h-3" />
                <span>{showIncludes ? 'Ocultar accesorios' : `Incluye ${equipment.includes.length} cables y accesorios`}</span>
              </button>

              {showIncludes && (
                <ul className="mt-2 space-y-1 bg-slate-950/90 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                  {equipment.includes.map((acc, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Price & Action Bottom */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            {priceModeBadge}
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-extrabold text-white">
                {formatCurrency(displayPrice)}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {priceSubtitle}
              </span>
            </div>
          </div>

          <div>
            {!isAvailable ? (
              <button
                disabled
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800/50 text-slate-500 border border-slate-700/50 cursor-not-allowed"
              >
                No disponible
              </button>
            ) : inCartQty > 0 ? (
              <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/40 p-1 rounded-xl">
                <button
                  onClick={() => onUpdateCartQuantity(equipment.id, inCartQty - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-extrabold text-amber-400 text-sm">
                  {inCartQty}
                </span>
                <button
                  onClick={() => onUpdateCartQuantity(equipment.id, inCartQty + 1)}
                  disabled={inCartQty >= availableCount}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold ${
                    inCartQty >= availableCount
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-400 text-black'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
