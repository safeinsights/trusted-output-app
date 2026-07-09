import { createServer } from 'node:http'
import { handleRequest } from '@/server'
import { log } from '@/utils'

const port = Number(process.env.PORT) || 3002

createServer((req, res) => {
    handleRequest(req, res)
}).listen(port, () => {
    log(`Trusted output app listening on port ${port}`)
})
