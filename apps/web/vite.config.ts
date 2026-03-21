import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'node:path'

export default defineConfig({
  root: path.resolve(import.meta.dirname),
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    alias: {
      '@shared': path.resolve(import.meta.dirname, '../../packages/shared/src'),
      '@ui': path.resolve(import.meta.dirname, '../../packages/ui/src'),
    },
  },
  server: {
    port: 5173,
  },
})
