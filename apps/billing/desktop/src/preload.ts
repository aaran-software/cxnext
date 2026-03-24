import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('cxnextBillingDesktop', {
  product: 'billing',
  platform: 'desktop',
  runtime: 'electron',
  status: 'scaffold',
})
