import { BrowserWindow, app } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function billingDesktopHtml() {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>CXNext Billing</title>
        <style>
          body {
            margin: 0;
            font-family: "Segoe UI", sans-serif;
            background: #f4efe6;
            color: #231f1a;
          }
          main {
            padding: 32px;
          }
          h1 {
            margin: 0 0 12px;
            font-size: 28px;
          }
          p {
            max-width: 720px;
            line-height: 1.5;
          }
          .panel {
            margin-top: 24px;
            padding: 20px;
            background: #fffaf2;
            border: 1px solid #d7ccb8;
            border-radius: 14px;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>CXNext Billing</h1>
          <p>
            Standalone desktop-first billing, accounts, and inventory product scaffold.
            This shell reserves the Electron boundary while accounting and inventory workflows are built in billing-owned packages.
          </p>
          <section class="panel">
            <strong>Status:</strong> Scaffold initialized.
          </section>
        </main>
      </body>
    </html>
  `
}

async function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1120,
    minHeight: 720,
    backgroundColor: '#f4efe6',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  await mainWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(billingDesktopHtml())}`)
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
