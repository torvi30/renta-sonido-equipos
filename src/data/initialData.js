// Catálogo base para negocio de DJ y Alquiler de Sonido Profesional
export const INITIAL_EQUIPMENT = [
  // --- BAFLES Y BAJOS ---
  {
    id: "eq-1",
    name: "Cabina Activa JBL PRX815W (1500W)",
    category: "Bafles y Bajos",
    description: "Bafle activo de 15 pulgadas, conectividad Wi-Fi DSP, ideal para eventos de hasta 150 personas con sonido cristalino.",
    pricePerDay: 80000,
    totalStock: 4,
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    includes: ["1 Cable de poder", "1 Cable XLR 10m", "1 Trípode metálico"],
    specifications: "1500 Watts Clase D | Respuesta 52Hz - 20kHz | DSP integrado",
    isPopular: true
  },
  {
    id: "eq-2",
    name: "Bajo Subwoofer JBL PRX818XLFW (1500W)",
    category: "Bafles y Bajos",
    description: "Subwoofer activo de 18 pulgadas autoamplificado para bajos profundos y contundentes que hacen retumbar la pista.",
    pricePerDay: 130000,
    totalStock: 2,
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
    includes: ["1 Cable de poder industrial", "1 Cable XLR 5m", "Tubo distanciador para satélite"],
    specifications: "18 pulgadas | 1500W | Frecuencia de corte seleccionable",
    isPopular: true
  },
  {
    id: "eq-3",
    name: "Monitor de Piso Electro-Voice ZLX-12P",
    category: "Bafles y Bajos",
    description: "Monitor de escenario activo de 12 pulgadas, perfecto para monitoreo de DJ o bandas en vivo.",
    pricePerDay: 60000,
    totalStock: 3,
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    includes: ["1 Cable de poder", "1 Cable XLR 6m"],
    specifications: "1000 Watts | Woofer 12'' + Driver de titanio 1.5''",
    isPopular: false
  },

  // --- CONSOLAS Y EQUIPOS DJ ---
  {
    id: "eq-dj",
    name: "Servicio de DJ Profesional en Vivo + Animación",
    category: "Consolas y DJ",
    description: "DJ profesional con animación de público, mezcla en vivo de todos los géneros (Crossover, Electrónica, Reggaeton, Salsa, Retro).",
    pricingType: "both",
    pricePerDay: 350000,
    pricePerHour: 60000,
    minHours: 3,
    totalStock: 2,
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    includes: ["DJ en cabina", "Audífonos pro", "Set musical personalizado", "Animación al micrófono"],
    specifications: "Mezcla continua en vivo | Repertorio ilimitado | Equipo propio de monitoreo",
    isPopular: true,
    isDjService: true
  },
  {
    id: "eq-4",
    name: "Controlador DJ Pioneer DDJ-FLX6 (4 Canales)",
    category: "Consolas y DJ",
    description: "Consola profesional de 4 canales compatible con Rekordbox y Serato DJ Pro. Jog wheels de tamaño club.",
    pricingType: "both",
    pricePerDay: 120000,
    pricePerHour: 35000,
    minHours: 2,
    totalStock: 2,
    imageUrl: "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=800&q=80",
    includes: ["1 Cable USB A/B", "1 Adaptador de poder original", "1 Cable RCA a Jack balanceado", "Estuche rígido Flight Case"],
    specifications: "4 Canales | Merge FX | Jog Cutter | Full Size Wheels",
    isPopular: true,
    isDjService: false
  },
  {
    id: "eq-5",
    name: "Consola Mezcladora Yamaha MG12XU (12 Canales)",
    category: "Consolas y DJ",
    description: "Mezclador análogo de 12 canales con procesador de efectos SPX, compresores de 1 perilla y USB interface.",
    pricingType: "days",
    pricePerDay: 70000,
    pricePerHour: 20000,
    minHours: 2,
    totalStock: 2,
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
    includes: ["1 Cable de alimentación", "Manual rápido de conexionado", "Estuche de transporte"],
    specifications: "12 Entradas | 4 Buses | Preamps D-PRE | 24 Efectos digitales",
    isPopular: false
  },

  // --- MICROFONÍA ---
  {
    id: "eq-6",
    name: "Kit Micrófonos Inalámbricos Shure BLX288/PG58 (Doble)",
    category: "Microfonía",
    description: "Sistema dual de micrófonos de mano inalámbricos con hasta 100m de alcance sin interferencias.",
    pricePerDay: 50000,
    totalStock: 3,
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    includes: ["2 Micrófonos de mano", "1 Receptor dual BLX88", "1 Fuente de poder", "2 Cables XLR 2m", "Pilas AA nuevas"],
    specifications: "Frecuencia UHF | Alcance 100m | Batería 14 horas",
    isPopular: true
  },
  {
    id: "eq-7",
    name: "Micrófono Vocal Shure SM58 Dinámico",
    category: "Microfonía",
    description: "El estándar mundial de los micrófonos vocales. Construcción a prueba de golpes con patrón cardioide.",
    pricePerDay: 20000,
    totalStock: 6,
    imageUrl: "https://images.unsplash.com/photo-1520523839898-507124cd5371?auto=format&fit=crop&w=800&q=80",
    includes: ["1 Micrófono SM58", "1 Cable XLR balanceado 6m", "1 Pipeta porta-micrófono", "1 Trípode de mesa o jirafa"],
    specifications: "Dinámico Cardioide | Respuesta 50Hz - 15kHz",
    isPopular: false
  },

  // --- ILUMINACIÓN Y EFECTOS ---
  {
    id: "eq-8",
    name: "Par de Cabezas Móviles Beam 7R (230W) + Flight Case",
    category: "Luces y Efectos",
    description: "Luces robóticas de haz súper concentrado y brillante con prisma de 8 caras y rueda de gobos para espectáculos.",
    pricePerDay: 140000,
    totalStock: 2,
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
    includes: ["2 Cabezas 7R", "2 Abrazaderas de montaje en T", "2 Cables Powercon", "2 Cables DMX 5m"],
    specifications: "Lámpara 230W 7R | Prisma rotativo | 14 Colores + Blanco | DMX 16ch",
    isPopular: true
  },
  {
    id: "eq-9",
    name: "Kit 4 Luces Par LED 54x3W RGBW + Barra T",
    category: "Luces y Efectos",
    description: "Pack de 4 tachos LED de alta potencia para ambientación de pista de baile, escenario o paredes arquitectónicas.",
    pricePerDay: 75000,
    totalStock: 3,
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    includes: ["4 Focos LED Par", "1 Trípode con barra T de 3 metros", "Cables DMX enlazados", "1 Cable de corriente general"],
    specifications: "54 LEDs x 3 Watts | Modo audio rítmico, automático o DMX",
    isPopular: true
  },
  {
    id: "eq-10",
    name: "Máquina de Humo 1500W con Luces LED + Líquido",
    category: "Luces y Efectos",
    description: "Generador de niebla densa para resaltar los haces de luz y el láser. Incluye control remoto inalámbrico y 1 litro de líquido.",
    pricePerDay: 45000,
    totalStock: 2,
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    includes: ["1 Máquina de humo 1500W", "1 Control remoto inalámbrico", "1 Litro de líquido densa calidad premium", "1 Cable de poder"],
    specifications: "1500W | Calentamiento 4 min | Salida de 20.000 cu.ft/min",
    isPopular: false
  },

  // --- CABLES Y ESTRUCTURA (LOGÍSTICA VITAL) ---
  {
    id: "eq-11",
    name: "Kit Eléctrico de Escenario: Extensión 20m + Multitoma Industrial",
    category: "Cables y Energía",
    description: "Extensión uso rudo calibre 12 con caja de 4 tomas aterrizadas protegidas para evitar bajas de tensión.",
    pricePerDay: 20000,
    totalStock: 5,
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    includes: ["1 Extensión encauchetada 20m Calibre 12", "1 Regleta con polo a tierra", "Cinta aislante de cortesía"],
    specifications: "Soporta hasta 20A / 2500 Watts continuo",
    isPopular: false
  }
];

