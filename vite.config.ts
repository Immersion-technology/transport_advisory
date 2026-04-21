import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor code into cacheable chunks. First load pulls only what's
        // needed; subsequent navigations reuse vendor bundles from cache.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query': ['@tanstack/react-query', 'axios'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'animation': ['framer-motion'],
          'icons': ['lucide-react'],
          'utils': ['date-fns', 'react-hot-toast', 'react-dropzone'],
        },
      },
    },
  },
})
