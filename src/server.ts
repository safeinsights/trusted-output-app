import http from 'node:http'
import { Router } from '@/http/router'
import { toWebRequest, sendWebResponse } from '@/http/adapter'
import { json } from '@/http/json'
import { log } from '@/lib/utils'
import { health } from '@/routes/health'
import { updateJobStatus } from '@/routes/job-status'
import { uploadLogs } from '@/routes/logs'
import { uploadResultFiles } from '@/routes/upload'

export const router = new Router()
router.register('GET', '/api/health', health)
router.register('PUT', '/api/job/:jobId', updateJobStatus)
router.register('POST', '/api/job/:jobId/logs', uploadLogs)
router.register('POST', '/api/job/:jobId/upload', uploadResultFiles)

export const server = http.createServer(async (req, res) => {
    try {
        const webReq = await toWebRequest(req)
        const { pathname } = new URL(webReq.url)
        const matched = router.match(req.method ?? 'GET', pathname)
        const response = matched ? await matched.handler(webReq, matched.params) : json({ error: 'Not found' }, 404)
        await sendWebResponse(res, response)
    } catch (error) {
        log('Unhandled error handling request', 'error', error as Error)
        res.writeHead(500, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ error: 'Internal server error' }))
    }
})

const PORT = Number(process.env.PORT ?? 3002)

if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => log(`Trusted Output App listening on port ${PORT}`))
}
