import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'apps/ecommerce/web/src'),
      '@shared': path.resolve(import.meta.dirname, 'apps/core/shared/src'),
      '@ui': path.resolve(import.meta.dirname, 'apps/ui/src'),
    },
  },
})
