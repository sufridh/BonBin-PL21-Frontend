/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bonbin: {
          green: '#1a6b3a',
          gold: '#f0a500',
          dark: '#0d2b1a',
          light: '#e8f5ed',
        }
      },
      fontFamily: {
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
