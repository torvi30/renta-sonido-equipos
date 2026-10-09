import React, { useState } from 'react';
import { X, CheckSquare, Square, Cable, AlertCircle, CheckCircle } from 'lucide-react';

export default function ChecklistModal({ isOpen, onClose, booking, equipmentList, onSaveChecklist }) {
  if (!isOpen || !booking) return null;

  // Recopilar todos los cables y accesorios de los equipos del pedido
  const buildItemsList = () => {
    const list = [];
    booking.items.forEach(item => {
      const eq = equipmentList.find(e => e.id === item.equipmentId);
      list.push({
        id: `main-${item.equipmentId}`,
        name: `${item.quantity}x ${item.name}`,
        category: 'Equipo Principal'
      });
      if (eq && eq.includes) {
        eq.includes.forEach((inc, idx) => {
          list.push({
            id: `inc-${item.equipmentId}-${idx}`,
            name: `${inc} (de ${item.name})`,
            category: 'Cable / Accesorio'
          });
        });
      }
    });
    return list;
  };

  const allItems = buildItemsList();
  const [checkedMap, setCheckedMap] = useState(booking.checklistMap || {});

  const toggleCheck = (itemId) => {
    setCheckedMap(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleSelectAll = () => {
    const newMap = {};
    allItems.forEach(i => newMap[i.id] = true);
    setCheckedMap(newMap);
  };

  const handleSave = () => {
    const totalCount = allItems.length;
    const checkedCount = Object.values(checkedMap).filter(Boolean).length;
    const isFull = checkedCount === totalCount;
    onSaveChecklist(booking.id, checkedMap, isFull);
    onClose();
  };

  const checkedCount = Object.values(checkedMap).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Cable className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Checklist de Despacho & Cables
              </h3>
              <p className="text-xs text-slate-400">
                Orden #{booking.id} - Verificación Anti-Pérdidas
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status progress bar */}
        <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">
              Verificados: {checkedCount} de {allItems.length}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
          >
            Marcar Todos
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
          {allItems.map((item) => {
            const isChecked = !!checkedMap[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs sm:text-sm font-semibold truncate ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                    {item.name}
                  </p>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">
                    {item.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#121828] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-extrabold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20"
          >
            Guardar Verificación
          </button>
        </div>

      </div>
    </div>
  );
}
