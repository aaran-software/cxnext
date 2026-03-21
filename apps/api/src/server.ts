import 'dotenv/config'
import { createServer } from 'node:http'
import { environment } from './config/environment'
import { routeRequest } from './routes/router'

const server = createServer((request, response) => {
  void routeRequest(request, response)
})

server.listen(environment.port, () => {
  console.log(`CXNext API listening on http://localhost:${environment.port}`)
})
