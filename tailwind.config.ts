import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          DEFAULT: '#e11d48',
        },
        sports: {
          black: '#080809',
          card: '#121316',
          cardHover: '#1a1c22',
          cardLight: '#ffffff',
          border: '#242731',
          borderLight: '#e2e8f0',
          muted: '#8e95a5',
          gold: '#f59e0b',
          green: '#10b981',
        }
      },
      fontFamily: {
        bengali: ['var(--font-bengali)', 'Hind Siliguri', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        headline: ['var(--font-headline)', 'Oswald', 'Impact', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker': 'ticker 35s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
export default config
