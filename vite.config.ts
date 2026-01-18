import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    server: {
      port: 5173, // Port par défaut de Vite
      host: '0.0.0.0',
    },
    plugins: [react()],
    // Vite gère automatiquement les variables VITE_* depuis .env.local
    // Pas besoin de les définir manuellement
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
