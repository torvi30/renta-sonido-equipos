import { INITIAL_EQUIPMENT, INITIAL_COMBOS, INITIAL_BOOKINGS, INITIAL_REPAIRS, INITIAL_PAYROLL } from '../data/initialData';
import { db, isFirebaseConfigured } from '../firebase/config';

const STORAGE_KEYS = {
  EQUIPMENT: 'sec_equipment_data',
  COMBOS: 'sec_combos_data',
  BOOKINGS: 'sec_bookings_data',
  SETTINGS: 'sec_admin_settings',
  REPAIRS: 'sec_repairs_data',
  PAYROLL: 'sec_payroll_data'
};

const DEFAULT_SETTINGS = {
  businessName: "Sound & Event Control",
  djName: "DJ & Audio Master",
  phone: "+57 300 000 0000",
  whatsappNumber: "573001234567", // Número de WhatsApp para recibir pedidos (sin + ni espacios)
  currency: "COP",
  depositPercentage: 50,
  termsAndConditions: "El cliente se compromete a devolver los equipos en el mismo estado físico y funcional. Daños por líquidos, golpes o sobrevoltaje corren por cuenta del arrendatario.",
  adminPin: "1234",       // PIN Super Admin (Dueño - Control Total)
  managerPin: "2020",     // PIN Admin (Encargado - Operaciones sin finanzas globales)
  staffPin: "3030",       // PIN Staff (Técnicos - Solo rutas, cables y bodega)
  workers: [
    { id: "w-1", name: "Dueño / Propietario", role: "superadmin", pin: "1234", phone: "" },
    { id: "w-2", name: "Encargado de Operaciones", role: "admin", pin: "2020", phone: "" },
    { id: "w-3", name: "Técnico de Tarima & Bodega", role: "staff", pin: "3030", phone: "" }
  ],

  // Personalización de Landing Page
  heroBadge: "Audio Pro & Cabinas DJ",
  heroTitle: "Alquiler de Sonido Profesional, Iluminación y Cabinas DJ",
  heroSubtitle: "Arma tu paquete para fiestas, matrimonios, quinceañeros y eventos corporativos. Selecciona tu fecha, cotiza en vivo y separa tu montaje al instante vía WhatsApp.",
  heroImageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
  cityCoverage: "Medellín, Antioquia y Alrededores",
  instagramUser: "@sound_control_dj",
  tiktokUser: "@sound_event_pro",
  showFaqSection: true,
  gallery: [
    {
      title: "Montaje Bodas & Quinceañeros",
      tag: "Social",
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Cabina DJ & Luces Robóticas",
      tag: "DJ Set",
      imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Conciertos & Bandas en Vivo",
      tag: "Live Sound",
      imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Iluminación Arquitectónica Wash",
      tag: "Iluminación",
      imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80"
    }
  ],
  faqs: [
    {
      question: "¿El alquiler incluye transporte, montaje y desmontaje?",
      answer: "Sí, todos nuestros combos incluyen personal técnico para el transporte, instalación, prueba de sonido y recogida al finalizar tu evento."
    },
    {
      question: "¿Con cuánto tiempo de anticipación debo reservar?",
      answer: "Recomendamos apartar con mínimo 5 a 15 días de anticipación para asegurar disponibilidad de los equipos en fines de semana."
    },
    {
      question: "¿Cómo funciona el abono del 50%?",
      answer: "Transfieres el 50% vía Nequi, Daviplata o Bancolombia para bloquear la fecha en el calendario. El 50% restante lo cancelas en sitio al momento de la entrega o prueba de sonido."
    },
    {
      question: "¿Qué pasa si se daña un equipo durante el evento?",
      answer: "Los equipos se entregan probados con checklist. En caso de daño por manipulación indebida, derrame de líquidos o lluvia, el cliente asume el costo de reposición según los términos de arrendamiento."
    }
  ]
};



