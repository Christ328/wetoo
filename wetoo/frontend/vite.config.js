import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Le frontend appelle /api/* et Vite relaie vers le backend Express (port 4000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
