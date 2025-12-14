/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dostoevsky-paper': '#f4ecd8',
        'dostoevsky-ink': '#2c241b',
        'dostoevsky-accent': '#8b4513',
        'dostoevsky-dark': '#1a1a1a',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Lato"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
