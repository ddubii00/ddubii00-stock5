import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/stock5-7/',
  plugins: [react()],
  server: {
    proxy: {
      '/stock5-7/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/stock5-7/, ''),
      },
    }
  }
})
