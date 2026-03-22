import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // ── Fondos — coinciden exactamente con T.appBg / T.cardBg del móvil ──
        'bg-base':        '#F4FAFB',   // T.appBg
        'bg-surface':     '#FFFFFF',   // T.cardBg
        'bg-elevated':    '#ECFEFF',   // Elevado cyan
        'bg-input':       '#F4FAFB',   // T.inputBg
        // ── Bordes — coinciden con tokens del móvil ──────────────────────────
        'border-subtle':  '#E0F7FA',   // borderSubtle
        'border-default': '#BAE6FD',   // borderDefault
        'border-strong':  '#7DD3FC',   // borderStrong
        // ── Texto — coinciden con T.textPrimary / Secondary / Muted ─────────
        'text-primary':   '#0C1A2E',   // textPrimary
        'text-secondary': '#374E6B',   // textSecondary
        'text-tertiary':  '#6B8FA8',   // textMuted
        // ── Brand — azul Vozpe (mismo que T.blue en el móvil => vozpe500: #0891B2) ───────────────
        vozpe: {
          50:  '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#0891B2',   // vozpe500 — primario (botones, acentos)
          600: '#0E7490',   // hover / pressed
          700: '#155E75',
        },
        // ── Verde complementario (vozpeGreen del móvil => #65A30D) ────────────────────────
        brand: {
          green:  '#65A30D',   // vozpeGreen
          deep:   '#4D7C0F',   
          soft:   '#F7FEE7',   // vozpeGreenLight
        },
        // ── Semánticos ───────────────────────────────────────────────────────
        success: '#059669',   // success
        warning: '#D97706',   // warning
        danger:  '#DC2626',   // error
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
