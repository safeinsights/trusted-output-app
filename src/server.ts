import type { IncomingMessage, ServerResponse } from 'node:http'
import { Readable } from 'node:stream'
import { log } from '@/utils'
import { health } from '@/handlers/health'
import { updateJobStatus } from '@/handlers/job-status'
import { uploadResults } from '@/handlers/upload'
import { uploadLogs } from '@/handlers/logs'

export type Handler = (req: Request, params: { jobId: string }) => Promise<Response>

type Route = { method: string; pattern: RegExp; handler: Handler }

// Compile a path template like `/api/job/:jobId/upload` into a regex that captures named params.
const route = (method: string, template: string, handler: Handler): Route => {
    const pattern = new RegExp('^' + template.replace(/:([A-Za-z]+)/g, '(?<$1>[^/]+)') + '/?$')
    return { method, pattern, handler }
}

// Most-specific paths first so `/upload` and `/logs` win over the bare `/api/job/:jobId`.
const routes: Route[] = [
    route('GET', '/api/health', health),
    route('POST', '/api/job/:jobId/upload', uploadResults),
    route('POST', '/api/job/:jobId/logs', uploadLogs),
    route('PUT', '/api/job/:jobId', updateJobStatus),
]

const toWebRequest = (req: IncomingMessage): Request => {
    const url = `http://${req.headers.host ?? 'localhost'}${req.url ?? '/'}`
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
    return new Request(url, {
        method: req.method,
        headers: req.headers as HeadersInit,
        body: hasBody ? (Readable.toWeb(req) as ReadableStream) : undefined,
        // Required by Node/undici when streaming a request body.
        duplex: 'half',
    } as RequestInit)
}

const sendWebResponse = async (res: ServerResponse, webRes: Response): Promise<void> => {
    res.statusCode = webRes.status
    webRes.headers.forEach((value, key) => res.setHeader(key, value))
    const body = Buffer.from(await webRes.arrayBuffer())
    res.end(body)
}

export const handleRequest = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const path = (req.url ?? '/').split('?')[0]
    const pathMatches = routes.filter((r) => r.pattern.test(path))

    if (pathMatches.length === 0) {
        await sendWebResponse(res, Response.json({ error: 'Not found' }, { status: 404 }))
        return
    }

    const matched = pathMatches.find((r) => r.method === req.method)
    if (!matched) {
        await sendWebResponse(res, Response.json({ error: 'Method not allowed' }, { status: 405 }))
        return
    }

    const params = matched.pattern.exec(path)!.groups ?? {}

    try {
        const webRes = await matched.handler(toWebRequest(req), { jobId: params.jobId })
        await sendWebResponse(res, webRes)
    } catch (error) {
        log('Unhandled error while processing request', 'error', error as Error)
        await sendWebResponse(res, Response.json({ error: 'Internal server error' }, { status: 500 }))
    }
}
