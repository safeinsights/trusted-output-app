import { describe, it, expect } from 'vitest'
import { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { toWebRequest, sendWebResponse } from './adapter'

const fakeReq = (opts: {
    method: string
    url: string
    headers: Record<string, string | string[] | undefined>
    body?: string
}): IncomingMessage => {
    const stream = Readable.from(opts.body ? [Buffer.from(opts.body)] : [])
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
