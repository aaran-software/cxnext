import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'apps/web/src'),
      '@shared': path.resolve(import.meta.dirname, 'packages/shared/src'),
      '@ui': path.resolve(import.meta.dirname, 'packages/ui/src'),
    },
  },
})
