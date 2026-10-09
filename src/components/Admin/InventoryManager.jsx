import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Package, Sparkles, X, Check, Cable } from 'lucide-react';
import { formatCurrency } from '../../services/storageService';
import { CATEGORIES } from '../../data/initialData';

export default function InventoryManager({ equipmentList, onSaveEquipment, onDeleteEquipment }) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bafles y Bajos');
  const [pricePerDay, setPricePerDay] = useState('');
  const [totalStock, setTotalStock] = useState('2');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [includesText, setIncludesText] = useState('');

  const filteredEquipment = equipmentList.filter(eq => 
    selectedCategory === 'Todos' || eq.category === selectedCategory
  );

  const openNewModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('Bafles y Bajos');
    setPricePerDay('');
    setTotalStock('2');
    setImageUrl('https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80');
    setDescription('');
    setSpecifications('');
    setIncludesText('1 Cable de poder, 1 Cable XLR');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPricePerDay(item.pricePerDay);
    setTotalStock(item.totalStock);
    setImageUrl(item.imageUrl);
    setDescription(item.description || '');
    setSpecifications(item.specifications || '');
    setIncludesText(item.includes ? item.includes.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const itemData = {
      id: editingItem ? editingItem.id : `eq-${Date.now()}`,
      name: name.trim(),
      category,
      pricePerDay: Number(pricePerDay) || 0,
      totalStock: Math.max(1, Number(totalStock) || 1),
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      description: description.trim(),
      specifications: specifications.trim(),
      includes: includesText.split(',').map(s => s.trim()).filter(Boolean),
      isPopular: editingItem ? editingItem.isPopular : false
    };

    onSaveEquipment(itemData);
    setIsModalOpen(false);
  };

  const handleStockQuickChange = (item, delta) => {
    const newStock = Math.max(0, item.totalStock + delta);
    onSaveEquipment({ ...item, totalStock: newStock });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111622] p-4 rounded-2xl border border-slate-800">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.filter(c => c !== 'Combos y Paquetes').map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Nuevo Equipo</span>
        </button>

      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map(item => (
          <div
            key={item.id}
            className="bg-[#111622] rounded-2xl border border-slate-800 p-4 flex flex-col justify-between space-y-3 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-16 h-16 rounded-xl object-cover bg-slate-900 border border-slate-800 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {item.category}
                </span>
                <h4 className="font-bold text-white text-sm truncate mt-1">{item.name}</h4>
                <p className="text-xs text-slate-400">{formatCurrency(item.pricePerDay)} / día</p>
              </div>
            </div>

            {/* Stock management buttons */}
            <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Stock Total:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStockQuickChange(item, -1)}
                  className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  -
                </button>
                <span className="w-8 text-center font-extrabold text-white text-sm">
                  {item.totalStock}
                </span>
                <button
                  onClick={() => handleStockQuickChange(item, 1)}
                  className="w-6 h-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions Bottom */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => openEditModal(item)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar ${item.name} del inventario?`)) {
                    onDeleteEquipment(item.id);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828]">
              <h3 className="text-base font-bold text-white">
                {editingItem ? 'Editar Equipo' : 'Nuevo Equipo en Inventario'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Equipo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cabina JBL PRX815W"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {CATEGORIES.filter(c => c !== 'Todos' && c !== 'Combos y Paquetes').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Físico *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalStock}
                    onChange={(e) => setTotalStock(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Precio x Día ($) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="Ej. 80000"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">URL de la Foto</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Especificaciones (Watts, Canales)</label>
                <input
                  type="text"
                  placeholder="Ej. 1500W Clase D | 15 Pulgadas"
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cables y Accesorios Incluidos (separar por comas)</label>
                <input
                  type="text"
                  placeholder="1 Cable de poder, 1 Cable XLR 10m, 1 Trípode"
                  value={includesText}
                  onChange={(e) => setIncludesText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 rounded-xl text-sm shadow-lg shadow-amber-500/20"
                >
                  {editingItem ? 'Guardar Cambios' : 'Crear Equipo'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
