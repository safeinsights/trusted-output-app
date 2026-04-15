import { describe, it, beforeEach, vi, expect } from 'vitest'
import { getPublicKeys, uploadResults } from './management-app-requests'

describe('getPublicKeys', () => {
    beforeEach(() => {
        process.env.MANAGEMENT_APP_API_URL = 'https://bma'
    })

    it('works', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ keys: [] }),
        })

        const res = await getPublicKeys('123')
        expect(globalThis.fetch).toHaveBeenCalledWith('https://bma/api/job/123/keys', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: expect.any(String),
            },
        })
        expect(res).toEqual({ keys: [] })
    })

    it('errors if response is not ok', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
        })
        await expect(getPublicKeys('123')).rejects.toThrow('Failed to fetch public keys for job ID: 123')
    })
})

describe('uploadResults', () => {
    beforeEach(() => {
        process.env.MANAGEMENT_APP_API_URL = 'https://bma'
    })

    it('works with Blob', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
        })

        const res = await uploadResults('123', new Blob(), 'application/zip', 'result')
        expect(globalThis.fetch).toHaveBeenCalledWith('https://bma/api/job/123/results', {
            method: 'POST',
            body: expect.any(FormData),
            headers: {
                Authorization: expect.any(String),
            },
        })
        expect(res.ok).toBe(true)
    })

    it('works with Buffer', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
        })

        const res = await uploadResults('123', Buffer.from('test data'), 'application/zip', 'result')
        expect(globalThis.fetch).toHaveBeenCalledWith('https://bma/api/job/123/results', {
            method: 'POST',
            body: expect.any(FormData),
            headers: {
                Authorization: expect.any(String),
            },
        })
        expect(res.ok).toBe(true)
    })
})
