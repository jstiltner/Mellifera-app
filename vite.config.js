import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tanstack/query-core': path.resolve(__dirname, 'node_modules/@tanstack/query-core'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.jsx'),
      name: 'Mellifera-App',
      fileName: (format) => `mellifera.${format}.js`
    },
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  define: {
    'process.env': process.env,
  },
  optimizeDeps: {
    exclude: ['aws-sdk'],
  },
});