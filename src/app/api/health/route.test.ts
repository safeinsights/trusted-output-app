import { GET } from './route'
import { describe, it, expect } from 'vitest'

describe('Healthcheck Endpoint', () => {
    it('should return the correct healthcheck response', async () => {
        const response = await GET()
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toEqual({
            success: true,
            message: { status: 'ok' },
        })
    })
})
