/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        display: ['"Cinzel"', 'serif'],
      },
      colors: {
        dostoevsky: {
          paper: '#f4e4bc',
          ink: '#2c241b',
          blood: '#8a0b0b',
          gloom: '#1a1a1a',
          accent: '#5c4d3c',
        }
      }
    },
  },
  plugins: [],
}
