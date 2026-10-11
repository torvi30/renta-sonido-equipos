import React, { useState, useEffect } from 'react';
import { 
  X, MessageCircle, Send, DollarSign, CheckCircle2, 
  Sparkles, Star, Copy, ExternalLink, HelpCircle 
} from 'lucide-react';
import { formatCurrency, formatDateFriendly, getStoredSettings } from '../../services/storageService';
import { showSuccess } from '../../services/alertService';

export default function WhatsAppTemplatesModal({ isOpen, onClose, booking }) {
  // Manejar tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  const settings = getStoredSettings();
  const cleanPhone = booking.clientPhone.replace(/\D/g, '');

  // Plantillas prediseñadas
  const templates = [
    {
      id: 'balance_reminder',
      title: '🚨 Cobro de Saldo Pendiente',
      desc: 'Enviar antes del evento para recordar el saldo por pagar',
      generate: () => {
        let msg = `Hola *${booking.clientName}* 👋, te saludamos de *${settings.businessName}*.\n\n`;
        msg += `Te recordamos los detalles de tu evento para el *${formatDateFriendly(booking.eventDate)}*:\n`;
        msg += `📍 *Lugar:* ${booking.eventLocation || 'Por confirmar'}\n`;
        msg += `💰 *Valor Total:* ${formatCurrency(booking.totalAmount)}\n`;
        msg += `💵 *Abono Recibido:* ${formatCurrency(booking.depositAmount || 0)}\n`;
        msg += `⚠️ *SALDO PENDIENTE POR PAGAR:* *${formatCurrency(booking.balanceDue || 0)}*\n\n`;
        msg += `Por favor tener este saldo listo en efectivo o Nequi al momento del montaje e inicio del evento. ¡Nos vemos pronto para poner la mejor música y sonido! 🔊🎶`;
        return msg;
      }
    },
    {
      id: 'booking_confirmed',
      title: '🔒 Confirmación de Reserva & Bloqueo',
      desc: 'Avisar que el abono fue recibido y los equipos están separados',
      generate: () => {
        let msg = `Hola *${booking.clientName}* 🎉, ¡tu reserva está 100% CONFIRMADA!\n\n`;
        msg += `Hemos registrado tu pedido *#${booking.id}* para el *${formatDateFriendly(booking.eventDate)}*.\n`;
        msg += `Los equipos de sonido y luces ya se encuentran *bloqueados en nuestro calendario* a tu nombre.\n\n`;
        msg += `📦 *Equipos Separados:*\n`;
        booking.items.forEach(it => {
          msg += `• ${it.quantity}x ${it.name}\n`;
        });
        msg += `\n💵 *Abono Recibido:* ${formatCurrency(booking.depositAmount || 0)}\n`;
        msg += `🤝 Estaremos en la locación con suficiente tiempo para montar y hacer prueba de sonido. ¡Gracias por confiar en *${settings.businessName}*!`;
        return msg;
      }
    },
    {
      id: 'post_event_thanks',
      title: '⭐ Agradecimiento & Reseña Pos-Evento',
      desc: 'Enviar el día siguiente para fidelizar al cliente y pedir reseña',
      generate: () => {
        let msg = `¡Hola *${booking.clientName}*! 🎉🍾\n\n`;
        msg += `Esperamos que el evento de ayer haya salido fenomenal y que tú y tus invitados hayan disfrutado la música y el sonido al máximo.\n\n`;
        msg += `Para nosotros en *${settings.businessName}* fue un honor acompañarte. ¿Qué tal te pareció la calidad del sonido y la puntualidad del servicio?\n\n`;
        msg += `Si tienes 1 minuto, nos ayudaría muchísimo tu recomendación con amigos y familiares. ¡Quedamos a tu orden para tus próximas fiestas y eventos! 🎧🔊`;
        return msg;
      }
    },
    {
      id: 'quick_chat',
      title: '💬 Mensaje Directo de Saludo',
      desc: 'Abrir chat normal para coordinar horarios o logística',
      generate: () => {
        return `Hola *${booking.clientName}*, te contacto de *${settings.businessName}* respecto a tu orden de sonido #${booking.id}...`;
      }
    }
  ];

  const [selectedTemplateId, setSelectedTemplateId] = useState('balance_reminder');
  const [customText, setCustomText] = useState(templates[0].generate());

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplateId(tpl.id);
    setCustomText(tpl.generate());
  };

  const handleSendToWhatsApp = () => {
    const encoded = encodeURIComponent(customText);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(customText);
    showSuccess('¡Copiado!', 'Mensaje copiado al portapapeles listo para pegar en WhatsApp.');
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Mensajes Rápidos de WhatsApp
              </h3>
              <p className="text-xs text-slate-400">
                Cliente: <span className="text-white font-bold">{booking.clientName}</span> ({booking.clientPhone})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Template Selector Pills */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Selecciona una Plantilla Inteligente:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templates.map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    selectedTemplateId === tpl.id
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="font-extrabold text-xs block truncate">{tpl.title}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">{tpl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Editable message preview */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Mensaje a Enviar (Puedes editarlo antes de enviar):
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
              >
                <Copy className="w-3 h-3" /> Copiar Texto
              </button>
            </div>

            <textarea
              rows={7}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400 font-mono leading-relaxed resize-none shadow-inner"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#121828] flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            Abre WhatsApp con el mensaje listo
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleSendToWhatsApp}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black px-5 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-950/50"
            >
              <Send className="w-4 h-4 fill-black" />
              <span>Enviar por WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
