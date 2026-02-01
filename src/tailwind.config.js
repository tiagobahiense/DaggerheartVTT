/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          // Agora você pode usar className="font-rpg" para títulos
          rpg: ['Cinzel', 'serif'], 
          // E className="font-body" para textos longos
          body: ['Merriweather', 'serif'],
        },
        colors: {
          // Paleta "Dungeon"
          dungeon: {
            dark: '#0f1115',  // Fundo principal
            stone: '#1e293b', // Painéis secundários
            light: '#94a3b8', // Texto desabilitado
          },
          // Paleta "Pergaminho/Ouro"
          parchment: {
            DEFAULT: '#f4e4bc', // Fundo de cartas/fichas
            dark: '#d6c096',    // Bordas do pergaminho
          },
          gold: {
            DEFAULT: '#d4af37', // Dourado clássico
            light: '#f3e5ab',   // Brilho
            dim: '#8a6d3b',     // Sombra do ouro
          },
          danger: '#8b0000',    // Vermelho sangue para dano/HP
        },
        backgroundImage: {
          // Gradiente sutil para botões dourados
          'gold-gradient': 'linear-gradient(to bottom, #f3e5ab, #d4af37, #8a6d3b)',
        }
      },
    },
    plugins: [],
  }/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Agora você pode usar className="font-rpg" para títulos
        rpg: ['Cinzel', 'serif'], 
        // E className="font-body" para textos longos
        body: ['Merriweather', 'serif'],
      },
      colors: {
        // Paleta "Dungeon"
        dungeon: {
          dark: '#0f1115',  // Fundo principal
          stone: '#1e293b', // Painéis secundários
          light: '#94a3b8', // Texto desabilitado
        },
        // Paleta "Pergaminho/Ouro"
        parchment: {
          DEFAULT: '#f4e4bc', // Fundo de cartas/fichas
          dark: '#d6c096',    // Bordas do pergaminho
        },
        gold: {
          DEFAULT: '#d4af37', // Dourado clássico
          light: '#f3e5ab',   // Brilho
          dim: '#8a6d3b',     // Sombra do ouro
        },
        danger: '#8b0000',    // Vermelho sangue para dano/HP
      },
      backgroundImage: {
        // Gradiente sutil para botões dourados
        'gold-gradient': 'linear-gradient(to bottom, #f3e5ab, #d4af37, #8a6d3b)',
      }
    },
  },
  plugins: [],
}