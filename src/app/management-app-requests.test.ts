import { describe, it, beforeEach, vi, expect } from 'vitest'
import { getPublicKeys, uploadResults } from './management-app-requests'

describe('getPublicKeys', () => {
    beforeEach(() => {
        process.env.MANAGEMENT_APP_API_URL = 'http://bma'
    })

    it('works', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ keys: [] }),
        })

        const res = await getPublicKeys('123')
        expect(global.fetch).toHaveBeenCalledWith('http://bma/api/job/123/keys', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: expect.any(String),
            },
        })
        expect(res).toEqual({ keys: [] })
    })

    it('errors if response is not ok', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
        })
        await expect(getPublicKeys('123')).rejects.toThrow('Failed to fetch public keys for job ID: 123')
    })
})

describe('uploadResults', () => {
    beforeEach(() => {
        process.env.MANAGEMENT_APP_API_URL = 'http://bma'
    })

    it('works', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
        })

        const res = await uploadResults('123', new Blob(), 'application/zip', 'result')
        expect(global.fetch).toHaveBeenCalledWith('http://bma/api/job/123/results', {
            method: 'POST',
            body: expect.any(FormData),
            headers: {
                Authorization: expect.any(String),
            },
        })
        expect(res.ok).toBe(true)
    })
})
