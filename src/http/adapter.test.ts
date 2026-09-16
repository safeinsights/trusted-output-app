import { describe, it, expect } from 'vitest'
import { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { toWebRequest, sendWebResponse, MAX_UPLOAD_BYTES, PayloadTooLargeError } from './adapter'

const fakeReq = (opts: {
    method: string
    url: string
    headers: Record<string, string | string[] | undefined>
    body?: string
    chunks?: string[]
}): IncomingMessage => {
    const chunks = opts.chunks ?? (opts.body ? [opts.body] : [])
    const stream = Readable.from(chunks.map((chunk) => Buffer.from(chunk)))
    return Object.assign(stream, {
        method: opts.method,
        url: opts.url,
        headers: opts.headers,
    }) as unknown as IncomingMessage
}

describe('toWebRequest', () => {
    it('maps method/url/headers (string, array, undefined) and buffers the body', async () => {
        const req = fakeReq({
            method: 'POST',
            url: '/api/job/abc/logs',
            headers: {
                host: 'localhost',
                'content-type': 'text/plain',
                'set-cookie': ['a=1', 'b=2'],
                'x-skip': undefined,
            },
            body: 'hello',
        })
        const webReq = await toWebRequest(req)

        expect(webReq.method).toBe('POST')
        expect(new URL(webReq.url).pathname).toBe('/api/job/abc/logs')
        expect(webReq.headers.get('content-type')).toBe('text/plain')
        expect(await webReq.text()).toBe('hello')
    })

    it('omits the body for GET requests', async () => {
        const req = fakeReq({ method: 'GET', url: '/api/health', headers: { host: 'localhost' } })
        const webReq = await toWebRequest(req)

        expect(webReq.method).toBe('GET')
        expect(webReq.body).toBeNull()
    })
})

describe('toWebRequest body limits', () => {
    it('rejects a declared Content-Length over the limit without reading the body', async () => {
        const req = fakeReq({
            method: 'POST',
            url: '/api/job/abc/upload',
            headers: { host: 'localhost', 'content-length': String(MAX_UPLOAD_BYTES + 1) },
            body: 'a token amount, since the declared length is what gets rejected',
        })

        await expect(toWebRequest(req)).rejects.toThrow(`Request body exceeds the ${MAX_UPLOAD_BYTES} byte limit`)
        expect(req.readableDidRead).toBe(false)
    })

    it('rejects a chunked body that exceeds the limit while reading', async () => {
        const req = fakeReq({
            method: 'POST',
            url: '/api/job/abc/upload',
            headers: { host: 'localhost', 'transfer-encoding': 'chunked' },
            chunks: ['12345', '67890', 'overflow'],
        })

        await expect(toWebRequest(req, undefined, 10)).rejects.toThrow(PayloadTooLargeError)
    })

    it('accepts a body at the limit', async () => {
        const req = fakeReq({
            method: 'POST',
            url: '/api/job/abc/upload',
            headers: { host: 'localhost', 'content-length': '10' },
            body: '0123456789',
        })

        expect(await (await toWebRequest(req, undefined, 10)).text()).toBe('0123456789')
    })
})

describe('sendWebResponse', () => {
    it('writes status, headers, and body to the ServerResponse', async () => {
        let status = 0
        let headers: Record<string, string> = {}
        let ended: Buffer | undefined
        const res = {
            writeHead: (s: number, h: Record<string, string>) => {
                status = s
                headers = h
            },
            end: (chunk: Buffer) => {
                ended = chunk
            },
        } as unknown as ServerResponse

        const response = new Response('{"ok":true}', {
            status: 201,
            headers: { 'content-type': 'application/json' },
        })
        await sendWebResponse(res, response)

        expect(status).toBe(201)
        expect(headers['content-type']).toBe('application/json')
        expect(ended?.toString()).toBe('{"ok":true}')
    })
})
