import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  assetsInclude: ['**/*.md'],
  root: resolve(__dirname),
  publicDir: resolve(__dirname, '../public'),
  build: {
    outDir: resolve(__dirname, '../doc'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
