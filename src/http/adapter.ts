import type { IncomingMessage, ServerResponse } from 'node:http'

export const toWebRequest = async (req: IncomingMessage): Promise<Request> => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
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
        const chunks: Buffer[] = []
        for await (const chunk of req) {
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
