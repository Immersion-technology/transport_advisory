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
    // Modern baseline — Chrome 100+ / Firefox 100+ / Safari 15+ / Edge 100+ ship
    // smaller bundles than es2020 (no async-iteration polyfills, native top-level
    // await, optional chaining at runtime, etc). Anything older than 2022 is
    // <0.5% of Nigerian mobile traffic.
    target: ['es2022', 'chrome100', 'edge100', 'firefox100', 'safari15'],
    sourcemap: false,
    cssCodeSplit: true,
    cssMinify: 'esbuild',
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    // Inline anything <=4KB so we save HTTP round-trips on small icons / SVGs.
    assetsInlineLimit: 4096,
    reportCompressedSize: false,
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
