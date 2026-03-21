import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-base':        '#0A0A0F',
        'bg-surface':     '#111118',
        'bg-elevated':    '#1A1A26',
        'bg-input':       '#1E1E2E',
        'bg-hover':       '#252538',
        'bg-selected':    '#2A2A45',
        'border-subtle':  '#1E1E2E',
        'border-default': '#2A2A45',
        'border-strong':  '#3A3A5C',
        'text-primary':   '#F0F0FF',
        'text-secondary': '#9090B8',
        'text-tertiary':  '#5A5A80',
        vozpe: {
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        success: '#22C55E',
        warning: '#F97316',
        danger:  '#EF4444',
        ai:      '#A78BFA',
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
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'count-up': 'count-up 0.6s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(99,102,241,0.3)' },
          '50%':       { boxShadow: '0 0 24px rgba(99,102,241,0.6)' },
        },
        'slide-up': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to:   { transform: 'translateY(0)',   opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      backdropBlur: {
        'xs': '4px',
      },
    },
  },
  plugins: [],
};

export default config;
