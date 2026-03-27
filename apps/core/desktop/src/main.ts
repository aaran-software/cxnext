import { BrowserWindow, app } from 'electron'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function readDesktopEnvironment() {
  const envFilePath = path.resolve(__dirname, '../../../.env')
  if (!existsSync(envFilePath)) {
    throw new Error(`Missing .env file at ${envFilePath}. Copy .env.example to .env before starting codexsun.`)
  }

  return dotenv.parse(readFileSync(envFilePath, 'utf8'))
}

function resolveRendererTarget() {
  const configuredUrl = readDesktopEnvironment().CXNEXT_WEB_URL?.trim()
  if (!configuredUrl) {
    throw new Error('CXNEXT_WEB_URL is required in .env before starting the desktop app.')
  }

  return configuredUrl
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

  const rendererTarget = resolveRendererTarget()

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
