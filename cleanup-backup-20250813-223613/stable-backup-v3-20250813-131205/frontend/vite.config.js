import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true, // Allow network access
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'), // Keep /api prefix
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            maps: ['@react-google-maps/api'],
          },
        },
      },
    },
    // Environment variable prefix
    envPrefix: 'VITE_',
    // Define global constants
    define: {
      __DEV__: isDev,
    },
    // Set base URL for production builds
    base: '/',
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@react-google-maps/api'],
    },
  }
}) 