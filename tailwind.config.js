/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <--- ISSO É ESSENCIAL
  ],
  theme: {
    extend: {
      fontFamily: {
        rpg: ['Cinzel', 'serif'],
        body: ['Merriweather', 'serif'],
      },
      colors: {
        'dungeon-dark': '#0f1115',
        'dungeon-stone': '#1e293b',
        'gold': '#d4af37',
        'gold-dim': '#8a701e',
        'parchment': '#f4e4bc',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}