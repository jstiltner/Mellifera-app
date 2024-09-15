import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { loadEnv } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react({
        babel: {
          plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]],
        },
      }),
      legacy({
        targets: ['defaults', 'not IE 11'],
        polyfills: ['es.promise', 'regenerator-runtime'],
      }),
      svgr(),
      viteCompression(),
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    base: '',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@tanstack/query-core': path.resolve(__dirname, 'node_modules/@tanstack/query-core'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('@tanstack/react-query')) return 'vendor-tanstack';
              if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
              if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'vendor-chart';
              if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-map';
              return 'vendor'; // all other third-party dependencies
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5050',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    define: {
      'process.env': env,
    },
    optimizeDeps: {
      exclude: ['aws-sdk'],
      include: [
        '@tanstack/react-query',
        'react-router-dom',
        'chart.js',
        'react-chartjs-2',
        'leaflet',
        'react-leaflet',
        'localforage',
        'axios',
        'regenerator-runtime',
        'react-speech-recognition',
      ],
    },
    css: {
      postcss: {
        plugins: [require('tailwindcss'), require('autoprefixer')],
      },
    },
    esbuild: {
      jsxInject: `import React from 'react'`,
    },
  };
});
