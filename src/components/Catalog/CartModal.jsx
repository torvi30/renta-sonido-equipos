import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, MessageSquare, Send, Calendar, MapPin, User, Phone, CheckCircle, Sparkles } from 'lucide-react';
import { formatCurrency, formatDateFriendly, generateWhatsAppLink } from '../../services/storageService';

export default function CartModal({
  isOpen,
  onClose,
  cart,
  selectedDate,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCreateBooking
}) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [orderSent, setOrderSent] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const depositAmount = totalAmount * 0.5;

  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Por favor indica tu nombre o el de la empresa.');
      return;
    }
    if (!clientPhone.trim()) {
      alert('Por favor indica tu número de WhatsApp para contacto.');
      return;
    }

    // Generar ID único de pedido
    const orderId = `SEC-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = {
      id: orderId,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      eventDate: selectedDate,
      endDate: selectedDate,
      eventLocation: eventLocation.trim() || 'Por confirmar',
      status: 'Pendiente',
      items: cart.map(item => ({
        equipmentId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount,
      depositAmount: 0,
      balanceDue: totalAmount,
      paymentMethod: 'Pendiente',
      notes: notes.trim(),
      checklistVerified: false,
      createdAt: new Date().toISOString()
    };

    // Guardar en el sistema para que el Admin lo vea en su Inbox
    onCreateBooking(newBooking);
    setLastOrderId(orderId);

    // Generar enlace wa.me y abrir en nueva pestaña
    const waUrl = generateWhatsAppLink({
      orderId,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      eventDate: selectedDate,
      eventLocation: eventLocation.trim(),
      items: cart,
      totalAmount,
      notes: notes.trim()
    });

    window.open(waUrl, '_blank');

    setOrderSent(true);
  };

  const handleFinish = () => {
    setOrderSent(false);
    setClientName('');
    setClientPhone('');
    setEventLocation('');
    setNotes('');
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-[#121828]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Cotización de Alquiler
              </h2>
              <p className="text-xs text-slate-400">
                Fecha del Evento: <span className="text-amber-400 font-bold">{formatDateFriendly(selectedDate)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {orderSent ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-white">
                ¡Solicitud Generada con Éxito!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Tu orden <span className="font-bold text-amber-400">#{lastOrderId}</span> se envió a WhatsApp y se registró en nuestro panel. En breve el DJ revisará y confirmará la reserva.
              </p>
              <div className="pt-4">
                <button
                  onClick={handleFinish}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 py-2.5 rounded-xl text-sm"
                >
                  Entendido / Volver al Catálogo
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-slate-400 text-sm">No tienes equipos en la cotización todavía.</p>
              <button
                onClick={onClose}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-xl text-xs"
              >
                Explorar Equipos y Combos
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Equipos Seleccionados ({cart.length})</span>
                  <button
                    onClick={onClearCart}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Vaciar
                  </button>
                </div>

                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{formatCurrency(item.price)} / día</span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-bold text-amber-400 text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-extrabold text-white min-w-[70px] text-right">
                          {formatCurrency(item.price * item.quantity)}
                        </span>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Deposit Breakdown */}
              <div className="bg-gradient-to-br from-slate-900 to-[#12192c] p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Valor Total Estimado:</span>
                  <span className="text-lg font-black text-white">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-amber-400 font-semibold border-t border-slate-800/80 pt-2">
                  <span>Abono requerido para reservar (50%):</span>
                  <span className="font-bold text-sm">{formatCurrency(depositAmount)}</span>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  * El 50% restante se cancela al momento del montaje en la locación del evento.
                </p>
              </div>

              {/* Customer Info Form */}
              <form onSubmit={handleSendWhatsApp} className="space-y-3.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Datos de Contacto para el Pedido
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tu Nombre / Razón Social *
                    </label>
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Ej. Juan Pérez"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="bg-transparent text-sm text-white w-full focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 300 123 4567"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="bg-transparent text-sm text-white w-full focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lugar o Dirección del Evento
                  </label>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ej. Salón Comunal o Finca en Girardota"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      className="bg-transparent text-sm text-white w-full focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Notas adicionales (Horario, requerimientos)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Necesitamos que esté montado a las 6:00 PM."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none resize-none"
                  />
                </div>

                {/* Big WhatsApp CTA Button */}
                <button
                  type="submit"
                  className="w-full mt-2 flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black py-3.5 px-6 rounded-2xl shadow-xl shadow-emerald-950/60 transition-all transform active:scale-98 text-sm sm:text-base"
                >
                  <MessageSquare className="w-5 h-5 fill-white" />
                  <span>Pedir Cotización por WhatsApp</span>
                </button>
              </form>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
