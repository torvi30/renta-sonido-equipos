/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dj: {
          bg: '#0a0d14',
          card: '#111622',
          surface: '#181f2f',
          border: '#232c42',
          accent: '#f59e0b',
          accentHover: '#d97706',
          neon: '#06b6d4',
          electric: '#8b5cf6',
          success: '#10b981',
          danger: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
