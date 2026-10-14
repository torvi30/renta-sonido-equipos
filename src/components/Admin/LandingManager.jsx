import { useState, useRef, useEffect } from 'react';
import { 
  Layout, Image, Type, MapPin, 
  HelpCircle, Plus, Trash2, CheckCircle2, Save, Package,
  Camera, Upload, Edit2, X, Layers
} from 'lucide-react';
import { processImageFile } from '../../services/storageService';
import { showConfirm, showAlert, showError } from '../../services/alertService';

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

// Presets sugeridos para fotos de portada (Hero Banner)
const HERO_PHOTO_PRESETS = [
  { name: "Luces & DJ", url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80" },
  { name: "Cabezas Móviles", url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80" },
  { name: "Consola Pioneer", url: "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=1200&q=80" },
  { name: "Boda Elegante", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80" }
];

// Presets para fotos de eventos reales
const GALLERY_PRESETS = [
  { title: "Boda Campestre con Cabinas Activas", tag: "Bodas", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80" },
  { title: "DJ Set en Vivo & Luces Robóticas", tag: "DJ Set", url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80" },
  { title: "Concierto Acústico & Sonido Pro", tag: "Conciertos", url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80" },
  { title: "Iluminación DMX Wash & Cabezas Móviles", tag: "Luces & Efectos", url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80" },
  { title: "Fiesta de Quinceañero con Pista LED", tag: "Quinceañero", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80" },
  { title: "Evento Corporativo & Sonido Conferencia", tag: "Corporativo", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80" },
];

export default function LandingManager({ 
  settings, 
  onSaveSettings,
  combosList = [],
  onSaveCombo,
  onDeleteCombo
}) {
  const [formData, setFormData] = useState({
    businessName: settings.businessName || '',
    djName: settings.djName || '',
    heroBadge: settings.heroBadge || 'Audio Pro & Cabinas DJ',
    heroTitle: settings.heroTitle || 'Alquiler de Sonido Profesional, Iluminación y Cabinas DJ',
    heroSubtitle: settings.heroSubtitle || 'Arma tu paquete para fiestas, bodas y eventos corporativos.',
    heroImageUrl: settings.heroImageUrl || HERO_PHOTO_PRESETS[0].url,
    cityCoverage: settings.cityCoverage || 'Medellín y Alrededores',
    instagramUser: settings.instagramUser || '@sound_control_dj',
    tiktokUser: settings.tiktokUser || '',
    phone: settings.phone || '',
    showFaqSection: settings.showFaqSection ?? true,
    gallery: settings.gallery || [],
    faqs: settings.faqs || []
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('texts'); // 'texts' | 'gallery' | 'combos' | 'faqs'

  // Ref para subir foto de portada
  const heroFileInputRef = useRef(null);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  // Estados Modal Galería
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryIndex, setEditingGalleryIndex] = useState(null);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryTag, setGalleryTag] = useState('Bodas');
  const [galleryImageUrl, setGalleryImageUrl] = useState('');
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const galleryFileInputRef = useRef(null);

  // Estados Modal Combos
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [comboName, setComboName] = useState('');
  const [comboTag, setComboTag] = useState('Más Pedido');
  const [comboPrice, setComboPrice] = useState('');
  const [comboDiscount, setComboDiscount] = useState('');
  const [comboDesc, setComboDesc] = useState('');
  const [comboItemsText, setComboItemsText] = useState('');

  // Manejar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isGalleryModalOpen) setIsGalleryModalOpen(false);
        if (isComboModalOpen) setIsComboModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryModalOpen, isComboModalOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = (updatedData = null) => {
    const dataToSave = updatedData || formData;
    onSaveSettings({
      ...settings,
      ...dataToSave
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Subir foto de portada desde Celular/PC
  const handleHeroPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingHero(true);
      const compressedDataUrl = await processImageFile(file, 1200, 0.85);
      if (compressedDataUrl) {
        handleInputChange('heroImageUrl', compressedDataUrl);
      }
    } catch (err) {
      showError('Error al subir foto', err.message || 'Error al procesar la foto de portada.');
    } finally {
      setIsUploadingHero(false);
      if (heroFileInputRef.current) heroFileInputRef.current.value = '';
    }
  };

  // ---------------------------------------------
  // GESTIÓN DE GALERÍA DE FOTOS REALES
  // ---------------------------------------------
  const handleOpenNewGalleryPhoto = () => {
    setEditingGalleryIndex(null);
    setGalleryTitle('');
    setGalleryTag('Bodas');
    setGalleryImageUrl(GALLERY_PRESETS[0].url);
    setIsGalleryModalOpen(true);
  };

  const handleOpenEditGalleryPhoto = (index) => {
    const item = formData.gallery[index];
    if (!item) return;
    setEditingGalleryIndex(index);
    setGalleryTitle(item.title || '');
    setGalleryTag(item.tag || 'Social');
    setGalleryImageUrl(item.imageUrl || '');
    setIsGalleryModalOpen(true);
  };

  const handleGalleryPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingGallery(true);
      const compressedDataUrl = await processImageFile(file, 900, 0.82);
      if (compressedDataUrl) {
        setGalleryImageUrl(compressedDataUrl);
      }
    } catch (err) {
      showError('Error al subir foto', err.message || 'Error al procesar la foto.');
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  const handleSaveGallerySubmit = (e) => {
    e.preventDefault();
    if (!galleryImageUrl) {
      showAlert({
        title: 'Imagen requerida',
        text: 'Por favor selecciona o sube una imagen para el evento.',
        icon: 'warning'
      });
      return;
    }

    const newItem = {
      title: galleryTitle.trim() || 'Montaje de Sonido Profesional',
      tag: galleryTag.trim() || 'Evento',
      imageUrl: galleryImageUrl
    };

    let updatedGallery;
    if (editingGalleryIndex !== null) {
      updatedGallery = [...formData.gallery];
      updatedGallery[editingGalleryIndex] = newItem;
    } else {
      updatedGallery = [newItem, ...formData.gallery];
    }

    const updatedFormData = { ...formData, gallery: updatedGallery };
    setFormData(updatedFormData);
    handleSaveAll(updatedFormData);
    setIsGalleryModalOpen(false);
  };

  const handleDeleteGalleryPhoto = async (index) => {
    const confirmed = await showConfirm({
      title: '¿Eliminar foto del portafolio?',
      text: 'Esta foto ya no aparecerá en la galería de tu página web.',
      confirmButtonText: 'Sí, eliminar',
      icon: 'warning'
    });
    if (confirmed) {
      const updatedGallery = formData.gallery.filter((_, i) => i !== index);
      const updatedFormData = { ...formData, gallery: updatedGallery };
      setFormData(updatedFormData);
      handleSaveAll(updatedFormData);
    }
  };

  // ---------------------------------------------
  // GESTIÓN DE FAQS
  // ---------------------------------------------
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

  // ---------------------------------------------
  // GESTIÓN DE COMBOS
  // ---------------------------------------------
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
    setComboDesc(c.description || '');
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
        "Cables XLR balanceados de señal",
        "Trípodes metálicos de seguridad"
      ]
    };
    if (onSaveCombo) onSaveCombo(newCombo);
    setIsComboModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Superior con botón Guardar */}
      <div className="bg-[#111622] p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              Administrador de Tu Página Web & Portafolio
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Sube fotos de tus eventos reales, edita textos de portada, paquetes y preguntas frecuentes.
          </p>
        </div>

        <button
          onClick={() => handleSaveAll()}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all self-stretch sm:self-auto justify-center"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>¡Cambios Guardados!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Publicar en la Web</span>
            </>
          )}
        </button>
      </div>

      {/* Subtabs de Navegación del Editor Web */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('texts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'texts'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Textos & Portada</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gallery')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'gallery'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>📸 Galería de Eventos Reales ({formData.gallery.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('combos')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'combos'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Combos & Paquetes ({combosList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('faqs')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'faqs'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Preguntas Frecuentes ({formData.faqs.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 1: TEXTOS Y PORTADA HERO */}
      {/* ------------------------------------------------------------- */}
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
          </div>

          {/* Formulario de Textos & Foto de Portada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Columna Textos */}
            <div className="bg-[#111622] p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-4 h-4 text-amber-400" />
                Textos del Banner Principal
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre Comercial del Negocio
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título Principal de la Web
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
                  Subtítulo / Mensaje Promocional
                </label>
                <textarea
                  rows={3}
                  value={formData.heroSubtitle}
                  onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Columna Foto de Portada y Redes */}
            <div className="bg-[#111622] p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Image className="w-4 h-4 text-cyan-400" />
                Foto de Portada & Contacto
              </h4>

              {/* Botón para subir foto de portada */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Foto de Fondo (Subir desde Celular o PC)
                </label>

                <input 
                  type="file"
                  ref={heroFileInputRef}
                  accept="image/*"
                  onChange={handleHeroPhotoUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploadingHero}
                    onClick={() => heroFileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>{isUploadingHero ? 'Cargando foto...' : 'Subir Foto de Portada'}</span>
                  </button>
                </div>

                <input
                  type="url"
                  placeholder="O pegar URL de imagen..."
                  value={formData.heroImageUrl}
                  onChange={(e) => handleInputChange('heroImageUrl', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />

                {/* Presets Rápidos */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">O escoge una foto sugerida:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {HERO_PHOTO_PRESETS.map((p, idx) => (
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
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
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

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 2: GALERÍA DE FOTOS REALES DE EVENTOS (NUEVO) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-4">
          
          {/* Header de la Galería */}
          <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Fotos Reales de tus Montajes & Eventos</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Muestra a tus clientes cómo quedan tus cabinas, iluminación y consolas en eventos reales.
              </p>
            </div>

            <button
              onClick={handleOpenNewGalleryPhoto}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Subir Foto de Evento</span>
            </button>
          </div>

          {/* Grid de Fotos de la Galería */}
          {formData.gallery.length === 0 ? (
            <div className="text-center py-16 bg-[#111622] rounded-2xl border border-slate-800">
              <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="font-extrabold text-white text-base">Aún no has subido fotos de eventos</h4>
              <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                Sube fotos de tus bodas, fiestas o montajes para que los clientes confíen y coticen más rápido.
              </p>
              <button
                onClick={handleOpenNewGalleryPhoto}
                className="mt-4 bg-amber-500 text-black font-bold px-4 py-2 rounded-xl text-xs"
              >
                + Subir primera foto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.gallery.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between"
                >
                  {/* Imagen */}
                  <div className="aspect-[4/3] w-full overflow-hidden relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black shadow-md">
                      {item.tag || 'Evento'}
                    </span>
                  </div>

                  {/* Pie de foto y acciones */}
                  <div className="p-3 bg-[#111622] border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate" title={item.title}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-500">Foto #{idx + 1}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditGalleryPhoto(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                        title="Editar título o etiqueta"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGalleryPhoto(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 3: COMBOS Y PAQUETES */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'combos' && (
        <div className="space-y-4">
          <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white">Combos Promocionales</h3>
              <p className="text-xs text-slate-400">Paquetes armados con descuento que ven tus clientes en la web.</p>
            </div>
            <button
              onClick={handleOpenNewCombo}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-4 py-2 rounded-xl text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Combo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {combosList.map((c) => (
              <div key={c.id} className="bg-[#111622] rounded-2xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase bg-amber-500 text-black px-2 py-0.5 rounded">
                    {c.tag}
                  </span>
                  <span className="text-sm font-black text-amber-400">
                    ${Number(c.pricePerDay).toLocaleString()}
                  </span>
                </div>
                <h4 className="font-extrabold text-white text-base">{c.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenEditCombo(c)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {onDeleteCombo && (
                    <button
                      onClick={async () => {
                        const confirmed = await showConfirm({
                          title: '¿Eliminar combo?',
                          text: `¿Deseas eliminar permanentemente el paquete "${c.name}"?`,
                          confirmButtonText: 'Sí, eliminar',
                          icon: 'warning'
                        });
                        if (confirmed) onDeleteCombo(c.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 4: PREGUNTAS FRECUENTES */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'faqs' && (
        <div className="bg-[#111622] p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              Preguntas Frecuentes de Clientes
            </h4>
            <button
              onClick={handleAddFaq}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Pregunta</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.faqs.map((faq, index) => (
              <div key={index} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleUpdateFaq(index, 'question', e.target.value)}
                    placeholder="¿Pregunta frecuente?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
                  />
                  <button
                    onClick={() => handleDeleteFaq(index)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => handleUpdateFaq(index, 'answer', e.target.value)}
                  placeholder="Respuesta explicativa para el cliente..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none resize-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL SUBIR / EDITAR FOTO DE EVENTO REAL */}
      {/* ------------------------------------------------------------- */}
      {isGalleryModalOpen && (
        <div 
          onClick={() => setIsGalleryModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
          >
            
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828]">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">
                  {editingGalleryIndex !== null ? 'Editar Foto de Evento' : 'Subir Foto de Evento Real'}
                </h3>
              </div>
              <button 
                onClick={() => setIsGalleryModalOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallerySubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              
              {/* Sección de la foto */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="aspect-[16/9] w-full rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center relative">
                  {galleryImageUrl ? (
                    <img src={galleryImageUrl} alt="Preview evento" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-slate-600" />
                  )}
                  {isUploadingGallery && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <input 
                  type="file"
                  ref={galleryFileInputRef}
                  accept="image/*"
                  onChange={handleGalleryPhotoUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isUploadingGallery}
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-2.5 px-3 rounded-xl text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingGallery ? 'Procesando foto...' : 'Subir Foto desde Celular o PC'}</span>
                </button>

                <input
                  type="url"
                  placeholder="O pegar URL directa de la foto..."
                  value={galleryImageUrl}
                  onChange={(e) => setGalleryImageUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />

                {/* Presets */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">O escoge de fotos sugeridas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {GALLERY_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setGalleryImageUrl(p.url);
                          setGalleryTitle(p.title);
                          setGalleryTag(p.tag);
                        }}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                      >
                        {p.tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Título de la foto */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Título o Locación del Evento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Boda Campestre en Finca La Cabaña (2 Cabinas + DMX)"
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Etiqueta / Tipo de Evento */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Categoría / Etiqueta del Evento
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['Bodas', 'Quinceañero', 'DJ Set', 'Conciertos', 'Luces & Montaje', 'Corporativo'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setGalleryTag(cat)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        galleryTag === cat
                          ? 'bg-amber-500 text-black'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="O escribe una etiqueta personalizada..."
                  value={galleryTag}
                  onChange={(e) => setGalleryTag(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Botón Guardar */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  {editingGalleryIndex !== null ? 'Guardar Cambios' : 'Publicar en Galería'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR COMBO */}
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
              <button onClick={() => setIsComboModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveComboSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Paquete *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Combo Fiesta Pro (Bodas & 15 Años)"
                  value={comboName}
                  onChange={(e) => setComboName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Etiqueta</label>
                  <input
                    type="text"
                    value={comboTag}
                    onChange={(e) => setComboTag(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Precio x Día ($ COP) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={comboPrice}
                    onChange={(e) => setComboPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-400 font-extrabold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Equipos Incluidos (Separados por coma) *</label>
                <textarea
                  rows={2}
                  required
                  value={comboItemsText}
                  onChange={(e) => setComboItemsText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Descripción para el Cliente</label>
                <textarea
                  rows={2}
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
