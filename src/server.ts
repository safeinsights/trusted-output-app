import http from 'node:http'
import { Router } from '@/http/router'
import { toWebRequest, sendWebResponse, requestUrl, PayloadTooLargeError } from '@/http/adapter'
import { json } from '@/http/json'
import { isValidUUID, log } from '@/lib/utils'
import { health } from '@/routes/health'
import { updateJobStatus } from '@/routes/job-status'
import { uploadLogs } from '@/routes/logs'
import { uploadResultFiles } from '@/routes/upload'

const LINGER_MS = 1_000

export const router = new Router()
router.register('GET', '/api/health', health)
router.register('PUT', '/api/job/:jobId', updateJobStatus)
router.register('POST', '/api/job/:jobId/logs', uploadLogs)
router.register('POST', '/api/job/:jobId/upload', uploadResultFiles)

export const server = http.createServer(async (req, res) => {
    try {
        const url = requestUrl(req)
        const matched = router.match(req.method ?? 'GET', url.pathname)

        if (!matched) {
            await sendWebResponse(res, json({ error: 'Not found' }, 404))
            return
        }

        // Routed before the body is buffered so an invalid job id costs no memory. Handlers
        // repeat the check because they are also called directly.
        if ('jobId' in matched.params && !isValidUUID(matched.params.jobId)) {
            await sendWebResponse(res, json({ error: 'jobId is not a UUID' }, 400))
            return
        }

        const webReq = await toWebRequest(req, url)
        await sendWebResponse(res, await matched.handler(webReq, matched.params))
    } catch (error) {
        if (error instanceof PayloadTooLargeError) {
            log(error.message, 'error')
            // Closing on a client that is still uploading resets the connection, and the RST
            // discards the 413 before it is read. Drain what is in flight instead, then close.
            const socket = res.socket
            res.on('finish', () => {
                if (!socket) return
                socket.resume()
                socket.end()
                setTimeout(() => socket.destroy(), LINGER_MS).unref()
            })
            await sendWebResponse(res, json({ error: error.message }, 413))
            return
        }
        log('Unhandled error handling request', 'error', error as Error)
        res.writeHead(500, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ error: 'Internal server error' }))
    }
})

const PORT = Number(process.env.PORT ?? 3002)

if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => log(`Trusted Output App listening on port ${PORT}`))
}
