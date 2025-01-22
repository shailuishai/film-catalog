import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Указываем папку для сборки
  },
  // proxy: {
  //   '/api': {
  //     target: 'https://film-catalog-8re5.onrender.com/v1',
  //     changeOrigin: true,
  //     followRedirects: true,
  //   },
  // },
});