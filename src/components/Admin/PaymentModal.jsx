import React, { useState } from 'react';
import { X, DollarSign, CreditCard, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../services/storageService';

export default function PaymentModal({ isOpen, onClose, booking, onSavePayment }) {
  if (!isOpen || !booking) return null;

  // Manejar el monto como String para permitir borrar el 0 completamente sin que reaparezca
  const initialDeposit = booking.depositAmount !== undefined && booking.depositAmount !== null && booking.depositAmount > 0
    ? String(booking.depositAmount)
    : '';

  const [depositAmount, setDepositAmount] = useState(initialDeposit);
  const [paymentMethod, setPaymentMethod] = useState(
    booking.paymentMethod && booking.paymentMethod !== 'Pendiente' ? booking.paymentMethod : 'Nequi'
  );
  const [paymentNotes, setPaymentNotes] = useState(booking.paymentNotes || '');

  const total = Number(booking.totalAmount) || 0;
  const numericDeposit = depositAmount === '' ? 0 : Math.max(0, Number(depositAmount) || 0);
  const balance = Math.max(0, total - numericDeposit);

  const handleQuick50Percent = () => {
    setDepositAmount(String(Math.round(total * 0.5)));
  };

  const handleQuick100Percent = () => {
    setDepositAmount(String(total));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSavePayment({
      bookingId: booking.id,
      depositAmount: numericDeposit,
      balanceDue: balance,
      paymentMethod,
      paymentNotes: paymentNotes.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828]">
          <div className="flex items-center gap-2.5">
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
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
            title="Cerrar modal"
          >
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
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                Monto Abonado / Recibido ($)
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleQuick50Percent}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 px-2 py-0.5 rounded-lg font-bold border border-slate-700 transition-all"
                >
                  50% ({formatCurrency(total * 0.5)})
                </button>
                <button
                  type="button"
                  onClick={handleQuick100Percent}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-400 px-2 py-0.5 rounded-lg font-bold border border-slate-700 transition-all"
                >
                  100% Total
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                min="0"
                max={total}
                placeholder="0"
                value={depositAmount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-extrabold text-lg focus:outline-none focus:border-emerald-400 transition-colors"
                autoFocus
              />
              {depositAmount !== '' && (
                <button
                  type="button"
                  onClick={() => setDepositAmount('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-amber-400 font-bold px-1.5 py-0.5 rounded"
                  title="Borrar monto"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {numericDeposit > 0 ? `Equivale al ${Math.round((numericDeposit / (total || 1)) * 100)}% del total` : 'Sin abono registrado'}
            </p>
          </div>

          {/* Balance calculation */}
          <div className={`p-3.5 rounded-2xl border flex justify-between items-center transition-all ${
            balance === 0 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-sm' 
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}>
            <span className="text-xs font-bold">
              {balance === 0 ? '✓ Alquiler Pagado en su Totalidad' : 'Saldo Pendiente por Cobrar:'}
            </span>
            <span className="font-black text-base">{formatCurrency(balance)}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Método de Pago
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none cursor-pointer"
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
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black py-3 rounded-xl text-sm shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
            >
              Guardar y Actualizar Saldo
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
