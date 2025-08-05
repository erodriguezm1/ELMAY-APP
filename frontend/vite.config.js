import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', //true, // Importante para Docker: el servidor escucha en todas las interfaces
    port: 3000, // Fuerza el puerto 3000
    hmr :{
      host: 'elmay.redinterna.local',
      protocol: 'ws',
    },
    allowedHosts: ['elmay.redinterna.local'],
  }
});
