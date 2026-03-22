import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname, '../..'), '')
  const frontendTarget = env.APP_MODE || env.VITE_FRONTEND_TARGET || 'shop'
  const appDebug = ['1', 'true', 'yes', 'on'].includes(String(env.APP_DEBUG ?? '').trim().toLowerCase())
  const appSkipSetupCheck = ['1', 'true', 'yes', 'on'].includes(
    String(env.APP_SKIP_SETUP_CHECK ?? '').trim().toLowerCase(),
  )

  return {
    root: path.resolve(import.meta.dirname),
    plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
    define: {
      __FRONTEND_TARGET__: JSON.stringify(frontendTarget),
      __APP_MODE__: JSON.stringify(frontendTarget),
      __APP_DEBUG__: JSON.stringify(appDebug),
      __APP_SKIP_SETUP_CHECK__: JSON.stringify(appSkipSetupCheck),
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