// COMBOS Y PAQUETES PREDISEÑADOS (Aceleradores de cotización)
export const INITIAL_COMBOS = [
  {
    id: "combo-1",
    name: "Pack DJ Fiesta Pro (Hasta 100 personas)",
    tag: "Más Pedido",
    description: "El combo infaltable para cumpleaños, fiestas privadas y grados. Potencia limpia, luces dinámicas y show DJ.",
    pricingType: "both",
    includedHours: 4,
    pricePerHour: 65000,
    extraHourPrice: 40000,
    isDjCombo: true,
    pricePerDay: 290000,
    discountPrice: 250000,
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    items: [
      { equipmentId: "eq-1", quantity: 2, name: "2x Cabinas JBL PRX815W (1500W)" },
      { equipmentId: "eq-4", quantity: 1, name: "1x Consola DJ Pioneer DDJ-FLX6" },
      { equipmentId: "eq-6", quantity: 1, name: "1x Kit Micrófonos Shure Inalámbricos (Doble)" },
      { equipmentId: "eq-9", quantity: 1, name: "1x Kit 4 Luces Par LED con Trípode T" },
      { equipmentId: "eq-11", quantity: 1, name: "1x Kit Eléctrico Extensión 20m" }
    ],
    checklist: [
      "2 Cabinas JBL 15'' con fundas",
      "2 Trípodes de cabina metálicos",
      "Controlador Pioneer DDJ-FLX6 en su Flight Case",
      "Cables USB y cargador de consola",
      "2 Micrófonos Shure inalámbricos + pilas",
      "Receptor Shure + transformador 12V",
      "Barra de 4 Luces LED con su trípode T",
      "2 Cables XLR de 10m y 2 cables XLR de 5m",
      "Extensión eléctrica 20m calibre 12",
      "Multitoma industrial"
    ]
  },
  {
    id: "combo-2",
    name: "Pack Boda & Quinceañero Deluxe (Hasta 250 personas)",
    tag: "Gama Alta",
    description: "Montaje completo con bajos demoledores, cabezas móviles robóticas, máquina de humo y sonido envolvente.",
    pricingType: "both",
    includedHours: 5,
    pricePerHour: 110000,
    extraHourPrice: 60000,
    isDjCombo: true,
    pricePerDay: 620000,
    discountPrice: 530000,
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
    items: [
      { equipmentId: "eq-1", quantity: 2, name: "2x Cabinas JBL PRX815W" },
      { equipmentId: "eq-2", quantity: 2, name: "2x Subwoofers JBL PRX818XLFW (18'')" },
      { equipmentId: "eq-4", quantity: 1, name: "1x Consola DJ Pioneer 4 Canales" },
      { equipmentId: "eq-8", quantity: 1, name: "1x Par Cabezas Móviles Beam 7R" },
      { equipmentId: "eq-9", quantity: 1, name: "1x Kit Luces Par LED Ambientales" },
      { equipmentId: "eq-10", quantity: 1, name: "1x Máquina de Humo 1500W + Líquido" },
      { equipmentId: "eq-6", quantity: 1, name: "1x Kit Micrófonos Shure Dual" }
    ],
    checklist: [
      "2 Subwoofers 18'' JBL + 2 Tubos distanciadores",
      "2 Cabinas satélites JBL 15''",
      "2 Cabezas móviles Beam 7R con ganchos y cables Powercon",
      "Máquina de humo con líquido lleno y control inalámbrico",
      "Consola DJ Pioneer en case",
      "Kit Shure inalámbrico con 4 pilas AA nuevas",
      "Set completo de cables XLR (6 unidades) y DMX (4 unidades)",
      "2 Extensiones 20m uso rudo + 2 regletas"
    ]
  },
  {
    id: "combo-3",
    name: "Pack Conferencia / Evento Corporativo",
    tag: "Corporativo",
    description: "Voz ultra clara, presentación impecable y cero ruidos de acople. Ideal para asambleas y charlas empresariales.",
    pricePerDay: 230000,
    discountPrice: 190000,
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
    items: [
      { equipmentId: "eq-3", quantity: 2, name: "2x Parlantes Electro-Voice ZLX-12P" },
      { equipmentId: "eq-5", quantity: 1, name: "1x Consola Yamaha MG12XU (12 Canales)" },
      { equipmentId: "eq-6", quantity: 1, name: "1x Micrófonos Inalámbricos Dobles Shure" },
      { equipmentId: "eq-7", quantity: 1, name: "1x Micrófono Shure SM58 de respaldo" },
      { equipmentId: "eq-11", quantity: 1, name: "1x Kit Eléctrico" }
    ],
    checklist: [
      "2 Parlantes EV 12'' con bases de trípode",
      "Consola Yamaha de 12 canales con cable de poder",
      "2 Micrófonos inalámbricos con filtro antipop",
      "1 Micrófono cableado SM58 con cable XLR de 10m",
      "Cable auxiliar 3.5mm a 2x Jack para conectar laptop/móvil",
      "Extensión eléctrica y cinta gaffer para fijar cables al suelo"
    ]
  }
];