// Inicializadores con persistencia
export const getStoredEquipment = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
    return data ? JSON.parse(data) : INITIAL_EQUIPMENT;
  } catch (e) {
    return INITIAL_EQUIPMENT;
  }
};

export const saveStoredEquipment = (equipment) => {
  localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipment));
};

export const getStoredCombos = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMBOS);
    return data ? JSON.parse(data) : INITIAL_COMBOS;
  } catch (e) {
    return INITIAL_COMBOS;
  }
};

export const saveStoredCombos = (combos) => {
  localStorage.setItem(STORAGE_KEYS.COMBOS, JSON.stringify(combos));
};

export const getStoredBookings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return data ? JSON.parse(data) : INITIAL_BOOKINGS;
  } catch (e) {
    return INITIAL_BOOKINGS;
  }
};

export const saveStoredBookings = (bookings) => {
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
};

export const getStoredSettings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getStoredRepairs = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REPAIRS);
    return data ? JSON.parse(data) : INITIAL_REPAIRS;
  } catch (e) {
    return INITIAL_REPAIRS;
  }
};

export const saveStoredRepairs = (repairs) => {
  localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(repairs));
};

export const getStoredPayroll = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PAYROLL);
    return data ? JSON.parse(data) : INITIAL_PAYROLL;
  } catch (e) {
    return INITIAL_PAYROLL;
  }
};

export const saveStoredPayroll = (payroll) => {
  localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(payroll));
};

// Formato de moneda profesional
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
};

