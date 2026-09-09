/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#0b2e1b',
          950: '#051b10',
        },
        surface: {
          light: '#f8faf8',
          card: '#ffffff',
          dark: '#0a1912',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(11, 40, 24, 0.06)',
        'premium': '0 10px 30px -4px rgba(11, 40, 24, 0.1)',
        'glow': '0 0 25px -5px rgba(34, 197, 94, 0.25)',
      },
    },
  },
  plugins: [],
};
