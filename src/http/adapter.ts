import type { IncomingMessage, ServerResponse } from 'node:http'

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024

export class PayloadTooLargeError extends Error {
    constructor(limit: number) {
        super(`Request body exceeds the ${limit} byte limit`)
        this.name = 'PayloadTooLargeError'
    }
}

export const requestUrl = (req: IncomingMessage): URL =>
    new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)

export const toWebRequest = async (
    req: IncomingMessage,
    url: URL = requestUrl(req),
    maxBytes: number = MAX_UPLOAD_BYTES,
): Promise<Request> => {
    const method = req.method ?? 'GET'

    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
        if (value === undefined) continue
        if (Array.isArray(value)) {
            for (const item of value) headers.append(key, item)
        } else {
            headers.set(key, value)
        }
    }

    let body: Uint8Array<ArrayBuffer> | undefined
    if (method !== 'GET' && method !== 'HEAD') {
        const declared = Number(req.headers['content-length'])
        if (Number.isFinite(declared) && declared > maxBytes) {
            throw new PayloadTooLargeError(maxBytes)
        }

        const chunks: Buffer[] = []
        let received = 0
        // Counting as we read covers chunked bodies, which carry no Content-Length, and
        // bodies whose declared length understates what is actually sent.
        for await (const chunk of req) {
            received += (chunk as Buffer).byteLength
            if (received > maxBytes) {
                throw new PayloadTooLargeError(maxBytes)
            }
            chunks.push(chunk as Buffer)
        }
        if (chunks.length > 0) {
            const merged = Buffer.concat(chunks)
            body = new Uint8Array(merged.byteLength)
            body.set(merged)
        }
    }

    return new Request(url, { method, headers, body })
}

export const sendWebResponse = async (res: ServerResponse, response: Response): Promise<void> => {
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
        headers[key] = value
    })
    res.writeHead(response.status, headers)
    const buffer = Buffer.from(await response.arrayBuffer())
    res.end(buffer)
}
