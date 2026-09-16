import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import http from 'node:http'
import { v4 as uuidv4 } from 'uuid'
import { generateKeyPair, pemToJSONBuffer } from 'si-encryption/util'
import { MAX_UPLOAD_BYTES } from '@/http/adapter'

import * as mgmt from '@/lib/management-app-requests'

vi.mock('@/lib/management-app-requests')

import { server } from '@/server'

describe('server (integration)', () => {
    let baseUrl: string

    beforeAll(async () => {
        await new Promise<void>((resolve) => server.listen(0, resolve))
        const address = server.address()
        const port = typeof address === 'object' && address ? address.port : 0
        baseUrl = `http://127.0.0.1:${port}`
    })

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())))
    })

    // Declares an oversized body without sending one, so nothing moves 100 MB over the socket.
    const postOversizedHeader = (path: string, declaredBytes: number) =>
        new Promise<{ status: number; body: string }>((resolve, reject) => {
            const req = http.request(
                `${baseUrl}${path}`,
                { method: 'POST', headers: { 'content-length': String(declaredBytes) } },
                (res) => {
                    let body = ''
                    res.on('data', (chunk) => (body += chunk))
                    res.on('end', () => {
                        req.destroy()
                        resolve({ status: res.statusCode ?? 0, body })
                    })
                },
            )
            req.on('error', reject)
            req.flushHeaders()
        })

    // Keeps uploading until the server answers, so body bytes are still in flight when the
    // 413 is written. Resolves once the server also closes the connection.
    const postStreamingBody = (path: string, declaredBytes?: number) =>
        new Promise<{ status: number; body: string; hungUp: boolean }>((resolve, reject) => {
            let streaming = true
            let responded = false
            const headers = declaredBytes ? { 'content-length': String(declaredBytes) } : {}
            const req = http.request(`${baseUrl}${path}`, { method: 'POST', headers }, (res) => {
                streaming = false
                responded = true
                let body = ''
                res.on('data', (chunk) => (body += chunk))
                res.on('end', () => {
                    const socket = res.socket
                    const settle = (hungUp: boolean) => {
                        clearTimeout(timer)
                        req.destroy()
                        resolve({ status: res.statusCode ?? 0, body, hungUp })
                    }
                    const timer = setTimeout(() => settle(false), 2000)
                    if (!socket || socket.destroyed) settle(true)
                    else socket.once('close', () => settle(true))
                })
            })
            // A write can fail once the server hangs up; that is fine as long as the 413 arrived.
            req.on('error', (err) => {
                if (!responded) reject(err)
            })
            const chunk = Buffer.alloc(1024 * 1024)
            const pump = () => {
                if (!streaming) return
                if (req.write(chunk)) setImmediate(pump)
                else req.once('drain', pump)
            }
            pump()
        })

    it('GET /api/health returns ok', async () => {
        const res = await fetch(`${baseUrl}/api/health`)
        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({ success: true, message: { status: 'ok' } })
    })

    it('unknown route returns 404', async () => {
        const res = await fetch(`${baseUrl}/api/nope`)
        expect(res.status).toBe(404)
        expect(await res.json()).toEqual({ error: 'Not found' })
    })

    it('malformed JSON body returns 400 rather than falling through to the top-level catch', async () => {
        const res = await fetch(`${baseUrl}/api/job/${uuidv4()}`, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: 'this is not json',
        })
        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({ error: 'Request body is not valid JSON' })
    })

    it('rejects an oversized body with 413', async () => {
        const res = await postOversizedHeader(`/api/job/${uuidv4()}/upload`, MAX_UPLOAD_BYTES + 1)

        expect(res.status).toBe(413)
        expect(JSON.parse(res.body).error).toMatch(new RegExp(`exceeds the ${MAX_UPLOAD_BYTES} byte limit`))
    })

    it('delivers the 413 to a client streaming an oversized body, then hangs up', async () => {
        const res = await postStreamingBody(`/api/job/${uuidv4()}/upload`)

        expect(res.status).toBe(413)
        expect(JSON.parse(res.body).error).toMatch(new RegExp(`exceeds the ${MAX_UPLOAD_BYTES} byte limit`))
        expect(res.hungUp).toBe(true)
    })

    it('delivers the 413 to a client uploading against an oversized Content-Length', async () => {
        const res = await postStreamingBody(`/api/job/${uuidv4()}/upload`, MAX_UPLOAD_BYTES + 1)

        expect(res.status).toBe(413)
        expect(JSON.parse(res.body).error).toMatch(new RegExp(`exceeds the ${MAX_UPLOAD_BYTES} byte limit`))
        expect(res.hungUp).toBe(true)
    })

    it('rejects an invalid jobId with 400 before the body is buffered', async () => {
        const res = await postOversizedHeader('/api/job/not-a-uuid/upload', MAX_UPLOAD_BYTES + 1)

        expect(res.status).toBe(400)
        expect(JSON.parse(res.body)).toEqual({ error: 'jobId is not a UUID' })
    })

    it('POST /api/job/:jobId/upload encrypts a real multipart file end-to-end', async () => {
        const keyPair = await generateKeyPair()
        vi.mocked(mgmt.getPublicKeys).mockResolvedValue({
            keys: [
                {
                    jobId: 'jobId',
                    fingerprint: keyPair.fingerprint,
                    publicKey: pemToJSONBuffer(keyPair.publicKeyString),
                },
            ],
        })
        vi.mocked(mgmt.uploadResults).mockResolvedValue({ ok: true } as Response)

        const form = new FormData()
        form.append('file', new File(['id,name\n1,John'], 'results.csv', { type: 'text/csv' }))

        const res = await fetch(`${baseUrl}/api/job/${uuidv4()}/upload`, { method: 'POST', body: form })

        expect(res.status).toBe(200)
        expect(mgmt.uploadResults).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Blob),
            'application/zip',
            'result',
        )
    })
})
