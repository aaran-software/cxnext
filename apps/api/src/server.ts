import 'dotenv/config'
import { createServer } from 'node:http'
import { routeRequest } from './app/http/router'
import { closeDatabasePool, ensureDatabaseSchema } from './shared/database/database'
import { environment } from './shared/config/environment'
import { ensureMediaStorage } from './shared/media/storage'

const server = createServer((request, response) => {
  void routeRequest(request, response)
})

let isShuttingDown = false
let shutdownTimer: NodeJS.Timeout | null = null

function closeServer() {
  if (!server.listening) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })
}

async function shutdown(signal: NodeJS.Signals | 'startup_error') {
  if (isShuttingDown) {
    return
  }

  isShuttingDown = true
  console.log(`Shutting down API (${signal})...`)

  shutdownTimer = setTimeout(() => {
    console.error('Forced shutdown after timeout.')
    process.exit(1)
  }, 10_000)

  try {
    await closeServer()
    await closeDatabasePool()
    console.log('API shutdown complete. Port released.')
    process.exit(0)
  } catch (error) {
    console.error('API shutdown failed.', error)
    process.exit(1)
  } finally {
    if (shutdownTimer) {
      clearTimeout(shutdownTimer)
      shutdownTimer = null
    }
  }
}

server.on('error', (error) => {
  if ('code' in error && error.code === 'EADDRINUSE') {
    console.error(`Port ${environment.port} is already in use. Stop the running API or free the port, then restart.`)
  } else {
    console.error('API server error.', error)
  }

  void shutdown('startup_error')
})

process.once('SIGINT', () => {
  void shutdown('SIGINT')
})

process.once('SIGTERM', () => {
  void shutdown('SIGTERM')
})

process.once('SIGUSR2', () => {
  void shutdown('SIGUSR2')
})

process.once('uncaughtException', (error) => {
  console.error('Uncaught exception.', error)
  void shutdown('startup_error')
})

process.once('unhandledRejection', (reason) => {
  console.error('Unhandled rejection.', reason)
  void shutdown('startup_error')
})

async function startServer() {
  await ensureMediaStorage()
  await ensureDatabaseSchema()

  await new Promise<void>((resolve) => {
    server.listen(environment.port, () => {
      console.log(`CXNext API listening on http://localhost:${environment.port}`)
      resolve()
    })
  })
}

void startServer().catch((error) => {
  console.error('Failed to start API.', error)
  void shutdown('startup_error')
})
