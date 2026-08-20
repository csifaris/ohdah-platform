import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#071426',
        primary: '#062B78',
        gold: '#D4AF37',
        'primary-light': '#F1F5F9',
        surface: '#F8FAFC',
        ink: '#071426',
        muted: '#64748B',
        success: '#059669',
        warning: '#F59E0B',
        danger: '#DC2626',
        border: '#D9E2EC',
        'gold-tint': '#FFF7E6',
      },
      fontFamily: {
        sans: ['IBM Plex Sans Arabic', 'Noto Kufi Arabic', 'Cairo', 'Arial', 'sans-serif'],
        display: ['Noto Kufi Arabic', 'Cairo', 'Arial', 'sans-serif'],
        data: ['IBM Plex Sans Arabic', 'Noto Kufi Arabic', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(15, 23, 42, 0.08)',
        card: '0 8px 32px rgba(15, 23, 42, 0.10)',
        sidebar: '4px 0 24px rgba(15, 23, 42, 0.15)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
} satisfies Config;
