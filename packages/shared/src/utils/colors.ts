/**
 * Color utilities for Vozpe
 * Genera colores determinísticos para usuarios/miembros basados en su nombre
 */

const MEMBER_COLORS = [
  '#6366F1', // indigo (vozpe brand)
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#EF4444', // red
  '#14B8A6', // teal
  '#F97316', // orange
  '#06B6D4', // cyan
  '#84CC16', // lime
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
// Fondos blancos/gris claro, acentos índigo vibrantes, legible y profesional.
// Inspirado en Splitwise, Linear Light, Notion: clean y accesible.
export const COLORS = {
  // ── Backgrounds ──────────────────────────────────────────────
  bgBase:     '#F4F6FB',   // Gris lavanda muy suave (pantalla base)
  bgSurface:  '#FFFFFF',   // Blanco puro — cards, modales
  bgElevated: '#EEF1FB',   // Ligeramente elevado con tinte índigo
  bgInput:    '#F4F6FB',   // Campos de texto
  bgHover:    '#E8ECFA',   // Hover interactivo
  bgSelected: '#DDE3F8',   // Seleccionado / activo

  // ── Borders ──────────────────────────────────────────────────
  borderSubtle:  '#ECEEF8',   // Divisores muy sutiles
  borderDefault: '#E2E6F5',   // Bordes normales
  borderStrong:  '#C7CEEA',   // Bordes con peso
  borderAccent:  'rgba(99,102,241,0.3)', // Borde con tinte índigo

  // ── Text ─────────────────────────────────────────────────────
  textPrimary:   '#1A1D35',   // Casi negro con tinte índigo
  textSecondary: '#5C6494',   // Gris-índigo medio
  textTertiary:  '#9BA3C9',   // Placeholder / muted

  // ── Brand — Kivo Indigo ───────────────────────────────────────
  kivo300: '#A5B4FC',
  kivo400: '#818CF8',
  kivo500: '#6366F1',
  kivo600: '#4F46E5',
  kivo700: '#4338CA',

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
