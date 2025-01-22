import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Папка, куда будет собираться проект
  },
  server: {
    port: 3000, // Порт для разработки
  },
});