// PEDIDOS Y RESERVAS DE EJEMPLO PARA MOSTRAR EL FLUJO REAL
export const INITIAL_BOOKINGS = [
  {
    id: "SEC-1024",
    clientName: "Carlos Méndez (Discoteca La Cabaña)",
    clientPhone: "+573001234567",
    clientCity: "Medellín / Poblado",
    eventDate: "2026-10-10",
    endDate: "2026-10-11",
    eventLocation: "Finca El Paraíso, Vereda El Salado",
    status: "Aprobado", // Pendiente, Aprobado, En Evento, Finalizado, Cancelado
    items: [
      { equipmentId: "eq-1", name: "Cabina Activa JBL PRX815W", quantity: 2, price: 80000 },
      { equipmentId: "eq-2", name: "Bajo Subwoofer JBL PRX818XLFW", quantity: 2, price: 130000 },
      { equipmentId: "eq-4", name: "Controlador DJ Pioneer DDJ-FLX6", quantity: 1, price: 120000 },
      { equipmentId: "eq-8", name: "Par Cabezas Móviles Beam 7R", quantity: 1, price: 140000 }
    ],
    totalAmount: 680000,
    depositAmount: 340000, // 50% abono
    balanceDue: 340000,
    paymentMethod: "Nequi",
    notes: "Requiere montaje antes de las 5:00 PM. Evento inicia a las 8:00 PM.",
    checklistVerified: false,
    createdAt: "2026-10-07T14:30:00Z"
  },
  {
    id: "SEC-1025",
    clientName: "Mariana Restrepo (Boda Campestre)",
    clientPhone: "+573159876543",
    clientCity: "Rionegro / Llanogrande",
    eventDate: "2026-10-12",
    endDate: "2026-10-12",
    eventLocation: "Hacienda San José, Llanogrande",
    status: "Pendiente",
    items: [
      { equipmentId: "eq-1", name: "Cabina Activa JBL PRX815W", quantity: 2, price: 80000 },
      { equipmentId: "eq-6", name: "Kit Micrófonos Inalámbricos Shure", quantity: 1, price: 50000 },
      { equipmentId: "eq-9", name: "Kit 4 Luces Par LED", quantity: 1, price: 75000 }
    ],
    totalAmount: 285000,
    depositAmount: 0,
    balanceDue: 285000,
    paymentMethod: "Pendiente",
    notes: "Cotización enviada por WhatsApp. En espera de confirmación de anticipo.",
    checklistVerified: false,
    createdAt: "2026-10-08T09:15:00Z"
  },
  {
    id: "SEC-1022",
    clientName: "David Gómez (Cumpleaños 30)",
    clientPhone: "+573204561122",
    clientCity: "Envigado",
    eventDate: "2026-10-08",
    endDate: "2026-10-09",
    eventLocation: "Salón Social Torres del Parque",
    status: "En Evento",
    items: [
      { equipmentId: "eq-1", name: "Cabina Activa JBL PRX815W", quantity: 2, price: 80000 },
      { equipmentId: "eq-4", name: "Controlador DJ Pioneer DDJ-FLX6", quantity: 1, price: 120000 },
      { equipmentId: "eq-10", name: "Máquina de Humo 1500W", quantity: 1, price: 45000 }
    ],
    totalAmount: 325000,
    depositAmount: 200000,
    balanceDue: 125000, // Alerta pendiente por cobrar en sitio
    paymentMethod: "Efectivo / Nequi",
    notes: "Cobrar los $125.000 restantes al momento de desmontar a las 3:00 AM.",
    checklistVerified: true,
    createdAt: "2026-10-05T11:00:00Z"
  }
];

