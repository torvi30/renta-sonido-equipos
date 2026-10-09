import React, { useState } from 'react';
import { 
  Layout, Image, Type, MapPin, Phone, 
  HelpCircle, Plus, Trash2, CheckCircle2, Sparkles, Eye, Save, Package 
} from 'lucide-react';

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);


export default function LandingManager({ 
  settings, 
  onSaveSettings,
  combosList,
  onSaveCombo,
  onDeleteCombo
}) {
  const [formData, setFormData] = useState({
    businessName: settings.businessName || '',
    djName: settings.djName || '',
    heroBadge: settings.heroBadge || 'Audio Pro & Cabinas DJ',
    heroTitle: settings.heroTitle || 'Alquiler de Sonido Profesional, Iluminación y Cabinas DJ',
    heroSubtitle: settings.heroSubtitle || 'Arma tu paquete para fiestas, bodas y eventos corporativos.',
    heroImageUrl: settings.heroImageUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    cityCoverage: settings.cityCoverage || 'Medellín y Alrededores',
    instagramUser: settings.instagramUser || '@sound_control_dj',
    tiktokUser: settings.tiktokUser || '',
    phone: settings.phone || '',
    showFaqSection: settings.showFaqSection ?? true,
    faqs: settings.faqs || []
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('texts'); // 'texts', 'combos', 'faqs'

  // Combos Modal State
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [comboName, setComboName] = useState('');
  const [comboTag, setComboTag] = useState('Más Pedido');
  const [comboPrice, setComboPrice] = useState('');
  const [comboDiscount, setComboDiscount] = useState('');
  const [comboDesc, setComboDesc] = useState('');
  const [comboItemsText, setComboItemsText] = useState('');

  // Sugerencias de fotos de portada profesionales
  const photoPresets = [
    { name: "Luces & DJ", url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80" },
    { name: "Cabezas Móviles", url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80" },
    { name: "Consola Pioneer", url: "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=1200&q=80" },
    { name: "Boda Elegante", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80" }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = (e) => {
    if (e) e.preventDefault();
    onSaveSettings({
      ...settings,
      ...formData
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // FAQs management
  const handleAddFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        { question: 'Nueva pregunta frecuente', answer: 'Respuesta detallada para tus clientes...' }
      ]
    }));
  };

  const handleUpdateFaq = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.faqs];
      updated[index][field] = value;
      return { ...prev, faqs: updated };
    });
  };

  const handleDeleteFaq = (index) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  // Combo Modal Actions
  const handleOpenNewCombo = () => {
    setEditingCombo(null);
    setComboName('');
    setComboTag('Recomendado');
    setComboPrice('');
    setComboDiscount('');
    setComboDesc('');
    setComboItemsText('2 Cabinas JBL 15 pulgadas, Consola DJ Pioneer, Luces Par LED');
    setIsComboModalOpen(true);
  };


  const handleOpenEditCombo = (c) => {
    setEditingCombo(c);
    setComboName(c.name);
    setComboTag(c.tag || 'Combo Pro');
    setComboPrice(c.pricePerDay);
    setComboDiscount(c.discountPrice || '');
    setComboDesc(c.description);
    setComboItemsText(c.items ? c.items.map(i => i.name).join(', ') : '');
    setIsComboModalOpen(true);
  };

  const handleSaveComboSubmit = (e) => {
    e.preventDefault();
    const newCombo = {
      id: editingCombo ? editingCombo.id : `combo-${Date.now()}`,
      name: comboName.trim(),
      tag: comboTag.trim(),
      pricePerDay: Number(comboPrice) || 0,
      discountPrice: comboDiscount ? Number(comboDiscount) : null,
      description: comboDesc.trim(),
      items: comboItemsText.split(',').map(s => ({
        equipmentId: 'eq-custom',
        quantity: 1,
        name: s.trim()
      })).filter(i => i.name),
      checklist: editingCombo?.checklist || [
        "Cables de corriente encauchetados",
        "Cables XLR balanceados",
        "Trípodes metálicos de seguridad"
      ]
    };
    onSaveCombo(newCombo);
    setIsComboModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Save Status */}
      <div className="bg-[#111622] p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              Administrador de la Página Web (Landing Page)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Personaliza tus textos, fotos de portada, paquetes y preguntas sin tocar código.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>¡Guardado con Éxito!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('texts')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'texts'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Textos & Portada</span>
        </button>

        <button
          onClick={() => setActiveSubTab('combos')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'combos'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Combos & Paquetes ({combosList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('faqs')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'faqs'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Preguntas Frecuentes ({formData.faqs.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: TEXTOS Y PORTADA */}
      {activeSubTab === 'texts' && (
        <div className="space-y-6">
          
          {/* Live Preview Card */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="absolute inset-0 z-0">
              <img 
                src={formData.heroImageUrl} 
                alt="Portada Preview" 
                className="w-full h-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d121d] via-[#0d121d]/90 to-transparent" />
            </div>

            <div className="relative z-10 p-6 sm:p-8 max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black rounded-lg">
                  {formData.businessName || 'Tu Negocio'}
                </span>
                <span className="text-xs text-amber-300 font-semibold">
                  • {formData.heroBadge}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {formData.heroTitle}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {formData.heroSubtitle}
              </p>
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {formData.cityCoverage}
                </span>
                {formData.instagramUser && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <InstagramIcon className="w-3.5 h-3.5" />
                    {formData.instagramUser}
                  </span>
                )}

              </div>
            </div>
            
            <div className="absolute top-3 right-3 bg-black/60 px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Eye className="w-3 h-3 text-cyan-400" />
              Vista Previa en Vivo
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-[#111622] p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-4 h-4 text-amber-400" />
                Textos del Banner Principal
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título Grande de la Web
                </label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Etiqueta Pequeña (Badge)
                </label>
                <input
                  type="text"
                  value={formData.heroBadge}
                  onChange={(e) => handleInputChange('heroBadge', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subtítulo / Mensaje de Bienvenida
                </label>
                <textarea
                  rows={3}
                  value={formData.heroSubtitle}
                  onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="bg-[#111622] p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Image className="w-4 h-4 text-cyan-400" />
                Imagen de Portada & Contacto
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL de la Foto de Fondo
                </label>
                <input
                  type="url"
                  value={formData.heroImageUrl}
                  onChange={(e) => handleInputChange('heroImageUrl', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Presets */}
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  O escoge una foto recomendada con 1 clic:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {photoPresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInputChange('heroImageUrl', p.url)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-700"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ciudad / Cobertura
                  </label>
                  <input
                    type="text"
                    value={formData.cityCoverage}
                    onChange={(e) => handleInputChange('cityCoverage', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Usuario Instagram
                  </label>
                  <input
                    type="text"
                    placeholder="@tunegocio"
                    value={formData.instagramUser}
                    onChange={(e) => handleInputChange('instagramUser', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* SUBTAB 2: COMBOS Y PAQUETES */}
      {activeSubTab === 'combos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">
              Estos combos aparecen destacados en la parte superior del catálogo público.
            </span>
            <button
              onClick={handleOpenNewCombo}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-3.5 py-1.5 rounded-xl text-xs shadow-md shadow-amber-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Combo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {combosList.map((combo) => (
              <div 
                key={combo.id}
                className="bg-[#111622] p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {combo.tag || 'Combo'}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar el combo "${combo.name}"?`)) {
                          onDeleteCombo(combo.id);
                        }
                      }}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-extrabold text-white text-base mt-2">{combo.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{combo.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Precio x Día:</span>
                    <span className="text-base font-black text-amber-400">
                      ${Number(combo.discountPrice || combo.pricePerDay).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenEditCombo(combo)}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: PREGUNTAS FRECUENTES (FAQ) */}
      {activeSubTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#111622] p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showFaq"
                checked={formData.showFaqSection}
                onChange={(e) => handleInputChange('showFaqSection', e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
              />
              <label htmlFor="showFaq" className="text-xs font-bold text-slate-200 cursor-pointer">
                Mostrar sección de Preguntas Frecuentes al final de la Landing
              </label>
            </div>

            <button
              onClick={handleAddFaq}
              className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold px-3 py-1.5 rounded-xl text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Pregunta</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-[#111622] p-4 rounded-2xl border border-slate-800 space-y-2 relative"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    Pregunta #{index + 1}
                  </span>
                  <button
                    onClick={() => handleDeleteFaq(index)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleUpdateFaq(index, 'question', e.target.value)}
                  placeholder="Pregunta..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                />

                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => handleUpdateFaq(index, 'answer', e.target.value)}
                  placeholder="Respuesta que verá el cliente..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none resize-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para Crear / Editar Combo */}
      {isComboModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-extrabold text-white">
              {editingCombo ? 'Editar Combo' : 'Crear Nuevo Combo de Sonido'}
            </h3>

            <form onSubmit={handleSaveComboSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Combo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pack Fiesta DJ 150 Personas"
                  value={comboName}
                  onChange={(e) => setComboName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Etiqueta</label>
                  <input
                    type="text"
                    placeholder="Ej. Más Pedido, Boda"
                    value={comboTag}
                    onChange={(e) => setComboTag(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Precio Día ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="300000"
                    value={comboPrice}
                    onChange={(e) => setComboPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Precio con Oferta (Opcional)</label>
                <input
                  type="number"
                  placeholder="Ej. 250000"
                  value={comboDiscount}
                  onChange={(e) => setComboDiscount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción Breve</label>
                <textarea
                  rows={2}
                  placeholder="Ideal para cumpleaños, 15 años y grados..."
                  value={comboDesc}
                  onChange={(e) => setComboDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Equipos Incluidos (separados por comas)</label>
                <input
                  type="text"
                  placeholder="2 Cabinas JBL 15'', Consola DJ, Luces LED"
                  value={comboItemsText}
                  onChange={(e) => setComboItemsText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComboModalOpen(false)}
                  className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 text-black py-2.5 rounded-xl text-xs font-extrabold shadow-lg shadow-amber-500/20"
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
