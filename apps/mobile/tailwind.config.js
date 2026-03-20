/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Kivo Design System
        'bg-base':     '#0A0A0F',
        'bg-surface':  '#111118',
        'bg-elevated': '#1A1A26',
        'bg-input':    '#1E1E2E',
        'bg-hover':    '#252538',
        'bg-selected': '#2A2A45',
        'border-subtle':  '#1E1E2E',
        'border-default': '#2A2A45',
        'border-strong':  '#3A3A5C',
        'text-primary':   '#F0F0FF',
        'text-secondary': '#9090B8',
        'text-tertiary':  '#5A5A80',
        kivo: {
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
        sans:  ['Inter', 'System'],
        mono:  ['JetBrainsMono', 'Courier New'],
      },
    },
  },
  plugins: [],
};
