import { createServer } from 'node:http'
import { routeRequest } from './routes/router'

const port = Number(process.env.PORT ?? 4000)

const server = createServer((request, response) => {
  routeRequest(request, response)
})

server.listen(port, () => {
  console.log(`CXNext API listening on http://localhost:${port}`)
})
