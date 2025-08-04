import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Importante para Docker: el servidor escucha en todas las interfaces
    port: 3000, // Fuerza el puerto 3000
    allowedHosts: ['elmay.redinterna.local'],
  }
})
