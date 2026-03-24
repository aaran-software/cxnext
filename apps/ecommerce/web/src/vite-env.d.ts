/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FRONTEND_TARGET?: 'app' | 'web' | 'shop'
}

declare const __FRONTEND_TARGET__: string
declare const __APP_MODE__: string
declare const __APP_DEBUG__: boolean
declare const __APP_SKIP_SETUP_CHECK__: boolean
