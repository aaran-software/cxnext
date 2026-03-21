import 'dotenv/config'
import { createServer } from 'node:http'
import { routeRequest } from './app/http/router'
import { ensureDatabaseSchema } from './shared/database/database'
import { environment } from './shared/config/environment'

const server = createServer((request, response) => {
  void routeRequest(request, response)
})

async function startServer() {
  await ensureDatabaseSchema()

  server.listen(environment.port, () => {
    console.log(`CXNext API listening on http://localhost:${environment.port}`)
  })
}

void startServer()
