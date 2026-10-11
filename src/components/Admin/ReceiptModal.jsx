import React, { useEffect } from 'react';
import { X, Printer, Share2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatCurrency, formatDateFriendly, getStoredSettings } from '../../services/storageService';

export default function ReceiptModal({ isOpen, onClose, booking }) {
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

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const phone = booking.clientPhone.replace(/\D/g, '');
    let text = `📄 *COMPROBANTE DE RESERVA - ${settings.businessName.toUpperCase()}*\n\n`;
    text += `Estimado(a) *${booking.clientName}*,\n`;
    text += `Confirmamos la reserva de tu pedido *#${booking.id}* para el evento del *${formatDateFriendly(booking.eventDate)}*.\n\n`;
    text += `📍 *Locación:* ${booking.eventLocation}\n`;
    text += `💰 *Valor Total:* ${formatCurrency(booking.totalAmount)}\n`;
    text += `💵 *Abono Recibido:* ${formatCurrency(booking.depositAmount || 0)} (${booking.paymentMethod})\n`;
    text += `⚠️ *Saldo a Pagar en Sitio:* ${formatCurrency(booking.balanceDue || 0)}\n\n`;
    text += `📦 *EQUIPOS SEPARADOS:*\n`;
    booking.items.forEach((item, idx) => {
      text += `• ${item.quantity}x ${item.name}\n`;
    });
    text += `\n_${settings.termsAndConditions}_\n\n`;
    text += `¡Gracias por confiar en nosotros para tu evento! 🔊🎶`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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
        
        {/* Header Actions */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Hoja de Entrega / Comprobante
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
              title="Imprimir / Guardar PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir PDF</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
              title="Enviar por WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper */}
        <div id="printable-receipt" className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-950 text-slate-100 space-y-6">
          
          {/* Header Receipt */}
          <div className="border-b border-slate-800 pb-5 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black text-amber-400 tracking-tight">
                {settings.businessName}
              </h2>
              <p className="text-xs text-slate-400">{settings.djName} • Contacto: {settings.phone}</p>
              <p className="text-xs text-slate-500">Alquiler de Sonido, Iluminación y Efectos Especiales</p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-bold text-slate-400 block">Orden</span>
              <span className="text-lg font-black text-white">#{booking.id}</span>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-black uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                {booking.status}
              </span>
            </div>
          </div>

          {/* Client & Event Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px] block">Cliente:</span>
              <p className="font-bold text-white text-sm">{booking.clientName}</p>
              <p className="text-slate-400">Tel: {booking.clientPhone}</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px] block">Fecha del Evento:</span>
              <p className="font-bold text-amber-400 text-sm">{formatDateFriendly(booking.eventDate)}</p>
              <p className="text-slate-400">Lugar: {booking.eventLocation}</p>
            </div>
          </div>

          {/* Table of Items */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
              Equipos Arrendados
            </h4>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2">Cant.</th>
                  <th className="py-2">Descripción del Equipo</th>
                  <th className="py-2 text-right">Valor Día</th>
                  <th className="py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {booking.items.map((it, idx) => (
                  <tr key={idx} className="text-slate-200">
                    <td className="py-2 font-bold text-amber-400">{it.quantity}x</td>
                    <td className="py-2">{it.name}</td>
                    <td className="py-2 text-right text-slate-400">{formatCurrency(it.price)}</td>
                    <td className="py-2 text-right font-bold text-white">{formatCurrency(it.price * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Total Alquiler:</span>
              <span className="font-bold text-sm text-white">{formatCurrency(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span>Abono Recibido ({booking.paymentMethod || 'Efectivo'}):</span>
              <span className="font-bold text-sm">{formatCurrency(booking.depositAmount || 0)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-extrabold text-sm text-amber-400">
              <span>Saldo a Pagar en Sitio:</span>
              <span>{formatCurrency(booking.balanceDue || 0)}</span>
            </div>
          </div>

          {/* Terms & Signatures */}
          <div className="pt-2 text-[10px] text-slate-500 space-y-2 leading-relaxed border-t border-slate-800">
            <p><strong>Términos de Responsabilidad:</strong> {settings.termsAndConditions}</p>
            <div className="grid grid-cols-2 gap-8 pt-8 text-center">
              <div className="border-t border-slate-700 pt-1">
                <p className="font-semibold text-slate-400">Firma Entrega (Proveedor)</p>
              </div>
              <div className="border-t border-slate-700 pt-1">
                <p className="font-semibold text-slate-400">Firma Recibido (Cliente)</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
