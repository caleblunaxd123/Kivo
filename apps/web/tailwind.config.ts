import type { Config } from 'tailwindcss';

/**
 * Tailwind tokens — fuente de verdad visual para la web
 * Espejean exactamente los tokens del móvil (apps/mobile/src/theme/tokens.ts)
 * Colores nacen del logo: azul #1F6FE5 + verde #2DBE60
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // ── Fondos — T.appBg / T.cardBg / T.headerBg / T.inputBg ────────────
        'bg-base':        '#F4F9FD',   // T.appBg
        'bg-surface':     '#FFFFFF',   // T.cardBg
        'bg-elevated':    '#EAF4FC',   // T.headerBg
        'bg-input':       '#F2F7FC',   // T.inputBg

        // ── Bordes — T.strokeSoft / T.strokeBlue / T.strokeGreen ─────────────
        'border-subtle':  '#D5E8F5',   // T.strokeSoft
        'border-default': '#BDD8F0',   // T.strokeBlue
        'border-strong':  '#89C4E8',   // más fuerte

        // ── Texto — T.textPrimary / T.textSecondary / T.textMuted ────────────
        'text-primary':   '#0F172A',   // T.textPrimary
        'text-secondary': '#4A6070',   // T.textSecondary
        'text-tertiary':  '#7C8B98',   // T.textMuted

        // ── Brand principal — Azul del logo (T.blue / T.blueDeep) ────────────
        vozpe: {
          50:  '#EAF3FB',   // T.blueSoft — fondos suaves
          100: '#DBEEFF',   // T.blueLight
          200: '#BDD8F0',   // T.strokeBlue
          300: '#89C4E8',   // borde fuerte
          400: '#4A9FE0',   // intermedio
          500: '#1F6FE5',   // ★ T.blue — primario (botones, acentos)
          600: '#1557C8',   // T.blueDeep — hover / pressed
          700: '#1044A8',   // más profundo
        },

        // ── Verde complementario — T.green / T.greenDeep / T.greenSoft ───────
        brand: {
          green:  '#2DBE60',   // T.green
          deep:   '#1FA451',   // T.greenDeep
          soft:   '#EDF8F2',   // T.greenSoft
        },

        // ── Semánticos — T.success / T.warning / T.error ─────────────────────
        success: '#22A861',   // T.success
        warning: '#D97706',   // T.warning
        danger:  '#DC2626',   // T.error
        ai:      '#7C3AED',
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        'sm':   '8px',    // T.rSm
        'md':   '12px',   // T.rMd
        'lg':   '16px',
        'xl':   '18px',   // T.rCard
        '2xl':  '22px',   // T.rCardLg
        '3xl':  '28px',
        'full': '9999px', // T.rBtn / T.rChip
      },
      boxShadow: {
        // Sombras con T.blue (#1F6FE5) — igual que T.shadowCard / T.shadowBtn
        'card':  '0 2px 10px rgba(31,111,229,0.07), 0 1px 4px rgba(31,111,229,0.04)',   // T.shadowCard
        'btn':   '0 5px 14px rgba(31,111,229,0.26)',                                       // T.shadowBtn
        'fab':   '0 8px 20px rgba(31,111,229,0.36)',                                       // T.shadowFab
        'modal': '0 -4px 20px rgba(0,0,0,0.08)',                                           // T.shadowModal
        'xs':    '0 1px 4px rgba(31,111,229,0.05)',                                        // T.shadowXs
        'glow':  '0 0 40px rgba(31,111,229,0.14)',
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
