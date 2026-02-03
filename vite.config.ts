import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Garanta que isso é uma barra simples, ou remova a linha.
  build: {
    outDir: 'dist',
  }
})
