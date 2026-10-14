import { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, KeyRound, Eye, EyeOff, Plus, Trash2, 
  MessageSquare, User, Crown, Zap, Wrench, Check 
} from 'lucide-react';
import { saveStoredSettings } from '../../services/storageService';
import { showAlert } from '../../services/alertService';

export default function PinManagerModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsSaved 
}) {
  const [showPins, setShowPins] = useState(true);
  const [adminPin, setAdminPin] = useState('1234');
  const [managerPin, setManagerPin] = useState('2020');
  const [staffPin, setStaffPin] = useState('3030');
  const [workersList, setWorkersList] = useState([]);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('staff');
  const [newPin, setNewPin] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Sincronizar datos cuando settings esté disponible o el modal se abra
  useEffect(() => {
    if (settings) {
      setAdminPin(settings.adminPin || '1234');
      setManagerPin(settings.managerPin || '2020');
      setStaffPin(settings.staffPin || '3030');
      setWorkersList(settings.workers || [
        { id: "w-1", name: "Dueño / Propietario", role: "superadmin", pin: "1234", phone: "" },
        { id: "w-2", name: "Encargado de Operaciones", role: "admin", pin: "2020", phone: "" },
        { id: "w-3", name: "Técnico de Tarima & Bodega", role: "staff", pin: "3030", phone: "" }
      ]);
    }
  }, [settings, isOpen]);

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

  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!newName.trim() || newPin.length !== 4) {
      showAlert({
        title: 'Datos incompletos',
        text: 'Ingresa el nombre del trabajador y un PIN de 4 dígitos.',
        icon: 'warning'
      });
      return;
    }
    const cleanPin = newPin.replace(/\D/g, '');
    if (cleanPin.length !== 4) {
      showAlert({
        title: 'PIN inválido',
        text: 'El PIN debe tener exactamente 4 números.',
        icon: 'warning'
      });
      return;
    }

    const newWorker = {
      id: `w-${Date.now()}`,
      name: newName.trim(),
      role: newRole,
      pin: cleanPin,
      phone: newPhone.trim().replace(/\D/g, '')
    };

    setWorkersList(prev => [...prev, newWorker]);
    setNewName('');
    setNewPin('');
    setNewPhone('');
  };

  const handleRemoveWorker = (id) => {
    setWorkersList(prev => prev.filter(w => w.id !== id));
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    if (adminPin.length !== 4 || managerPin.length !== 4 || staffPin.length !== 4) {
      showAlert({
        title: 'PINs inválidos',
        text: 'Todos los PINs maestros deben ser de 4 dígitos numéricos.',
        icon: 'warning'
      });
      return;
    }

    const updated = {
      ...settings,
      adminPin: adminPin.trim(),
      managerPin: managerPin.trim(),
      staffPin: staffPin.trim(),
      workers: workersList
    };

    saveStoredSettings(updated);
    if (onSettingsSaved) onSettingsSaved(updated);
    onClose();
  };

  // Enviar PIN por WhatsApp al trabajador
  const handleSendWhatsApp = (workerName, roleLabel, pin, phone) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const msg = `🔐 *ACCESO AL SISTEMA - ${settings?.businessName?.toUpperCase() || 'SOUND & EVENT PRO'}*\n\n` +
      `Hola *${workerName}*, aquí tienes tus credenciales privadas para ingresar al panel de control:\n\n` +
      `👤 *Cargo:* ${roleLabel}\n` +
      `🔑 *Tu PIN Secreto de 4 Dígitos:* *${pin}*\n\n` +
      `👉 Ingresa en: https://sonido-control-pro-app.web.app/#admin\n\n` +
      `_Por seguridad, no compartas este PIN con personas ajenas al equipo de trabajo._`;
    
    const targetUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(targetUrl, '_blank');
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#0f1422] border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#121828] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Gestión de PINs & Empleados</span>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-amber-500 text-black">
                  Dueño
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Configura los códigos de acceso de 4 dígitos para cada miembro del equipo
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSaveAll} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Banner de Ayuda y Switch de Ocultar/Ver */}
          <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-[11px]">
                El sistema detecta automáticamente qué rol abrir según el PIN que se digite.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPins(!showPins)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-[11px] transition-all flex-shrink-0 ml-2"
            >
              {showPins ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
              <span>{showPins ? 'Ocultar PINs' : 'Ver PINs'}</span>
            </button>
          </div>

          {/* 1. LOS 3 PINS MAESTROS POR CATEGORÍA */}
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-2">
              1. PINs Generales por Rol:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Dueño */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/40 relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-amber-400 flex items-center gap-1 text-xs">
                    <Crown className="w-3.5 h-3.5" /> Dueño Master
                  </span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-black">
                    100% Total
                  </span>
                </div>
                <input
                  type={showPins ? "text" : "password"}
                  maxLength={4}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-center font-mono font-black text-amber-400 text-lg focus:border-amber-400 outline-none"
                  placeholder="1234"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                  Acceso a finanzas, precios, landing, backups y PINs.
                </p>
              </div>

              {/* Admin Operativo */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-cyan-500/40 relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-cyan-400 flex items-center gap-1 text-xs">
                    <Zap className="w-3.5 h-3.5" /> Encargado
                  </span>
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-black">
                    Operaciones
                  </span>
                </div>
                <input
                  type={showPins ? "text" : "password"}
                  maxLength={4}
                  value={managerPin}
                  onChange={(e) => setManagerPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-center font-mono font-black text-cyan-400 text-lg focus:border-cyan-400 outline-none"
                  placeholder="2020"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                  Pedidos, calendario, inventario y taller (sin finanzas).
                </p>
              </div>

              {/* Staff Técnico */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/40 relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-emerald-400 flex items-center gap-1 text-xs">
                    <Wrench className="w-3.5 h-3.5" /> Técnico
                  </span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black">
                    Tarima / Taller
                  </span>
                </div>
                <input
                  type={showPins ? "text" : "password"}
                  maxLength={4}
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-center font-mono font-black text-emerald-400 text-lg focus:border-emerald-400 outline-none"
                  placeholder="3030"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                  Solo pedidos, checklists de cables y taller de reparaciones.
                </p>
              </div>

            </div>
          </div>

          {/* 2. LISTA DE TRABAJADORES ESPECÍFICOS */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white block">
                  2. Trabajadores con PIN Personalizado:
                </span>
                <p className="text-[11px] text-slate-400">
                  Crea PINs individuales para cada técnico o ayudante con su nombre
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {workersList.length} Registrados
              </span>
            </div>

            {/* Lista actual */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {workersList.map((worker) => {
                const roleBadge = worker.role === 'superadmin' 
                  ? { label: 'Dueño', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
                  : worker.role === 'admin'
                  ? { label: 'Encargado', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' }
                  : { label: 'Técnico', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };

                return (
                  <div
                    key={worker.id}
                    className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl gap-2 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs flex-shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-white text-xs block truncate">
                          {worker.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${roleBadge.color}`}>
                            {roleBadge.label}
                          </span>
                          {worker.phone && (
                            <span className="text-[10px] text-slate-500 truncate">
                              📱 {worker.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-mono font-black text-xs text-amber-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shadow-inner">
                        {showPins ? worker.pin : '••••'}
                      </span>
                      
                      {/* Botón WhatsApp */}
                      <button
                        type="button"
                        onClick={() => handleSendWhatsApp(worker.name, roleBadge.label, worker.pin, worker.phone)}
                        className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-lg transition-all"
                        title="Enviar PIN por WhatsApp al trabajador"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      {/* Botón Eliminar */}
                      <button
                        type="button"
                        onClick={() => handleRemoveWorker(worker.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Eliminar este trabajador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Formulario agregar trabajador */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-300 block mb-2">
                + Agregar Nuevo Trabajador:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="Nombre trabajador (ej. Carlos Pérez)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="sm:col-span-4 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:border-amber-400 outline-none"
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="sm:col-span-3 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-300 focus:border-amber-400 outline-none"
                >
                  <option value="staff">🔧 Técnico</option>
                  <option value="admin">⚡ Encargado</option>
                  <option value="superadmin">👑 Dueño</option>
                </select>
                <input
                  type="text"
                  placeholder="WhatsApp (opcional)"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="sm:col-span-3 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:border-amber-400 outline-none"
                />
                <div className="sm:col-span-2 flex gap-1.5">
                  <input
                    type={showPins ? "text" : "password"}
                    maxLength={4}
                    placeholder="PIN"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-1.5 py-2 text-xs text-center font-mono font-bold text-amber-400 focus:border-amber-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddWorker}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-all"
                    title="Agregar trabajador"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Botón Guardar */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3.5 rounded-xl text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Todos los PINs y Configuración</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
