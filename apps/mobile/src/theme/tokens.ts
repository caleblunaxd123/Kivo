/**
 * VozPE Design Tokens
 * Fuente de verdad visual — nacidos del logo (azul + verde)
 */

export const T = {
  // ── Brand ─────────────────────────────────────────────────────────────────
  blue:        '#1F6FE5',   // azul principal vivo
  blueDeep:    '#1557C8',   // azul profundo (hover, activo)
  green:       '#2DBE60',   // verde complementario del logo
  greenDeep:   '#1FA451',   // verde profundo

  // ── Fondos ────────────────────────────────────────────────────────────────
  appBg:       '#F4F9FD',   // fondo app — casi blanco, tinte azul muy suave
  headerBg:    '#EAF4FC',   // header — celeste suave
  cardBg:      '#FFFFFF',   // cards blancas
  softBlueBg:  '#EAF3FB',   // superficies blue-tinted
  softMintBg:  '#EDF8F2',   // superficies green-tinted
  inputBg:     '#F2F7FC',

  // ── Bordes ────────────────────────────────────────────────────────────────
  strokeSoft:  '#D5E8F5',   // bordes cards
  strokeBlue:  '#BDD8F0',   // bordes con acento azul
  strokeGreen: '#B8E8CB',   // bordes con acento verde

  // ── Texto ─────────────────────────────────────────────────────────────────
  textPrimary:   '#0F172A',
  textSecondary: '#4A6070',
  textMuted:     '#7C8B98',
  textInverse:   '#FFFFFF',

  // ── Orbs decorativos (opacidades bajas) ────────────────────────────────────
  orbBlue:     '#1F6FE514',  // azul 8%
  orbBlueM:    '#1F6FE522',  // azul 13%
  orbGreen:    '#2DBE6014',  // verde 8%
  orbGreenM:   '#2DBE6022',  // verde 13%

  // ── Estado ────────────────────────────────────────────────────────────────
  warning:     '#F59E0B',
  warningBg:   '#FFF8E6',
  error:       '#EF4444',

  // ── Radios ────────────────────────────────────────────────────────────────
  rCard:    20,
  rCardLg:  24,
  rBtn:     999,
  rChip:    999,
  rIcon:    12,

  // ── Sombras ───────────────────────────────────────────────────────────────
  shadowCard: {
    shadowColor: '#1F6FE5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  shadowBtn: {
    shadowColor: '#1F6FE5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  shadowFab: {
    shadowColor: '#1F6FE5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 20,
    elevation: 12,
  },
} as const;
