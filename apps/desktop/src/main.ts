import { BrowserWindow, app } from 'electron'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function resolveRendererTarget() {
  const configuredUrl = process.env.CXNEXT_WEB_URL

  if (configuredUrl) {
    return configuredUrl
  }

  return 'http://localhost:5173'
}

async function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: '#f6f2ea',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  const webDist = path.resolve(__dirname, '../../web/dist/index.html')
  const rendererTarget = resolveRendererTarget()

  if (!process.env.CXNEXT_WEB_URL && existsSync(webDist)) {
    await mainWindow.loadFile(webDist)
    return
  }

  await mainWindow.loadURL(rendererTarget)
}

void app.whenReady().then(async () => {
  await createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
