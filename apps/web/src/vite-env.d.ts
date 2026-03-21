/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FRONTEND_TARGET?: 'app' | 'web' | 'shop'
}

declare const __FRONTEND_TARGET__: string
