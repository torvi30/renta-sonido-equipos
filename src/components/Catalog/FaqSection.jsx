import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, MapPin, Sparkles } from 'lucide-react';


export default function FaqSection({ settings }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!settings.showFaqSection || !settings.faqs || settings.faqs.length === 0) {
    return null;
  }

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const handleOpenDirectWhatsApp = () => {
    const phone = settings.whatsappNumber.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent('Hola, tengo una pregunta sobre el alquiler de sonido para mi evento...')}`;
    window.open(url, '_blank');
  };

  return (
    <section className="pt-8 border-t border-slate-800/80 space-y-6">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Resolvemos tus dudas</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Preguntas Frecuentes de Clientes
        </h2>
        <p className="text-xs text-slate-400">
          Todo lo que necesitas saber antes de contratar sonido y luces para tu evento.
        </p>
      </div>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto space-y-3">
        {settings.faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-[#111622] border border-slate-800/80 overflow-hidden transition-all shadow-md"
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-100 hover:text-amber-400 transition-colors"
              >
                <span>{faq.question}</span>
                <div className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex-shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50 mt-1">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Extra contact banner */}
      <div className="max-w-xl mx-auto bg-gradient-to-r from-amber-500/10 via-slate-900 to-cyan-500/10 border border-slate-800 p-4 rounded-2xl text-center space-y-2">
        <p className="text-xs text-slate-300">
          ¿Tienes una fecha especial o un requerimiento a medida?
        </p>
        <button
          onClick={handleOpenDirectWhatsApp}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-colors shadow-md shadow-emerald-950/40"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Hablar Directamente por WhatsApp</span>
        </button>
      </div>

    </section>
  );
}
