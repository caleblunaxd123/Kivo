/**
 * Kivo Design Tokens — fuente de verdad visual
 * Todos los colores, sombras, radios y espaciados nacen del logo (azul + verde).
 * Importar siempre como:  import { T } from '../theme/tokens';
 */

export const T = {
  // ── Brand ─────────────────────────────────────────────────────────────────
  blue:        '#1F6FE5',   // azul principal (marca dominante)
  blueDeep:    '#1557C8',   // azul profundo — hover, pressed
  blueSoft:    '#EAF3FB',   // azul muy suave — superficies, chips inactivos
  blueLight:   '#DBEEFF',   // azul extra suave — fondos tinted
  green:       '#2DBE60',   // verde complementario del logo
  greenDeep:   '#1FA451',   // verde profundo — hover, pressed
  greenSoft:   '#EDF8F2',   // verde muy suave — superficies mint
  // ── Aliases ───────────────────────────────────────────────────────────────
  softBlueBg:  '#EAF3FB',   // alias de blueSoft — fondo suave azul
  softMintBg:  '#EDF8F2',   // alias de greenSoft — fondo suave mint

  // ── Fondos ────────────────────────────────────────────────────────────────
  appBg:       '#F4F9FD',   // fondo app — blanco con matiz celeste mínimo
  headerBg:    '#EAF4FC',   // header — celeste suave
  cardBg:      '#FFFFFF',   // cards y superficies principales
  inputBg:     '#F2F7FC',   // input fields

  // ── Bordes ────────────────────────────────────────────────────────────────
  strokeSoft:  '#D5E8F5',   // bordes cards — celeste muy suave
  strokeBlue:  '#BDD8F0',   // bordes con acento azul
  strokeGreen: '#B8E8CB',   // bordes con acento verde

  // ── Texto ─────────────────────────────────────────────────────────────────
  textPrimary:   '#0F172A',
  textSecondary: '#4A6070',
  textMuted:     '#7C8B98',
  textInverse:   '#FFFFFF',

  // ── Estados ───────────────────────────────────────────────────────────────
  success:    '#22A861',
  warning:    '#D97706',
  warningBg:  '#FFF7E6',
  error:      '#DC2626',
  errorBg:    '#FFF1F1',

  // ── Orbs decorativos ──────────────────────────────────────────────────────
  orbBlue:    '#1F6FE510',  // azul 6%
  orbBlueM:   '#1F6FE51A',  // azul 10%
  orbGreen:   '#2DBE6010',  // verde 6%
  orbGreenM:  '#2DBE601A',  // verde 10%

  // ── Radios ────────────────────────────────────────────────────────────────
  rSm:    8,
  rMd:    12,
  rCard:  18,
  rCardLg:22,
  rBtn:   999,   // píldora
  rChip:  999,
  rIcon:  10,

  // ── Espaciado ─────────────────────────────────────────────────────────────
  spXs:  6,
  spSm: 10,
  spMd: 16,
  spLg: 24,

  // ── Tipografía ────────────────────────────────────────────────────────────
  // Sizes
  fsXs:  11,
  fsSm:  12,
  fsMd:  14,
  fsBase:15,
  fsLg:  18,
  fsXl:  22,
  fs2xl: 26,
  fs3xl: 32,
  fs4xl: 40,
  fs5xl: 48,

  // Font Weights
  fwNormal: '400',
  fwMedium: '500',
  fwSemiBold: '600',
  fwBold: '700',
  fwExtraBold: '800',

  // ── Sombras ───────────────────────────────────────────────────────────────
  shadowXs: {
    shadowColor: '#1F6FE5',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  shadowCard: {
    shadowColor: '#1F6FE5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  shadowBtn: {
    shadowColor: '#1F6FE5',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.26,
    shadowRadius: 14,
    elevation: 7,
  },
  shadowFab: {
    shadowColor: '#1F6FE5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.36,
    shadowRadius: 20,
    elevation: 12,
  },
  shadowModal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 24,
  },
} as const;
