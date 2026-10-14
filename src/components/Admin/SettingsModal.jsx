import { useState, useEffect } from 'react';
import { X, Settings, MessageSquare, ShieldCheck, Flame, LogOut, Eye, EyeOff } from 'lucide-react';
import { getStoredSettings, saveStoredSettings } from '../../services/storageService';
import { showAlert, showSuccess, showError } from '../../services/alertService';
import { isFirebaseConfigured } from '../../firebase/config';

export default function SettingsModal({ isOpen, onClose, onSettingsSaved, onLogout }) {
  const [businessName, setBusinessName] = useState('');
  const [djName, setDjName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [terms, setTerms] = useState('');
  const [showPins, setShowPins] = useState(true);
  const [adminPin, setAdminPin] = useState('1234');
  const [managerPin, setManagerPin] = useState('2020');
  const [staffPin, setStaffPin] = useState('3030');
  const [workersList, setWorkersList] = useState([]);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState('staff');
  const [newWorkerPin, setNewWorkerPin] = useState('');

  // Sincronizar configuración actual cuando se abra el modal
  useEffect(() => {
    if (isOpen) {
      const current = getStoredSettings();
      setBusinessName(current.businessName || '');
      setDjName(current.djName || '');
      setWhatsappNumber(current.whatsappNumber || '');
      setPhone(current.phone || '');
      setTerms(current.termsAndConditions || '');
      setAdminPin(current.adminPin || '1234');
      setManagerPin(current.managerPin || '2020');
      setStaffPin(current.staffPin || '3030');
      setWorkersList(current.workers || []);
    }
  }, [isOpen]);

  // Manejar Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const current = getStoredSettings();

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
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.equipment) localStorage.setItem('sec_equipment_data', JSON.stringify(parsed.equipment));
        if (parsed.combos) localStorage.setItem('sec_combos_data', JSON.stringify(parsed.combos));
        if (parsed.bookings) localStorage.setItem('sec_bookings_data', JSON.stringify(parsed.bookings));
        if (parsed.settings) localStorage.setItem('sec_admin_settings', JSON.stringify(parsed.settings));
        await showSuccess('¡Backup restaurado!', 'La información fue cargada exitosamente. La página se actualizará.');
        window.location.reload();
      } catch (err) {
        showError('Error de backup', 'Error al leer el archivo de backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleAddWorker = () => {
    if (!newWorkerName.trim() || newWorkerPin.length !== 4) {
      showAlert({
        title: 'Datos requeridos',
        text: 'Ingresa el nombre del trabajador y un PIN de 4 dígitos.',
        icon: 'warning'
      });
      return;
    }
    const newWorker = {
      id: `w-${Date.now()}`,
      name: newWorkerName.trim(),
      role: newWorkerRole,
      pin: newWorkerPin.trim(),
      phone: ''
    };
    setWorkersList(prev => [...prev, newWorker]);
    setNewWorkerName('');
    setNewWorkerPin('');
  };

  const handleRemoveWorker = (id) => {
    setWorkersList(prev => prev.filter(w => w.id !== id));
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
      adminPin: adminPin.trim() || '1234',
      managerPin: managerPin.trim() || '2020',
      staffPin: staffPin.trim() || '3030',
      workers: workersList
    };
    saveStoredSettings(updated);
    if (onSettingsSaved) onSettingsSaved(updated);
    onClose();
  };


  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828] flex-shrink-0">
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
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
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
              Aquí es donde tus clientes te enviarán el mensaje automático cuando hagan clic en &quot;Pedir por WhatsApp&quot;.
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

          {/* GESTIÓN DE ROLES Y PINS DE SEGURIDAD */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Roles & PINs de Seguridad (4 Dígitos)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPins(!showPins)}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 transition-all"
              >
                {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPins ? 'Ocultar' : 'Ver PINs'}</span>
              </button>
            </div>

            {/* 3 PINs Principales por Rango */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Super Admin */}
              <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30">
                <label className="block text-[11px] font-bold text-amber-400 mb-1">
                  👑 Dueño / Super Admin
                </label>
                <input
                  type={showPins ? "text" : "password"}
                  maxLength={4}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-center font-mono font-bold text-amber-400 text-base focus:border-amber-400 outline-none"
                  placeholder="1234"
                />
                <p className="text-[9px] text-slate-400 mt-1">
                  Acceso 100% total (finanzas, landing, reportes).
                </p>
              </div>

              {/* Admin Operativo */}
              <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/30">
                <label className="block text-[11px] font-bold text-cyan-400 mb-1">
                  ⚡ Admin Operativo
                </label>
                <input
                  type={showPins ? "text" : "password"}
                  maxLength={4}
                  value={managerPin}
                  onChange={(e) => setManagerPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-center font-mono font-bold text-cyan-400 text-base focus:border-cyan-400 outline-none"
                  placeholder="2020"
                />
                <p className="text-[9px] text-slate-400 mt-1">
                  Pedidos, calendario e inventario (sin finanzas).
                </p>
              </div>

              {/* Staff Técnico */}
              <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30">
                <label className="block text-[11px] font-bold text-emerald-400 mb-1">
                  🔧 Staff / Técnico
                </label>
                <input
                  type={showPins ? "text" : "password"}
                  maxLength={4}
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-center font-mono font-bold text-emerald-400 text-base focus:border-emerald-400 outline-none"
                  placeholder="3030"
                />
                <p className="text-[9px] text-slate-400 mt-1">
                  Solo despacho, checklists y eventos.
                </p>
              </div>
            </div>

            {/* Lista de Trabajadores Específicos */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-300 block mb-2">
                Trabajadores con PIN Individual:
              </span>

              <div className="space-y-1.5 mb-3 max-h-36 overflow-y-auto pr-1">
                {workersList.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center justify-between bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{worker.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        worker.role === 'superadmin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : worker.role === 'admin'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {worker.role === 'superadmin' ? 'Dueño' : worker.role === 'admin' ? 'Admin' : 'Técnico'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded">
                        PIN: {worker.pin}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWorker(worker.id)}
                        className="text-rose-400 hover:text-rose-300 font-bold px-1 py-0.5"
                        title="Eliminar trabajador"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulario para agregar trabajador (Mobile friendly) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-950/70 p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-slate-800">
                <input
                  type="text"
                  placeholder="Nombre trabajador (ej. Carlos)"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  className="sm:col-span-5 bg-slate-900 sm:bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:border-amber-400 outline-none"
                />
                <select
                  value={newWorkerRole}
                  onChange={(e) => setNewWorkerRole(e.target.value)}
                  className="sm:col-span-3 bg-slate-900 sm:bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-300 focus:border-amber-400 outline-none"
                >
                  <option value="staff">🔧 Técnico</option>
                  <option value="admin">⚡ Admin</option>
                  <option value="superadmin">👑 Dueño</option>
                </select>
                <div className="flex gap-2 sm:col-span-4">
                  <input
                    type={showPins ? "text" : "password"}
                    maxLength={4}
                    placeholder="PIN"
                    value={newWorkerPin}
                    onChange={(e) => setNewWorkerPin(e.target.value.replace(/\D/g, ''))}
                    className="w-20 sm:w-16 bg-slate-900 sm:bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white font-mono text-center focus:border-amber-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddWorker}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold py-2 rounded-xl transition-colors whitespace-nowrap shadow-sm active:scale-95"
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            </div>
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


          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 rounded-xl text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
            >
              Guardar Ajustes
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="flex items-center justify-center gap-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-white border border-rose-500/40 py-3 px-4 rounded-xl text-xs font-black transition-all shadow-md active:scale-[0.98]"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Cerrar Sesión</span>
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}
