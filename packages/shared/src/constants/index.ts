// ─── Vozpe Constants ──────────────────────────────────────────────────────────

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'Dólar estadounidense', flag: '🇺🇸' },
  { code: 'PEN', symbol: 'S/', name: 'Sol peruano', flag: '🇵🇪' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'CLP', symbol: '$', name: 'Peso chileno', flag: '🇨🇱' },
  { code: 'COP', symbol: '$', name: 'Peso colombiano', flag: '🇨🇴' },
  { code: 'MXN', symbol: '$', name: 'Peso mexicano', flag: '🇲🇽' },
  { code: 'ARS', symbol: '$', name: 'Peso argentino', flag: '🇦🇷' },
  { code: 'BRL', symbol: 'R$', name: 'Real brasileño', flag: '🇧🇷' },
  { code: 'GBP', symbol: '£', name: 'Libra esterlina', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', name: 'Yen japonés', flag: '🇯🇵' },
] as const;

export const CATEGORY_CONFIG = {
  transport: { label: 'Transporte', emoji: '🚗', color: '#60A5FA' },
  food: { label: 'Comida', emoji: '🍽', color: '#FB923C' },
  accommodation: { label: 'Alojamiento', emoji: '🏨', color: '#A78BFA' },
  shopping: { label: 'Compras', emoji: '🛒', color: '#4ADE80' },
  entertainment: { label: 'Entretenimiento', emoji: '🎉', color: '#F472B6' },
  travel: { label: 'Viaje', emoji: '✈️', color: '#38BDF8' },
  health: { label: 'Salud', emoji: '💊', color: '#34D399' },
  utilities: { label: 'Servicios', emoji: '⚡', color: '#FACC15' },
  other: { label: 'Otros', emoji: '📦', color: '#94A3B8' },
} as const;

export const GROUP_TYPE_CONFIG = {
  travel: { label: 'Viaje', emoji: '✈️' },
  home: { label: 'Casa / Roomies', emoji: '🏠' },
  event: { label: 'Evento', emoji: '🎉' },
  shopping: { label: 'Compras', emoji: '🛒' },
  work: { label: 'Trabajo', emoji: '💼' },
  materials: { label: 'Materiales', emoji: '🔧' },
  birthday: { label: 'Cumpleaños', emoji: '🎂' },
  general: { label: 'General', emoji: '📋' },
} as const;

export const SPLIT_RULE_LABELS = {
  equal: 'División igual',
  percentage: 'Por porcentaje',
  fixed: 'Monto fijo',
  shares: 'Por partes',
  custom: 'Personalizado',
} as const;

export const PENDING_REASON_LABELS: Record<string, string> = {
  falta_pagador: 'Falta definir quién pagó',
  falta_moneda: 'Falta definir la moneda',
  falta_monto: 'Falta el monto',
  ocr_dudoso: 'Texto poco legible en la foto',
  posible_duplicado: 'Parece una entrada duplicada',
  ticket_mixto: 'Ticket con múltiples ítems para diferentes personas',
  reparto_no_definido: 'Falta definir cómo dividir',
  item_ambiguo: 'Descripción poco clara',
};

export const VOICE_EXAMPLES = [
  'Taxi 40 dólares, pagué yo, entre 4',
  '2 polos a 15 dólares, solo para Diego',
  'Descuento de 10 soles',
  'Almuerzo 80, pagó Luis, compartido',
  'Agrega 3 snacks a 4 dólares para todos',
  'Crea una nota: falta comprar agua',
  'Hotel 200 USD pagó Ana para todos',
  'Uber 22 dividido entre 3',
];

export const TEXT_QUICK_EXAMPLES = [
  'uber 22 dividido entre 3',
  'snacks 12 usd yo',
  'camiseta 18 solo mia',
  'agua 3 x 2.5 todos',
  'mercado 45 soles casa',
  'almuerzo 80 pago luis todos',
];

export const AI_CATEGORY_KEYWORDS: Record<string, string[]> = {
  transport: ['taxi', 'uber', 'lyft', 'bus', 'metro', 'tren', 'avion', 'vuelo', 'gasolina', 'bencina', 'peaje', 'autopista', 'boleto'],
  food: ['comida', 'almuerzo', 'cena', 'desayuno', 'cafe', 'restaurant', 'pizza', 'hamburguesa', 'sushi', 'delivery', 'mcdonalds', 'pollo', 'snacks', 'bebida'],
  accommodation: ['hotel', 'hostal', 'airbnb', 'hospedaje', 'alojamiento', 'habitacion', 'cuarto'],
  shopping: ['supermercado', 'mercado', 'tienda', 'mall', 'ropa', 'zapatos', 'amazon', 'compras'],
  entertainment: ['cine', 'teatro', 'concierto', 'disco', 'bar', 'club', 'entrada', 'tour', 'museo'],
  travel: ['tour', 'excursion', 'paseo', 'visita', 'entrada', 'boleto', 'ticket'],
  health: ['farmacia', 'medicina', 'doctor', 'clinica', 'hospital', 'medicamento'],
  utilities: ['luz', 'agua', 'gas', 'internet', 'telefono', 'netflix', 'spotify'],
};
