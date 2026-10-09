import React from 'react';
import { Camera, Sparkles } from 'lucide-react';

export default function EventGallery({ gallery = [] }) {
  if (!gallery || gallery.length === 0) return null;

  return (
    <section className="pt-8 border-t border-slate-800/80 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold mb-1.5">
            <Camera className="w-3.5 h-3.5" />
            <span>Galería de Montajes Reales</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Nuestros Eventos y Montajes en Acción
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-sm">
          Así lucen nuestras cabinas, iluminación DMX y sonido profesional instalados en locaciones reales.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {gallery.map((item, idx) => (
          <div
            key={idx}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg"
          >
            <img
              src={item.imageUrl}
              alt={item.title || 'Montaje de sonido'}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-85 group-hover:opacity-100"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

            <div className="absolute bottom-3 left-3 right-3">
              {item.tag && (
                <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black rounded mb-1">
                  {item.tag}
                </span>
              )}
              <h4 className="text-xs font-bold text-white leading-tight truncate">
                {item.title}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
