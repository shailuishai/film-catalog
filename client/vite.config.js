import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/local.dev-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/local.dev.pem')),
    },
    host: 'local.dev',
    changeOrigin: true,
    followRedirects: true,
  },
  // proxy: {
  //   '/api': {
  //     target: 'https://film-catalog-8re5.onrender.com/v1',
  //     changeOrigin: true,
  //     followRedirects: true,
  //   },
  // },
});