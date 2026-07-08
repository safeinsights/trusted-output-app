import { health } from './health'
import { describe, it, expect } from 'vitest'

describe('Healthcheck Endpoint', () => {
    it('should return the correct healthcheck response', async () => {
        const response = await health(new Request('http://localhost/api/health'), {})
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toEqual({
            success: true,
            message: { status: 'ok' },
        })
    })
})
