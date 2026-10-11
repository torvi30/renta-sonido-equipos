import React, { useState, memo } from 'react';
import { Package, Sparkles, CheckCircle2, ChevronDown, ChevronUp, Plus, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../services/storageService';

function ComboCard({ 
  combo, 
  onAddComboToCart,
  rentalMode = 'days',
  rentalHours = 4
}) {
  const [expanded, setExpanded] = useState(false);

  // Cálculo de precio de Combo según modalidad
  let displayPrice = combo.discountPrice || combo.pricePerDay;
  let priceSubtitle = '/ día';
  let modeBadge = null;

  if (rentalMode === 'hours') {
    const baseHours = combo.includedHours || 4;
    const extraHours = Math.max(0, rentalHours - baseHours);
    const baseCost = combo.pricePerHour ? (combo.pricePerHour * baseHours) : (combo.discountPrice || combo.pricePerDay);
    const extraCost = extraHours * (combo.extraHourPrice || combo.pricePerHour || 40000);
    displayPrice = baseCost + extraCost;
    priceSubtitle = `x ${rentalHours} horas`;
    modeBadge = (
      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 block w-fit mb-1">
        ⏱️ Paquete {rentalHours}h {extraHours > 0 ? `(${baseHours}h base + ${extraHours}h extra)` : `(${baseHours}h incluidas)`}
      </span>
    );
  } else {
    displayPrice = combo.discountPrice || combo.pricePerDay;
    priceSubtitle = '/ día';
    if (combo.pricePerHour || combo.includedHours) {
      modeBadge = (
        <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 block w-fit mb-1">
          ⏱️ Opcional x Horas (Show DJ)
        </span>
      );
    }
  }

  const handleAdd = () => {
    onAddComboToCart(combo, { calculatedPrice: displayPrice, rentalMode, rentalHours });
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#141b2a] to-[#0f1422] border-2 border-amber-500/30 hover:border-amber-500/60 transition-all duration-300 p-5 sm:p-6 shadow-xl flex flex-col justify-between overflow-hidden">
      
      {/* Decorative Neon Ribbon */}
      <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-black font-extrabold text-[10px] sm:text-xs uppercase px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5" />
        <span>{combo.isDjCombo ? '🎧 Pack Show DJ' : (combo.tag || 'Combo Pro')}</span>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {combo.name}
            </h3>
            <span className="text-[11px] font-semibold text-emerald-400">
              Paquete Completo Llave en Mano
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          {combo.description}
        </p>

        {/* Component summary pills */}
        <div className="mt-4 space-y-1.5">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
            Equipos Principales Incluidos:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {combo.items.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-1.5 text-xs text-slate-200 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expandable Cable/Checklist details */}
        {combo.checklist && combo.checklist.length > 0 && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
            >
              <span>{expanded ? 'Ocultar checklist de cables' : `Ver lista de ${combo.checklist.length} cables y accesorios`}</span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expanded && (
              <ul className="mt-2.5 space-y-1 bg-slate-950/90 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                {combo.checklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Pricing and Action */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          {modeBadge}
          {rentalMode === 'days' && combo.discountPrice && (
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(combo.pricePerDay)}
              </span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Ahorras {formatCurrency(combo.pricePerDay - combo.discountPrice)}
              </span>
            </div>
          )}
          <div className="text-xl sm:text-2xl font-black text-white">
            {formatCurrency(displayPrice)}
            <span className="text-xs font-normal text-slate-400 ml-1">{priceSubtitle}</span>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Combo</span>
        </button>
      </div>

    </div>
  );
}

export default memo(ComboCard);
