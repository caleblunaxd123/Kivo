import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // ── Fondos — coinciden exactamente con T.appBg / T.cardBg del móvil ──
        'bg-base':        '#F4F9FD',   // T.appBg
        'bg-surface':     '#FFFFFF',   // T.cardBg
        'bg-elevated':    '#EAF3FB',   // T.softBlueBg / T.blueSoft
        'bg-input':       '#F2F7FC',   // T.inputBg
        // ── Bordes — coinciden con tokens del móvil ──────────────────────────
        'border-subtle':  '#D5E8F5',   // T.strokeSoft
        'border-default': '#BDD8F0',   // T.strokeBlue
        'border-strong':  '#93BAE0',
        // ── Texto — coinciden con T.textPrimary / Secondary / Muted ─────────
        'text-primary':   '#0F172A',   // T.textPrimary
        'text-secondary': '#4A6070',   // T.textSecondary
        'text-tertiary':  '#7C8B98',   // T.textMuted
        // ── Brand — azul Vozpe (mismo que T.blue en el móvil) ───────────────
        vozpe: {
          50:  '#EAF3FB',   // T.softBlueBg
          100: '#DBEEFF',   // T.blueLight
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#1F6FE5',   // T.blue  — primario (botones, acentos)
          600: '#1557C8',   // T.blueDeep — hover / pressed
          700: '#1043A0',
        },
        // ── Verde complementario (T.green del móvil) ────────────────────────
        brand: {
          green:  '#2DBE60',   // T.green
          deep:   '#1FA451',   // T.greenDeep
          soft:   '#EDF8F2',   // T.softMintBg
        },
        // ── Semánticos ───────────────────────────────────────────────────────
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
        'sm':  '8px',
        'md':  '12px',
        'lg':  '16px',
        'xl':  '18px',
        '2xl': '22px',
        '3xl': '28px',
        'full': '9999px',
      },
      boxShadow: {
        // Sombras coinciden con T.shadowCard y T.shadowBtn del móvil
        'card':  '0 2px 10px rgba(31,111,229,0.07), 0 1px 4px rgba(31,111,229,0.04)',
        'btn':   '0 5px 14px rgba(31,111,229,0.28)',
        'fab':   '0 8px 20px rgba(31,111,229,0.36)',
        'modal': '0 -4px 20px rgba(0,0,0,0.08)',
        'xs':    '0 1px 4px rgba(31,111,229,0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
