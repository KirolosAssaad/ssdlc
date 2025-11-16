/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kahf-primary': '#39231f',    // Dark brown
        'kahf-secondary': '#964722',  // Medium brown
        'kahf-accent': '#f3ebde',     // Light cream
        primary: {
          50: '#faf8f6',
          100: '#f3ebde',
          200: '#e6d4c2',
          300: '#d4b89a',
          400: '#c19970',
          500: '#b17d4f',
          600: '#964722',
          700: '#7d3a1c',
          800: '#66301a',
          900: '#39231f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}