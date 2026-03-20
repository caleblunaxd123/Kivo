/**
 * Color utilities for Kivo
 * Genera colores determinísticos para usuarios/miembros basados en su nombre
 */

const MEMBER_COLORS = [
  '#6366F1', // indigo (kivo brand)
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

// Kivo design tokens
export const COLORS = {
  // Background
  bgBase: '#0A0A0F',
  bgSurface: '#111118',
  bgElevated: '#1A1A26',
  bgInput: '#1E1E2E',
  bgHover: '#252538',
  bgSelected: '#2A2A45',
  // Borders
  borderSubtle: '#1E1E2E',
  borderDefault: '#2A2A45',
  borderStrong: '#3A3A5C',
  // Text
  textPrimary: '#F0F0FF',
  textSecondary: '#9090B8',
  textTertiary: '#5A5A80',
  // Accent - Kivo Blue/Indigo
  kivo400: '#818CF8',
  kivo500: '#6366F1',
  kivo600: '#4F46E5',
  kivo700: '#4338CA',
  // Semantic
  success: '#22C55E',
  successMuted: 'rgba(34,197,94,0.15)',
  warning: '#F97316',
  warningMuted: 'rgba(249,115,22,0.15)',
  error: '#EF4444',
  errorMuted: 'rgba(239,68,68,0.15)',
  ai: '#A78BFA',
  aiMuted: 'rgba(167,139,250,0.15)',
} as const;
