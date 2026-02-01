/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rpg: ['Cinzel', 'serif'], 
        body: ['Merriweather', 'serif'],
      },
      colors: {
        dungeon: {
          dark: '#0f1115',
          stone: '#1e293b',
          light: '#94a3b8',
        },
        parchment: {
          DEFAULT: '#f4e4bc',
          dark: '#d6c096',
        },
        gold: {
          DEFAULT: '#d4af37',
          light: '#f3e5ab',
          dim: '#8a6d3b',
        },
        danger: '#8b0000',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(to bottom, #f3e5ab, #d4af37, #8a6d3b)',
      }
    },
  },
  plugins: [],
}