// Formato de fecha legible
export const formatDateFriendly = (dateStr) => {
  if (!dateStr) return 'Fecha por definir';
  try {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

// CÁLCULO INTELIGENTE DE DISPONIBILIDAD (Anti-Cruces con Rango de Fechas)
export const checkEquipmentAvailability = (
  equipmentId, 
  targetDate, 
  bookings = null, 
  currentBookingId = null,
  targetEndDate = null
) => {
  if (!targetDate) return { available: true, reservedCount: 0 };
  
  const allBookings = bookings || getStoredBookings();
  const allEquipment = getStoredEquipment();
  const item = allEquipment.find(eq => eq.id === equipmentId);
  
  if (!item) return { available: false, reservedCount: 0, stock: 0 };

  const checkEnd = targetEndDate || targetDate;

  // Buscar reservas activas (Aprobado o En Evento) que coincidan con la fecha
  let reservedCount = 0;
  
  allBookings.forEach(booking => {
    // Si estamos editando una reserva existente, excluimos sus propios ítems
    if (currentBookingId && booking.id === currentBookingId) return;

    if (booking.status === 'Aprobado' || booking.status === 'En Evento') {
      const bStart = booking.eventDate;
      const bEnd = booking.endDate || booking.eventDate;
      
      // Dos rangos se solapan si targetDate <= bEnd Y checkEnd >= bStart
      const overlaps = targetDate <= bEnd && checkEnd >= bStart;
      
      if (overlaps) {
        booking.items.forEach(bItem => {
          if (bItem.equipmentId === equipmentId) {
            reservedCount += Number(bItem.quantity || 1);
          }
        });
      }
    }
  });

  const activeRepairs = getStoredRepairs();
  let damagedCount = 0;
  activeRepairs.forEach(rep => {
    if (rep.equipmentId === equipmentId && (rep.status === 'Pendiente' || rep.status === 'En Taller')) {
      damagedCount += Number(rep.quantity || 1);
    }
  });

  const availableStock = Math.max(0, item.totalStock - reservedCount - damagedCount);

  return {
    equipmentId,
    equipmentName: item.name,
    totalStock: item.totalStock,
    reservedCount,
    damagedCount,
    availableStock,
    isAvailable: availableStock > 0
  };
};

// GENERADOR DE ENLACES WA.ME CON MENSAJE ULTRA ESTRUCTURADO
export const generateWhatsAppLink = ({
  orderId,
  clientName,
  clientPhone,
  eventDate,
  endDate,
  eventLocation,
  items,
  totalAmount,
  notes,
  adminWhatsApp = null
}) => {
  const settings = getStoredSettings();
  const targetNumber = (adminWhatsApp || settings.whatsappNumber).replace(/\D/g, '');

  let message = `🔊 *COTIZACIÓN DE ALQUILER - ${settings.businessName.toUpperCase()}* 🎧\n\n`;
  message += `📌 *Solicitud:* #${orderId}\n`;
  message += `👤 *Cliente:* ${clientName || 'Por confirmar'}\n`;
  message += `📱 *Teléfono:* ${clientPhone || 'No indicado'}\n`;
  
  if (endDate && endDate !== eventDate) {
    message += `📅 *Fechas del Evento:* Del ${formatDateFriendly(eventDate)} al ${formatDateFriendly(endDate)}\n`;
  } else {
    message += `📅 *Fecha del Evento:* ${formatDateFriendly(eventDate)}\n`;
  }

  if (eventLocation) message += `📍 *Lugar / Locación:* ${eventLocation}\n`;
  message += `\n📦 *EQUIPOS SELECCIONADOS:*\n`;

  items.forEach((item, index) => {
    message += `  ${index + 1}. ${item.quantity}x ${item.name} (${formatCurrency(item.price * item.quantity)})\n`;
  });

  message += `\n💰 *VALOR TOTAL ESTIMADO:* ${formatCurrency(totalAmount)}\n`;
  message += `💵 *Abono 50% requerido:* ${formatCurrency(totalAmount * 0.5)}\n`;

  if (notes) {
    message += `\n📝 *Notas o detalles:* ${notes}\n`;
  }

  message += `\n_Quedo atento a la confirmación de disponibilidad para realizar el abono. ¡Gracias!_`;

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${targetNumber}?text=${encoded}`;
};

// GENERADOR DE MENSAJE WHATSAPP PARA COBRO DE GARANTÍA O REPORTE DE DAÑO
export const generateDamageReportWhatsAppLink = ({ repair, businessName, djPhone }) => {
  const clientPhone = (repair.clientPhone || '').replace(/\D/g, '');
  let msg = `⚠️ *INFORME TÉCNICO DE NOVEDAD & GARANTÍA - ${businessName || 'SOUND CONTROL'}*\n\n`;
  msg += `Hola ${repair.clientName || 'estimado cliente'}, te informamos que en la revisión técnica de retorno de tu evento *#${repair.bookingId || 'N/A'}*, se identificó una novedad en los equipos:\n\n`;
  msg += `🔧 *Equipo Afectado:* ${repair.equipmentName}\n`;
  msg += `📌 *Tipo de Falla:* ${repair.issueType || 'Daño técnico'}\n`;
  msg += `📝 *Diagnóstico Técnico:* ${repair.description || 'En revisión en taller'}\n`;
  
  if (repair.warrantyAmount > 0) {
    msg += `\n💰 *Costo de Repuesto / Reparación:* ${formatCurrency(repair.warrantyAmount)}\n`;
  }
  
  msg += `\nDe acuerdo con las condiciones de alquiler y contrato de entrega, te compartimos este reporte para proceder con la garantía o reposición correspondiente.\n`;
  msg += `Quedamos atentos a tu mensaje para coordinar. ¡Muchas gracias!`;
  
  return `https://wa.me/${clientPhone}?text=${encodeURIComponent(msg)}`;
};

// COMPRESOR Y PROCESADOR DE IMÁGENES (Celular / Cámara / PC)
// Convierte fotos pesadas de celulares en JPEG nítido de ~90KB para almacenamiento local fluido
export const processImageFile = (file, maxDim = 900, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (!file.type.startsWith('image/')) {
      return reject(new Error('El archivo seleccionado no es una imagen válida.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('No se pudo cargar la imagen seleccionada.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo de la imagen.'));
    reader.readAsDataURL(file);
  });
};

