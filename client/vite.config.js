import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://film-catalog-8re5.onrender.com/v1', // Ваш бэкенд
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        followRedirects: true,
      },
    },
  },
});