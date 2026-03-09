import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — beauty tech dark
        void: '#080910',
        surface: '#0F1022',
        panel: '#161829',
        border: '#252742',
        // Accent
        blush: {
          DEFAULT: '#E8809A',
          light: '#F4B8C8',
          dark: '#C4607A',
        },
        rose: {
          muted: '#C4828E',
        },
        gold: {
          DEFAULT: '#D4AF8C',
          light: '#EDD5B4',
          dark: '#B08860',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['Space Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand':
          'linear-gradient(135deg, #E8809A 0%, #D4AF8C 100%)',
        'gradient-dark':
          'linear-gradient(180deg, #0F1022 0%, #080910 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        glow: '0 0 24px rgba(232, 128, 154, 0.25)',
        'glow-gold': '0 0 24px rgba(212, 175, 140, 0.25)',
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
