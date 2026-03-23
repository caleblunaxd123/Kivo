/**
 * Color utilities for Kivo
 * Genera colores determinísticos para usuarios/miembros basados en su nombre
 */

const MEMBER_COLORS = [
  '#0891B2', // cyan  (kivo brand)
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#EF4444', // red
  '#14B8A6', // teal
  '#F97316', // orange
  '#65A30D', // lime (kivo green)
  '#84CC16', // lime light
  '#A855F7', // purple
];

export function generateMemberColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % MEMBER_COLORS.length;
  return MEMBER_COLORS[index];
}

export function generateInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Kivo design tokens — Light theme
// Alineado con identidad visual del logo: teal/cyan + lime green + navy.
// Fondos limpios en blanco/gris muy suave, acentos en teal vibrante.
export const COLORS = {
  // ── Backgrounds ──────────────────────────────────────────────
  bgBase:     '#F4FAFB',   // Blanco con tinte cyan muy suave (pantalla base)
  bgSurface:  '#FFFFFF',   // Blanco puro — cards, modales
  bgElevated: '#ECFEFF',   // Tinte cyan-50 suave — superficies elevadas
  bgInput:    '#F4FAFB',   // Campos de texto
  bgHover:    '#CFFAFE',   // Hover interactivo (cyan-100)
  bgSelected: '#A5F3FC',   // Seleccionado / activo (cyan-200)

  // ── Borders ──────────────────────────────────────────────────
  borderSubtle:  '#E0F7FA',   // Divisores muy sutiles
  borderDefault: '#BAE6FD',   // Bordes normales (sky-200)
  borderStrong:  '#7DD3FC',   // Bordes con peso (sky-300)
  borderAccent:  'rgba(8,145,178,0.25)', // Borde con tinte cyan

  // ── Text ─────────────────────────────────────────────────────
  textPrimary:   '#0C1A2E',   // Casi negro con tinte navy
  textSecondary: '#374E6B',   // Navy-gris medio
  textTertiary:  '#6B8FA8',   // Placeholder / muted

  // ── Brand — Kivo Teal/Cyan (icon + UI accent) ────────────────
  kivo300: '#67E8F9',   // cyan-300
  kivo400: '#22D3EE',   // cyan-400 — iconos, chips
  kivo500: '#0891B2',   // cyan-600 — primario UI (botones, highlights)
  kivo600: '#0E7490',   // cyan-700 — hover/pressed
  kivo700: '#155E75',   // cyan-800 — muy oscuro

  // ── Brand — Kivo Navy (texto "Kivo" en el logo) ───────────────
  kivoNavy:      '#1E3A8A',   // blue-800 — color de "Kivo" en el logo
  kivoNavyLight: '#EFF6FF',   // bg muy suave navy

  // ── Brand — Kivo Green (texto "Kivo" en el logo) ───────────────
  kivoGreen:      '#65A30D',   // lime-600 — legible en fondo claro
  kivoGreenLight: '#F7FEE7',   // lime-50 — bg muy suave
  kivoGreenBright: '#84CC16',  // lime-500 — para iconos/chips

  // ── Semantic ─────────────────────────────────────────────────
  success:      '#059669',
  successMuted: 'rgba(5,150,105,0.10)',
  warning:      '#D97706',
  warningMuted: 'rgba(217,119,6,0.10)',
  error:        '#DC2626',
  errorMuted:   'rgba(220,38,38,0.10)',
  ai:           '#7C3AED',
  aiMuted:      'rgba(124,58,237,0.08)',

  // ── Misc ─────────────────────────────────────────────────────
  white:       '#FFFFFF',
  transparent: 'transparent',
} as const;
