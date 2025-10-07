import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Importante para Docker: el servidor escucha en todas las interfaces
    port: 3000,     // Fuerza el puerto 3000
    hmr :{
      // ?? CORRECCI�N CLAVE 1: Eliminamos el host interno hardcodeado ('elmay.redinterna.local').
      // Esto permite que el navegador use la IP o dominio que us� para cargar la p�gina.
      // host: 'elmay.redinterna.local', <--- ELIMINADO
      
      protocol: 'ws', 
      
      // CR�TICO 2: Establecemos el clientPort a 80 (el puerto p�blico de NGINX)
      // Esto asegura que el HMR sepa que debe conectarse al puerto por defecto del proxy.
      clientPort: 80, 
    },
    // CR�TICO 3: Eliminamos allowedHosts, ya que no son necesarios y pueden crear problemas de red.
    // allowedHosts: ['elmay.redinterna.local'], <--- ELIMINADO
  }
});