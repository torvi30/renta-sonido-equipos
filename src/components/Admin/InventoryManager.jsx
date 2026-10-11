import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Package, Sparkles, X, Check, Cable, 
  Upload, Camera, Link as LinkIcon, Search, Star, Layers, ShieldCheck
} from 'lucide-react';
import { formatCurrency, processImageFile } from '../../services/storageService';
import { showConfirm, showError } from '../../services/alertService';
import { CATEGORIES } from '../../data/initialData';

// Presets fotográficos de alta calidad para equipos de audio
const EQUIPMENT_PRESETS = [
  { label: 'Cabina Activa 15"', url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bajo Subwoofer', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80' },
  { label: 'Consola DJ', url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Micrófono Shure', url: 'https://images.unsplash.com/photo-1520523839898-507124cd5371?auto=format&fit=crop&w=800&q=80' },
  { label: 'Luces Beam Robóticas', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Máquina de Humo', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80' },
];

export default function InventoryManager({ 
  equipmentList, 
  onSaveEquipment, 
  onDeleteEquipment,
  combosList = [],
  onSaveCombo,
  onDeleteCombo
}) {
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' | 'combos'
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Equipos Individuales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Form states Equipo
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bafles y Bajos');
  const [pricingType, setPricingType] = useState('days'); // 'days' | 'hours' | 'both'
  const [pricePerDay, setPricePerDay] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [minHours, setMinHours] = useState('2');
  const [isDjService, setIsDjService] = useState(false);
  const [totalStock, setTotalStock] = useState('2');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [includesText, setIncludesText] = useState('');
  const [isPopular, setIsPopular] = useState(false);

  // Modal Combos
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [comboName, setComboName] = useState('');
  const [comboTag, setComboTag] = useState('Más Pedido');
  const [comboPricingType, setComboPricingType] = useState('both'); // 'days' | 'hours' | 'both'
  const [comboPrice, setComboPrice] = useState('');
  const [comboDiscount, setComboDiscount] = useState('');

  // Manejar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        if (isComboModalOpen) setIsComboModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isComboModalOpen]);
  const [comboPricePerHour, setComboPricePerHour] = useState('');
  const [comboIncludedHours, setComboIncludedHours] = useState('4');
  const [comboExtraHourPrice, setComboExtraHourPrice] = useState('');
  const [comboIsDj, setComboIsDj] = useState(false);
  const [comboDesc, setComboDesc] = useState('');
  const [comboItemsText, setComboItemsText] = useState('');

  // Categorías disponibles dinámicas (Incluye categorías creadas por el usuario)
  const availableCategories = ['Todos', ...Array.from(new Set([
    ...CATEGORIES.filter(c => c !== 'Todos' && c !== 'Combos y Paquetes'),
    ...equipmentList.map(eq => eq.category).filter(Boolean)
  ]))];

  // Filtrado de equipos
  const filteredEquipment = equipmentList.filter(eq => {
    const matchesCat = selectedCategory === 'Todos' || eq.category === selectedCategory;
    const matchesQuery = !searchQuery || 
      eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (eq.description && eq.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  // Manejo de subida de fotos desde Celular o PC
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressedDataUrl = await processImageFile(file, 900, 0.82);
      if (compressedDataUrl) {
        setImageUrl(compressedDataUrl);
      }
    } catch (err) {
      showError('Error al subir imagen', err.message || 'Error al procesar la foto.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('Bafles y Bajos');
    setPricingType('days');
    setPricePerDay('');
    setPricePerHour('');
    setMinHours('2');
    setIsDjService(false);
    setTotalStock('2');
    setImageUrl(EQUIPMENT_PRESETS[0].url);
    setDescription('');
    setSpecifications('');
    setIncludesText('1 Cable de poder, 1 Cable XLR balanceado');
    setIsPopular(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPricingType(item.pricingType || (item.pricePerHour ? 'both' : 'days'));
    setPricePerDay(item.pricePerDay || '');
    setPricePerHour(item.pricePerHour || '');
    setMinHours(item.minHours || '2');
    setIsDjService(Boolean(item.isDjService));
    setTotalStock(item.totalStock);
    setImageUrl(item.imageUrl || EQUIPMENT_PRESETS[0].url);
    setDescription(item.description || '');
    setSpecifications(item.specifications || '');
    setIncludesText(item.includes ? item.includes.join(', ') : '');
    setIsPopular(Boolean(item.isPopular));
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const itemData = {
      id: editingItem ? editingItem.id : `eq-${Date.now()}`,
      name: name.trim(),
      category,
      pricingType,
      pricePerDay: Number(pricePerDay) || 0,
      pricePerHour: pricePerHour ? Number(pricePerHour) : null,
      minHours: Number(minHours) || 2,
      isDjService: Boolean(isDjService),
      totalStock: Math.max(1, Number(totalStock) || 1),
      imageUrl: imageUrl.trim() || EQUIPMENT_PRESETS[0].url,
      description: description.trim(),
      specifications: specifications.trim(),
      includes: includesText.split(',').map(s => s.trim()).filter(Boolean),
      isPopular: Boolean(isPopular)
    };

    onSaveEquipment(itemData);
    setIsModalOpen(false);
  };

  const handleStockQuickChange = (item, delta) => {
    const newStock = Math.max(0, item.totalStock + delta);
    onSaveEquipment({ ...item, totalStock: newStock });
  };

  // Acciones de Combos
  const openNewComboModal = () => {
    setEditingCombo(null);
    setComboName('');
    setComboTag('Recomendado');
    setComboPricingType('both');
    setComboPrice('');
    setComboDiscount('');
    setComboPricePerHour('60000');
    setComboIncludedHours('4');
    setComboExtraHourPrice('40000');
    setComboIsDj(true);
    setComboDesc('');
    setComboItemsText('2 Cabinas JBL 15 pulgadas, Consola Pioneer DJ, Barra Luces LED');
    setIsComboModalOpen(true);
  };

  const openEditComboModal = (combo) => {
    setEditingCombo(combo);
    setComboName(combo.name);
    setComboTag(combo.tag || 'Combo Pro');
    setComboPricingType(combo.pricingType || (combo.pricePerHour ? 'both' : 'days'));
    setComboPrice(combo.pricePerDay || '');
    setComboDiscount(combo.discountPrice || '');
    setComboPricePerHour(combo.pricePerHour || '');
    setComboIncludedHours(combo.includedHours || '4');
    setComboExtraHourPrice(combo.extraHourPrice || '');
    setComboIsDj(Boolean(combo.isDjCombo));
    setComboDesc(combo.description || '');
    setComboItemsText(combo.items ? combo.items.map(i => i.name).join(', ') : '');
    setIsComboModalOpen(true);
  };

  const handleComboSubmit = (e) => {
    e.preventDefault();
    const newCombo = {
      id: editingCombo ? editingCombo.id : `combo-${Date.now()}`,
      name: comboName.trim(),
      tag: comboTag.trim(),
      pricingType: comboPricingType,
      pricePerDay: Number(comboPrice) || 0,
      discountPrice: comboDiscount ? Number(comboDiscount) : null,
      pricePerHour: comboPricePerHour ? Number(comboPricePerHour) : null,
      includedHours: Number(comboIncludedHours) || 4,
      extraHourPrice: comboExtraHourPrice ? Number(comboExtraHourPrice) : null,
      isDjCombo: Boolean(comboIsDj),
      description: comboDesc.trim(),
      items: comboItemsText.split(',').map(s => ({
        equipmentId: 'eq-custom',
        quantity: 1,
        name: s.trim()
      })).filter(i => i.name),
      checklist: editingCombo?.checklist || [
        "Cables de corriente encauchetados",
        "Cables XLR balanceados de señal",
        "Trípodes metálicos de seguridad"
      ]
    };
    if (onSaveCombo) onSaveCombo(newCombo);
    setIsComboModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Subtabs del Módulo: Equipos vs Combos */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111622] p-3 sm:p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('individual')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'individual'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Equipos Individuales ({equipmentList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('combos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'combos'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Combos & Paquetes ({combosList.length})</span>
          </button>
        </div>

        {activeTab === 'individual' ? (
          <button
            onClick={openNewModal}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Producto</span>
          </button>
        ) : (
          <button
            onClick={openNewComboModal}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Combo DJ</span>
          </button>
        )}
      </div>

      {/* SECCIÓN 1: EQUIPOS INDIVIDUALES */}
      {activeTab === 'individual' && (
        <div className="space-y-4">
          {/* Barra de Filtros y Búsqueda */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111622] p-4 rounded-2xl border border-slate-800">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Categorías (Dinámicas según equipos del usuario) */}
            <div className="flex flex-wrap items-center gap-1.5">
              {availableCategories.map(cat => (
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
          </div>

          {/* Grid de Equipos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-[#111622] rounded-2xl border border-slate-800">
                <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-white font-bold text-sm">No hay equipos en esta categoría</p>
                <p className="text-xs text-slate-400 mt-1">Presiona "Crear Producto" para agregar equipos nuevos.</p>
              </div>
            ) : (
              filteredEquipment.map(item => (
                <div 
                  key={item.id}
                  className="bg-[#111622] rounded-2xl border border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group"
                >
                  <div>
                    {/* Header Item */}
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 relative">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          loading="lazy"
                        />
                        {item.isPopular && (
                          <span className="absolute top-1 left-1 bg-amber-500 text-black p-0.5 rounded shadow">
                            <Star className="w-2.5 h-2.5 fill-black" />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {item.category}
                          </span>
                          {item.isDjService && (
                            <span className="text-[10px] font-black uppercase text-purple-300 bg-purple-500/15 px-1.5 py-0.5 rounded border border-purple-500/30">
                              🎧 Show DJ
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-white text-sm mt-1 truncate" title={item.name}>
                          {item.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          {item.pricePerDay > 0 && (
                            <span className="text-emerald-400 font-extrabold text-xs">
                              {formatCurrency(item.pricePerDay)} <span className="text-slate-500 font-normal">/día</span>
                            </span>
                          )}
                          {item.pricePerHour > 0 && (
                            <span className="text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded text-[10px] border border-cyan-500/20">
                              ⏱️ {formatCurrency(item.pricePerHour)}/hr {item.minHours ? `(min ${item.minHours}h)` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stock y Accesorios */}
                    <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Stock en Bodega:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStockQuickChange(item, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-black active:scale-90"
                            title="Disminuir stock"
                          >
                            -
                          </button>
                          <span className="font-black text-white w-6 text-center font-mono">
                            {item.totalStock}
                          </span>
                          <button
                            onClick={() => handleStockQuickChange(item, 1)}
                            className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-black active:scale-90"
                            title="Aumentar stock"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {item.includes && item.includes.length > 0 && (
                        <div className="flex items-start gap-1 text-[11px] text-slate-400 truncate">
                          <Cable className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="truncate">Cables: {item.includes.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones Editar y Eliminar */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-[10px] text-slate-500 font-mono">ID: {item.id}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition-colors"
                        title="Editar equipo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = await showConfirm({
                            title: '¿Eliminar equipo?',
                            text: `¿Deseas eliminar permanentemente "${item.name}" del inventario?`,
                            confirmButtonText: 'Sí, eliminar',
                            icon: 'warning'
                          });
                          if (confirmed) {
                            onDeleteEquipment(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                        title="Eliminar equipo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: COMBOS DJ & PAQUETES */}
      {activeTab === 'combos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {combosList.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-[#111622] rounded-2xl border border-slate-800">
                <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-white font-bold text-sm">No tienes combos creados</p>
                <p className="text-xs text-slate-400 mt-1">Crea paquetes armados para matrimonios, discotecas o fiestas.</p>
              </div>
            ) : (
              combosList.map((combo) => (
                <div 
                  key={combo.id}
                  className="bg-[#111622] rounded-2xl border border-slate-800 p-4 flex flex-col justify-between hover:border-amber-500/30 transition-all shadow-md group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black px-2 py-0.5 rounded">
                        {combo.tag || 'Combo Pro'}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-black text-amber-400">
                          {formatCurrency(combo.pricePerDay)}
                        </span>
                        {combo.discountPrice && (
                          <span className="block text-[10px] text-slate-500 line-through">
                            {formatCurrency(combo.discountPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-black text-white text-base mt-2">
                      {combo.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {combo.description}
                    </p>

                    {/* Ítems que incluye el combo */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80">
                      <p className="text-[11px] font-bold text-slate-400 mb-1">Equipos en el combo:</p>
                      <ul className="space-y-1">
                        {(combo.items || []).map((it, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span className="truncate">{it.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-500">ID: {combo.id}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditComboModal(combo)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 text-xs font-bold transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      {onDeleteCombo && (
                        <button
                          onClick={async () => {
                            const confirmed = await showConfirm({
                              title: '¿Eliminar combo?',
                              text: `¿Deseas eliminar permanentemente el paquete "${combo.name}"?`,
                              confirmButtonText: 'Sí, eliminar combo',
                              icon: 'warning'
                            });
                            if (confirmed) {
                              onDeleteCombo(combo.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                          title="Eliminar combo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR EQUIPO INDIVIDUAL (Con subida de fotos desde Celular/PC) */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
          >
            
            {/* Header Modal */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828] shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">
                  {editingItem ? 'Editar Equipo de Sonido' : 'Nuevo Producto / Equipo'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario con Scroll */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* SECCIÓN DE FOTO (SUBIR DESDE CELULAR O PC) */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Foto del Equipo (Visual en Catálogo)
                </label>

                <div className="flex items-center gap-4">
                  {/* Vista previa miniatura */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 relative flex items-center justify-center shadow-inner">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-600" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Acciones para subir */}
                  <div className="flex-1 space-y-2">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden" 
                    />

                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-2.5 px-3 rounded-xl text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? 'Procesando foto...' : 'Subir Foto desde Celular o PC'}</span>
                    </button>

                    <div className="relative">
                      <input
                        type="url"
                        placeholder="O pegar enlace URL de la foto..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets Rápidos */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">O elige una foto sugerida:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {EQUIPMENT_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nombre del Producto */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Equipo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cabina Activa JBL PRX815W (1500W)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Selección Visual de Categoría */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    Categoría del Equipo *
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Actual: {category}
                  </span>
                </div>

                {/* Chips visuales de selección rápida */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Bafles y Bajos', icon: '🔊' },
                    { label: 'Consolas y DJ', icon: '🎛️' },
                    { label: 'Microfonía', icon: '🎙️' },
                    { label: 'Luces y Efectos', icon: '💡' },
                    { label: 'Cables y Energía', icon: '🔌' },
                    { label: 'Estructuras y Truss', icon: '🏗️' },
                    { label: 'Efectos & Humo', icon: '💨' }
                  ].map((catItem) => (
                    <button
                      key={catItem.label}
                      type="button"
                      onClick={() => setCategory(catItem.label)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                        category === catItem.label
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                          : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{catItem.icon}</span>
                      <span>{catItem.label}</span>
                    </button>
                  ))}
                </div>

                {/* Input para categoría personalizada */}
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 shrink-0">O escribir nueva:</span>
                  <input
                    type="text"
                    placeholder="Ej. Pantallas LED, Tarimas, Backline..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Stock Físico */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Stock Físico en Bodega (Cantidad de unidades disponibles) *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTotalStock(Math.max(1, Number(totalStock || 1) - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-white font-black text-base hover:bg-slate-800 active:scale-90"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalStock}
                    onChange={(e) => setTotalStock(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center text-sm font-bold text-white font-mono focus:outline-none focus:border-amber-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setTotalStock(Number(totalStock || 0) + 1)}
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-white font-black text-base hover:bg-slate-800 active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Modalidad de Cobro: Horas, Días o Ambos */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Modalidad de Cobro / Alquiler *
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                    <input
                      type="checkbox"
                      checked={isDjService}
                      onChange={(e) => setIsDjService(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-purple-500 bg-slate-900 border-slate-700"
                    />
                    <span>🎧 Es Servicio de DJ / Personal</span>
                  </label>
                </div>

                {/* Selector de Píldoras */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'days', label: '📅 Solo x Día', desc: 'Tarifa diaria 24h' },
                    { id: 'hours', label: '⏱️ Solo x Horas', desc: 'Para DJ o horas' },
                    { id: 'both', label: '🔀 Horas o Días', desc: 'Cliente elige' }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPricingType(mode.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        pricingType === mode.id
                          ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className="block text-xs font-bold">{mode.label}</span>
                      <span className={`block text-[10px] mt-0.5 ${pricingType === mode.id ? 'text-black/80 font-bold' : 'text-slate-500'}`}>{mode.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Inputs de Precios Dinámicos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {(pricingType === 'days' || pricingType === 'both') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Precio Alquiler x Día ($ COP) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required={pricingType === 'days'}
                        placeholder="Ej. 80000"
                        value={pricePerDay}
                        onChange={(e) => setPricePerDay(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-emerald-400 font-extrabold focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  )}

                  {(pricingType === 'hours' || pricingType === 'both') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Precio Alquiler x Hora ($ COP) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required={pricingType === 'hours'}
                        placeholder="Ej. 35000"
                        value={pricePerHour}
                        onChange={(e) => setPricePerHour(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-cyan-400 font-extrabold focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  )}

                  {(pricingType === 'hours' || pricingType === 'both') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Mínimo de Horas a Contratar
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        placeholder="Ej. 2 o 4 horas"
                        value={minHours}
                        onChange={(e) => setMinHours(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 sm:pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                      <input
                        type="checkbox"
                        checked={isPopular}
                        onChange={(e) => setIsPopular(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                      />
                      <span>⭐ Marcar como Destacado</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Cables & Accesorios que incluye */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Accesorios y Cables que incluye (Separados por coma)
                </label>
                <input
                  type="text"
                  placeholder="Ej. 1 Cable de poder, 1 Cable XLR balanceado 10m, 1 Trípode de seguridad"
                  value={includesText}
                  onChange={(e) => setIncludesText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Descripción & Especificaciones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Descripción Comercial</label>
                  <textarea
                    rows={2}
                    placeholder="Ideal para fiestas de hasta 100 personas..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Ficha Técnica / Specs</label>
                  <textarea
                    rows={2}
                    placeholder="1500W Peak | DSP integrado | Bluetooth..."
                    value={specifications}
                    onChange={(e) => setSpecifications(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 resize-none"
                  />
                </div>
              </div>

              {/* Botón Guardar */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Guardar Cambios' : 'Crear Producto'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR COMBO DJ */}
      {isComboModalOpen && (
        <div 
          onClick={() => setIsComboModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828]">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">
                  {editingCombo ? 'Editar Combo DJ' : 'Crear Nuevo Combo / Paquete'}
                </h3>
              </div>
              <button 
                onClick={() => setIsComboModalOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleComboSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Paquete *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Combo Fiesta Pro (Bodas & 15 Años)"
                  value={comboName}
                  onChange={(e) => setComboName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Modalidad del Combo */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Modalidad del Paquete / Combo *
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                    <input
                      type="checkbox"
                      checked={comboIsDj}
                      onChange={(e) => setComboIsDj(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-purple-500 bg-slate-900 border-slate-700"
                    />
                    <span>🎧 Incluye Show de DJ en Vivo</span>
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'days', label: '📅 Solo Día', desc: 'Tarifa completa 24h' },
                    { id: 'hours', label: '⏱️ Solo Horas', desc: 'Show DJ 4h o 6h' },
                    { id: 'both', label: '🔀 Horas o Días', desc: 'Ambas opciones' }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setComboPricingType(mode.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        comboPricingType === mode.id
                          ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className="block text-xs font-bold">{mode.label}</span>
                      <span className={`block text-[10px] mt-0.5 ${comboPricingType === mode.id ? 'text-black/80 font-bold' : 'text-slate-500'}`}>{mode.desc}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Etiqueta Destacada</label>
                    <input
                      type="text"
                      placeholder="Ej. Más Pedido, Descuento 20%"
                      value={comboTag}
                      onChange={(e) => setComboTag(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {(comboPricingType === 'days' || comboPricingType === 'both') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Precio Día Completo ($ COP) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required={comboPricingType === 'days'}
                        placeholder="Ej. 290000"
                        value={comboPrice}
                        onChange={(e) => setComboPrice(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-emerald-400 font-extrabold focus:outline-none"
                      />
                    </div>
                  )}

                  {(comboPricingType === 'days' || comboPricingType === 'both') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Precio con Descuento ($ COP)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ej. 250000 (Opcional)"
                        value={comboDiscount}
                        onChange={(e) => setComboDiscount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-400 font-extrabold focus:outline-none"
                      />
                    </div>
                  )}

                  {(comboPricingType === 'hours' || comboPricingType === 'both') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Horas Base del Paquete
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        placeholder="Ej. 4 horas"
                        value={comboIncludedHours}
                        onChange={(e) => setComboIncludedHours(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  )}

                  {(comboPricingType === 'hours' || comboPricingType === 'both') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Precio del Paquete x Horas ($ COP)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ej. 250000"
                        value={comboPricePerHour}
                        onChange={(e) => setComboPricePerHour(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-cyan-400 font-extrabold focus:outline-none"
                      />
                    </div>
                  )}

                  {(comboPricingType === 'hours' || comboPricingType === 'both') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Precio Hora Extra Adicional ($ COP)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ej. 40000"
                        value={comboExtraHourPrice}
                        onChange={(e) => setComboExtraHourPrice(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Equipos Incluidos (Separados por coma) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ej. 2 Cabinas JBL 15, 1 Bajo Subwoofer, 1 Consola Pioneer DJ, 2 Micrófonos Shure"
                  value={comboItemsText}
                  onChange={(e) => setComboItemsText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Descripción para el Cliente</label>
                <textarea
                  rows={2}
                  placeholder="Paquete completo ideal para bodas y celebraciones de hasta 150 personas..."
                  value={comboDesc}
                  onChange={(e) => setComboDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsComboModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  Guardar Combo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
