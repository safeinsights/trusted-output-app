import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { v4 as uuidv4 } from 'uuid'
import { handleRequest } from './server'

// Drive handleRequest with a fake IncomingMessage/ServerResponse pair and capture the response.
const call = async (method: string, url: string, body?: string) => {
    const req = Readable.from(body !== undefined ? [Buffer.from(body)] : []) as unknown as IncomingMessage
    req.headers = { host: 'localhost' }
    req.method = method
    req.url = url

    const captured = { statusCode: 0, headers: {} as Record<string, string>, body: '' }
    const res = {
        setHeader(key: string, value: string) {
            captured.headers[key] = value
        },
        end(chunk?: Buffer) {
            captured.body = chunk ? chunk.toString() : ''
        },
        set statusCode(code: number) {
            captured.statusCode = code
        },
    } as unknown as ServerResponse

    await handleRequest(req, res)
    return captured
}

describe('server router', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('routes GET /api/health to the health handler', async () => {
        const res = await call('GET', '/api/health')
        expect(res.statusCode).toBe(200)
        expect(JSON.parse(res.body)).toEqual({ success: true, message: { status: 'ok' } })
    })

    it('ignores the query string when matching', async () => {
        const res = await call('GET', '/api/health?foo=bar')
        expect(res.statusCode).toBe(200)
    })

    it('returns 404 for an unknown path', async () => {
        const res = await call('GET', '/api/nope')
        expect(res.statusCode).toBe(404)
        expect(JSON.parse(res.body)).toEqual({ error: 'Not found' })
    })

    it('returns 405 for a known path with the wrong method', async () => {
        const res = await call('DELETE', '/api/health')
        expect(res.statusCode).toBe(405)
        expect(JSON.parse(res.body)).toEqual({ error: 'Method not allowed' })
    })

    it('extracts the jobId param and dispatches with a streamed body', async () => {
        // Malformed body short-circuits in the handler before any upstream fetch.
        const res = await call('PUT', `/api/job/${uuidv4()}`, 'not json')
        expect(res.statusCode).toBe(400)
        expect(JSON.parse(res.body)).toEqual({ error: 'Malformed request data' })
    })

    it('returns 500 when a handler throws', async () => {
        // No MANAGEMENT_APP_API_URL + valid body makes the upload handler fetch reject.
        vi.stubGlobal(
            'fetch',
            vi.fn(() => Promise.reject(new Error('boom'))),
        )
        const form = '--b\r\nContent-Disposition: form-data; name="logs"\r\n\r\nhello\r\n--b--\r\n'
        const req = Readable.from([Buffer.from(form)]) as unknown as IncomingMessage
        req.headers = { host: 'localhost', 'content-type': 'multipart/form-data; boundary=b' }
        req.method = 'POST'
        req.url = `/api/job/${uuidv4()}/logs`

        const captured = { statusCode: 0, body: '' }
        const res = {
            setHeader() {},
            end(chunk?: Buffer) {
                captured.body = chunk ? chunk.toString() : ''
            },
            set statusCode(code: number) {
                captured.statusCode = code
            },
        } as unknown as ServerResponse

        await handleRequest(req, res)
        expect(captured.statusCode).toBe(500)
        expect(JSON.parse(captured.body)).toEqual({ error: 'Internal server error' })
    })
})
