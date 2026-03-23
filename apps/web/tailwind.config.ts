import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // ── Fondos ───────────────────────────────────────────────────────────
        'bg-base':        '#F4F6FB',   // app background (CLAUDE.md)
        'bg-surface':     '#FFFFFF',   // cards / surfaces
        'bg-elevated':    '#EEF2FF',   // light indigo elevated
        'bg-input':       '#F4F6FB',   // input fields
        // ── Bordes ───────────────────────────────────────────────────────────
        'border-subtle':  '#E0E7FF',   // indigo-100
        'border-default': '#C7D2FE',   // indigo-200
        'border-strong':  '#A5B4FC',   // indigo-300
        // ── Texto ─────────────────────────────────────────────────────────
        'text-primary':   '#0C1A2E',
        'text-secondary': '#374E6B',
        'text-tertiary':  '#6B8FA8',
        // ── Brand — Indigo Vozpe (CLAUDE.md: #6366F1) ────────────────────
        vozpe: {
          50:  '#EEF2FF',   // indigo-50
          100: '#E0E7FF',   // indigo-100
          200: '#C7D2FE',   // indigo-200
          300: '#A5B4FC',   // indigo-300
          400: '#818CF8',   // indigo-400
          500: '#6366F1',   // ★ vozpe primary (CLAUDE.md)
          600: '#4F46E5',   // hover / pressed
          700: '#4338CA',   // deep
        },
        // ── Verde complementario ──────────────────────────────────────────
        brand: {
          green:  '#22C55E',
          deep:   '#16A34A',
          soft:   '#F0FDF4',
        },
        // ── Semánticos ────────────────────────────────────────────────────
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
        'sm':  '8px',
        'md':  '12px',
        'lg':  '16px',
        'xl':  '18px',
        '2xl': '22px',
        '3xl': '28px',
        'full': '9999px',
      },
      boxShadow: {
        'card':  '0 2px 10px rgba(99,102,241,0.07), 0 1px 4px rgba(99,102,241,0.04)',
        'btn':   '0 5px 14px rgba(99,102,241,0.28)',
        'fab':   '0 8px 20px rgba(99,102,241,0.36)',
        'modal': '0 -4px 20px rgba(0,0,0,0.08)',
        'xs':    '0 1px 4px rgba(99,102,241,0.05)',
        'glow':  '0 0 40px rgba(99,102,241,0.15)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
