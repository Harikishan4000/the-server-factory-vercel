import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#71BC0A',
          50: '#f3fbe6',
          100: '#e3f5c5',
          200: '#c9eb8f',
          300: '#a9db54',
          400: '#8cc928',
          500: '#71BC0A',
          600: '#5a9608',
          700: '#45700b',
          800: '#38590e',
          900: '#304b10',
        },
        ink: {
          DEFAULT: '#0B1220',
          soft: '#1f2937',
          muted: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'ui-sans-serif', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        brand: '0 10px 30px -10px rgba(113, 188, 10, 0.45)',
        soft: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