export const CATEGORIES = [
  "Todos",
  "Combos y Paquetes",
  "Bafles y Bajos",
  "Consolas y DJ",
  "Microfonía",
  "Luces y Efectos",
  "Cables y Energía"
];

export const INITIAL_REPAIRS = [
  {
    id: "REP-201",
    equipmentId: "eq-1",
    equipmentName: "Cabina Activa JBL PRX815W (1500W)",
    quantity: 1,
    reportedDate: "2026-10-08",
    reportedBy: "Técnico de Tarima & Bodega",
    bookingId: "SEC-1022",
    clientName: "David Gómez (Cumpleaños 30)",
    clientPhone: "+573204561122",
    issueType: "Sonido / Driver",
    severity: "Alta",
    description: "No emite sonido en agudos (trompeta de alta frecuencia muda). Se recalentó la bobina.",
    status: "En Taller", // 'Pendiente', 'En Taller', 'Listo', 'Baja'
    technicianAssigned: "Técnico de Tarima & Bodega",
    costSpareParts: 65000,
    sparePartsNotes: "Repuesto diafragma titanio 1.75\" JBL original",
    solutionNotes: "Reemplazado diafragma y probado en banco de audio a 75% durante 20 minutos.",
    repairedDate: "",
    warrantyChargedToClient: true,
    warrantyAmount: 65000,
    createdAt: "2026-10-08T16:00:00Z"
  },
  {
    id: "REP-202",
    equipmentId: "eq-6",
    equipmentName: "Kit 2 Micrófonos Inalámbricos Shure BLX288/PG58",
    quantity: 1,
    reportedDate: "2026-10-07",
    reportedBy: "Encargado de Operaciones",
    bookingId: "",
    clientName: "",
    clientPhone: "",
    issueType: "Cables / Conectores",
    severity: "Media",
    description: "Falso contacto en la antena A del receptor. Pierde señal a más de 10 metros.",
    status: "Pendiente",
    technicianAssigned: "Técnico de Tarima & Bodega",
    costSpareParts: 15000,
    sparePartsNotes: "Conector BNC de chasis hembra",
    solutionNotes: "",
    repairedDate: "",
    warrantyChargedToClient: false,
    warrantyAmount: 0,
    createdAt: "2026-10-07T11:20:00Z"
  }
];

export const INITIAL_PAYROLL = [
  {
    id: "PAY-101",
    workerName: "Técnico de Tarima & Bodega",
    role: "Técnico de Sonido & Montaje",
    bookingId: "SEC-1022",
    eventName: "Cumpleaños 30 David Gómez",
    eventDate: "2026-10-08",
    concept: "Turno montaje de 2 cabinas JBL, consola DJ y luces",
    amount: 80000,
    status: "Por Pagar",
    paidDate: "",
    paymentMethod: "Nequi",
    notes: "Pagar al finalizar la recogida a las 3:00 AM",
    createdAt: "2026-10-08T18:00:00Z"
  },
  {
    id: "PAY-102",
    workerName: "Encargado de Operaciones",
    role: "Operador de Consola & Iluminación",
    bookingId: "SEC-1021",
    eventName: "Boda Valentina & Carlos",
    eventDate: "2026-10-10",
    concept: "Operación de consola digital, micrófonos y luces robóticas",
    amount: 150000,
    status: "Pagado",
    paidDate: "2026-10-09",
    paymentMethod: "Transferencia Bancolombia",
    notes: "Abonado con anticipo",
    createdAt: "2026-10-06T12:00:00Z"
  }
];
