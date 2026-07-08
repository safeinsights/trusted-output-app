import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { generateKeyPair, pemToJSONBuffer } from 'si-encryption/util'

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

    it('malformed JSON body returns 500 via the top-level catch', async () => {
        const res = await fetch(`${baseUrl}/api/job/${uuidv4()}`, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: 'this is not json',
        })
        expect(res.status).toBe(500)
        expect(await res.json()).toEqual({ error: 'Internal server error' })
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
