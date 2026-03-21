import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('cxnextDesktop', {
  platform: 'desktop',
  runtime: 'electron',
})
