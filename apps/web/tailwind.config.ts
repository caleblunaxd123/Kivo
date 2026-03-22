import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // ── Fondos — light, tinte cyan muy suave (igual que la app móvil) ──
        'bg-base':        '#F4FAFB',
        'bg-surface':     '#FFFFFF',
        'bg-elevated':    '#ECFEFF',
        'bg-input':       '#F4FAFB',
        'bg-hover':       '#CFFAFE',
        // ── Bordes ──────────────────────────────────────────────────────────
        'border-subtle':  '#E0F7FA',
        'border-default': '#BAE6FD',
        'border-strong':  '#7DD3FC',
        // ── Texto ───────────────────────────────────────────────────────────
        'text-primary':   '#0C1A2E',
        'text-secondary': '#374E6B',
        'text-tertiary':  '#6B8FA8',
        // ── Brand — Vozpe Teal (igual que COLORS del paquete shared) ────────
        vozpe: {
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#0891B2',   // primario — botones, acentos
          600: '#0E7490',   // hover
          700: '#155E75',
        },
        // ── Navy (color de "Voz" en el logo) ────────────────────────────────
        navy: {
          DEFAULT: '#1E3A8A',
          light:   '#EFF6FF',
        },
        // ── Green (color de "PE" en el logo) ────────────────────────────────
        brand: {
          green:  '#65A30D',
          bright: '#84CC16',
        },
        // ── Semantic ─────────────────────────────────────────────────────────
        success: '#059669',
        warning: '#D97706',
        danger:  '#DC2626',
        ai:      '#7C3AED',
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        'sm':  '4px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'card': '0 1px 4px rgba(8,145,178,0.06), 0 2px 12px rgba(8,145,178,0.04)',
        'btn':  '0 4px 12px rgba(8,145,178,0.30)',
      },
    },
  },
  plugins: [],
};

export default config;
