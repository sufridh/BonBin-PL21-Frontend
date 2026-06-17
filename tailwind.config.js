/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bonbin: {
          gold: '#e8b54a',
          dark: '#1c0408',
        },
        maroon: {
          950: '#1c0408',
          900: '#2b0a12',
          800: '#3d0f1a',
          700: '#5c1322',
          600: '#7a1b2e',
          500: '#9c2538',
          300: '#c97a8a',
        },
        gold: {
          400: '#e8b54a',
          300: '#f3cd76',
          200: '#f8e0a3',
        },
        cream: {
          100: '#f5ede1',
        },
      },
      fontFamily: {
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
      },
      backgroundImage: {
        'pitch-texture': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cg fill='none' stroke='%23e8b54a' stroke-width='1'%3E%3Ccircle cx='200' cy='200' r='70'/%3E%3Ccircle cx='200' cy='200' r='2' fill='%23e8b54a'/%3E%3Cline x1='0' y1='200' x2='400' y2='200'/%3E%3Crect x='0' y='130' width='40' height='140'/%3E%3Crect x='360' y='130' width='40' height='140'/%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
