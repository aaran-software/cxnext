import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname, '../..'), '')
  const frontendTarget = env.VITE_FRONTEND_TARGET || 'shop'

  return {
    root: path.resolve(import.meta.dirname),
    plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
    define: {
      __FRONTEND_TARGET__: JSON.stringify(frontendTarget),
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
        '@shared': path.resolve(import.meta.dirname, '../../packages/shared/src'),
        '@ui': path.resolve(import.meta.dirname, '../../packages/ui/src'),
      },
    },
    server: {
      port: 5173,
    },
  }
})
