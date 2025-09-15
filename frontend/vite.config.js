import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/public': 'http://localhost:8080',
      '/client': 'http://localhost:8080',
      '/provider': 'http://localhost:8080',
      '/admin': 'http://localhost:8080',
      '/api': 'http://localhost:8080', // si mantuviste algo con /api
    },
  },
})
