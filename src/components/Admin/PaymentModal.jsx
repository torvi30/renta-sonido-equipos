import React, { useState } from 'react';
import { X, DollarSign, CreditCard, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../services/storageService';

export default function PaymentModal({ isOpen, onClose, booking, onSavePayment }) {
  if (!isOpen || !booking) return null;

  const [depositAmount, setDepositAmount] = useState(booking.depositAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState(booking.paymentMethod === 'Pendiente' ? 'Nequi' : booking.paymentMethod);
  const [paymentNotes, setPaymentNotes] = useState('');

  const total = booking.totalAmount || 0;
  const balance = Math.max(0, total - Number(depositAmount));

  const handleQuick50Percent = () => {
    setDepositAmount(Math.round(total * 0.5));
  };

  const handleQuick100Percent = () => {
    setDepositAmount(total);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSavePayment({
      bookingId: booking.id,
      depositAmount: Number(depositAmount),
      balanceDue: balance,
      paymentMethod,
      paymentNotes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Control de Abonos y Pagos
              </h3>
              <p className="text-xs text-slate-400">
                Orden #{booking.id} - {booking.clientName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400">Valor Total del Alquiler:</span>
            <span className="text-base font-black text-white">{formatCurrency(total)}</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Monto Abonado / Recibido ($)
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleQuick50Percent}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-400 px-2 py-0.5 rounded font-bold"
                >
                  50% ({formatCurrency(total * 0.5)})
                </button>
                <button
                  type="button"
                  onClick={handleQuick100Percent}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2 py-0.5 rounded font-bold"
                >
                  100% Total
                </button>
              </div>
            </div>

            <input
              type="number"
              min="0"
              max={total}
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-base focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Balance calculation */}
          <div className={`p-3 rounded-xl border flex justify-between items-center ${
            balance === 0 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}>
            <span className="text-xs font-semibold">
              {balance === 0 ? '✓ Alquiler Pagado en su Totalidad' : 'Saldo Pendiente por Cobrar:'}
            </span>
            <span className="font-black text-sm">{formatCurrency(balance)}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Método de Pago
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
            >
              <option value="Nequi">Nequi</option>
              <option value="Daviplata">Daviplata</option>
              <option value="Efectivo">Efectivo en Mano</option>
              <option value="Transferencia Bancaria">Transferencia Bancolombia / Bancos</option>
              <option value="Tarjeta / Datáfono">Tarjeta de Crédito / Débito</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Comprobante / Referencia (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Nro. Transacción Nequi #M81920"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3 rounded-xl text-sm shadow-lg shadow-emerald-500/20"
            >
              Guardar y Actualizar Saldo
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
