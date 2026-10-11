import React, { useState, useEffect, memo } from 'react';
import { 
  Camera, Sparkles, MessageCircle, X, Maximize2, 
  ChevronLeft, ChevronRight, Eye, ShieldCheck, Flame
} from 'lucide-react';

function EventGallery({ gallery = [], settings = {} }) {
  const [selectedTag, setSelectedTag] = useState('Todos');
  const [activeIndex, setActiveIndex] = useState(null);

  // Extraer tags únicos de la galería
  const availableTags = ['Todos', ...Array.from(new Set(gallery.map(g => g.tag).filter(Boolean)))];

  const filteredGallery = gallery.filter(item => {
    if (selectedTag === 'Todos') return true;
    return item.tag === selectedTag;
  });

  const cleanPhone = (settings?.phone || '').replace(/\D/g, '');

  // Manejo de navegación con teclado (Flechas izq/der y Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeIndex === null) return;
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % filteredGallery.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + filteredGallery.length) % filteredGallery.length);
      } else if (e.key === 'Escape') {
        setActiveIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, filteredGallery.length]);

  if (!gallery || gallery.length === 0) return null;

  const currentPhoto = activeIndex !== null ? filteredGallery[activeIndex] : null;

  const getWhatsAppLinkForPhoto = (photo) => {
    if (!cleanPhone || !photo) return '#';
    const text = `¡Hola! Estuve viendo su galería de montajes y me interesa cotizar un evento como: "${photo.title}" (${photo.tag || 'Montaje'}). ¿Podrían darme más información?`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % filteredGallery.length);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + filteredGallery.length) % filteredGallery.length);
  };

  return (
    <section className="pt-8 sm:pt-10 border-t border-slate-800/80 space-y-6">
      
      {/* Header Sección */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold mb-1.5">
            <Camera className="w-3.5 h-3.5" />
            <span>Portafolio de Montajes Reales</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Nuestros Eventos y Montajes en Acción
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
          Explora fotos reales de matrimonios, quinceañeros, discotecas y conciertos sonorizados por nosotros.
        </p>
      </div>

      {/* Barra de Filtros de Categorías de Eventos */}
      {availableTags.length > 2 && (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedTag === tag
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black scale-102'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid de Fotos de la Galería */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {filteredGallery.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/90 shadow-xl cursor-pointer transform active:scale-98 transition-all hover:border-amber-500/50 hover:shadow-amber-500/10 hover:shadow-2xl"
          >
            {/* Foto con Zoom fluido */}
            <img
              src={item.imageUrl}
              alt={item.title || 'Montaje de sonido'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
              loading="lazy"
              decoding="async"
            />
            
            {/* Gradiente Oscuro */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Tag / Categoría superior */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
              {item.tag && (
                <span className="inline-block px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black rounded-lg shadow-md">
                  {item.tag}
                </span>
              )}
              <div className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm text-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Título e indicador al pie */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5">
              <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight truncate drop-shadow">
                {item.title}
              </h4>
              <p className="text-[10px] text-amber-300 font-medium flex items-center gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Ver montaje en grande</span>
                <span>→</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LIGHTBOX MODAL / CARRUSEL INTERACTIVO FULLSCREEN */}
      {/* ------------------------------------------------------------- */}
      {currentPhoto && (
        <div 
          onClick={() => setActiveIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/95 backdrop-blur-md animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-[#0b0f19] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
          >
            {/* Header del Lightbox */}
            <div className="p-3 sm:p-4 bg-[#0e1320] border-b border-slate-800/80 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black rounded-lg shrink-0">
                  {currentPhoto.tag || 'Montaje Real'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Foto {activeIndex + 1} de {filteredGallery.length}
                </span>
              </div>

              <button
                onClick={() => setActiveIndex(null)}
                className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-800 shrink-0"
                title="Cerrar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenedor de la Imagen con Botones de Flecha */}
            <div className="relative flex-1 min-h-[300px] sm:min-h-[460px] max-h-[60vh] sm:max-h-[65vh] w-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src={currentPhoto.imageUrl}
                alt={currentPhoto.title}
                className="w-full h-full object-contain max-h-[65vh] select-none"
              />

              {/* Botón Flecha Anterior (←) */}
              {filteredGallery.length > 1 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all border border-slate-800 active:scale-95 shadow-2xl hover:border-amber-500/50"
                  title="Foto anterior (←)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Botón Flecha Siguiente (→) */}
              {filteredGallery.length > 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all border border-slate-800 active:scale-95 shadow-2xl hover:border-amber-500/50"
                  title="Foto siguiente (→)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Pie del Lightbox con Información y Llamado a la Acción WhatsApp */}
            <div className="p-4 sm:p-5 bg-[#0e1320] border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                  {currentPhoto.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Montaje garantizado con transporte, prueba de sonido y personal técnico calificado.
                </p>
              </div>

              {cleanPhone && (
                <a
                  href={getWhatsAppLinkForPhoto(currentPhoto)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>💬 Cotizar Montaje Similar</span>
                </a>
              )}
            </div>

          </div>
        </div>
      )}

    </section>
  );
}

export default memo(EventGallery);
