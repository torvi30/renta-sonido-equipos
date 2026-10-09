import React, { useState } from 'react';
import { X, Settings, Phone, MessageSquare, ShieldCheck, Flame, Info } from 'lucide-react';
import { getStoredSettings, saveStoredSettings } from '../../services/storageService';
import { isFirebaseConfigured } from '../../firebase/config';

export default function SettingsModal({ isOpen, onClose, onSettingsSaved }) {
  if (!isOpen) return null;

  const current = getStoredSettings();

  const [businessName, setBusinessName] = useState(current.businessName);
  const [djName, setDjName] = useState(current.djName);
  const [whatsappNumber, setWhatsappNumber] = useState(current.whatsappNumber);
  const [phone, setPhone] = useState(current.phone);
  const [terms, setTerms] = useState(current.termsAndConditions);
  const [adminPin, setAdminPin] = useState(current.adminPin || '1234');

  const handleExportBackup = () => {
    const data = {
      equipment: JSON.parse(localStorage.getItem('sec_equipment_data') || '[]'),
      combos: JSON.parse(localStorage.getItem('sec_combos_data') || '[]'),
      bookings: JSON.parse(localStorage.getItem('sec_bookings_data') || '[]'),
      settings: current,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_sound_control_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.equipment) localStorage.setItem('sec_equipment_data', JSON.stringify(parsed.equipment));
        if (parsed.combos) localStorage.setItem('sec_combos_data', JSON.stringify(parsed.combos));
        if (parsed.bookings) localStorage.setItem('sec_bookings_data', JSON.stringify(parsed.bookings));
        if (parsed.settings) localStorage.setItem('sec_admin_settings', JSON.stringify(parsed.settings));
        alert('✓ Backup restaurado correctamente. La página se recargará para aplicar los cambios.');
        window.location.reload();
      } catch (err) {
        alert('Error al leer el archivo de backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...current,
      businessName: businessName.trim(),
      djName: djName.trim(),
      whatsappNumber: whatsappNumber.trim().replace(/\D/g, ''),
      phone: phone.trim(),
      termsAndConditions: terms.trim(),
      adminPin: adminPin.trim() || '1234'
    };
    saveStoredSettings(updated);
    if (onSettingsSaved) onSettingsSaved(updated);
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Ajustes del Sistema & WhatsApp
              </h3>
              <p className="text-xs text-slate-400">Personaliza tus datos de contacto y recepción de pedidos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Cloud Sync Status Info */}
          <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
            isFirebaseConfigured
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
          }`}>
            <Flame className="w-5 h-5 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold block">
                {isFirebaseConfigured ? '🔥 Firebase Cloud Conectado' : '⚡ Modo Autónomo Gratuito Activo'}
              </span>
              <span className="text-[11px] opacity-80">
                {isFirebaseConfigured 
                  ? 'Tus datos se sincronizan con Firestore en tiempo real.' 
                  : 'Todo se guarda en tu dispositivo al 100% sin costos ni dependencias.'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Número de WhatsApp para Recibir Pedidos *
            </label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <input
                type="text"
                required
                placeholder="Ej. 573001234567 (con código de país, sin + ni espacios)"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="bg-transparent text-sm text-white w-full focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Aquí es donde tus clientes te enviarán el mensaje automático cuando hagan clic en "Pedir por WhatsApp".
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Negocio
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre de DJ / Contacto
              </label>
              <input
                type="text"
                required
                value={djName}
                onChange={(e) => setDjName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Teléfono Visible en Recibos
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              PIN de Acceso al Panel Admin (4 dígitos)
            </label>
            <input
              type="password"
              maxLength={6}
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-amber-400 font-bold focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Evita que los clientes que abran el catálogo entren a ver tus finanzas y pedidos.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Términos de Responsabilidad y Garantía
            </label>
            <textarea
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none"
            />
          </div>

          {/* Backup & Restore Section */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              Copia de Seguridad (Backup)
            </span>
            <p className="text-[10px] text-slate-500">
              Descarga todos tus pedidos, inventario y finanzas en un archivo o restáuralos en otro teléfono.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 rounded-xl border border-slate-700 transition-colors"
              >
                Descargar Backup (.json)
              </button>
              <label className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 rounded-xl border border-slate-700 transition-colors text-center cursor-pointer">
                Restaurar Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>


          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 rounded-xl text-sm shadow-lg shadow-amber-500/20"
            >
              Guardar Ajustes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
