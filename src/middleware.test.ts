import { middleware } from './middleware'
import { NextResponse } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock NextResponse methods
vi.mock('next/server', () => ({
    NextResponse: {
        next: vi.fn(() => 'NextResponse.next() called'),
        json: vi.fn((body: any, init?: any) => ({ body, ...init })),
    },
}))

describe('middleware', () => {
    const [AUTH_USER, AUTH_PASS] = (process.env.HTTP_BASIC_AUTH || 'admin:password').split(':')

    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('should return 401 for missing Authorization header', async () => {
        global.fetch = vi
            .fn()
            .mockResolvedValue(
                new Response(JSON.stringify({ message: 'Authentication required' }), {
                    status: 401,
                    headers: { 'WWW-Authenticate': 'Basic' },
                }),
            )

        middleware({ headers: {} } as any)

        expect(NextResponse.json).toHaveBeenCalledWith(
            { message: 'Authentication required' },
            {
                status: 401,
                headers: { 'WWW-Authenticate': 'Basic' },
            },
        )
    })

    it('should return 401 for invalid credentials', async () => {
        const invalidAuth = Buffer.from('invalid:credentials').toString('base64')
        global.fetch = vi
            .fn()
            .mockResolvedValue(
                new Response(JSON.stringify({ message: 'Authentication required' }), {
                    status: 401,
                    headers: { 'WWW-Authenticate': 'Basic' },
                }),
            )

        middleware({ headers: { Authorization: `Basic ${invalidAuth}` } } as any)

        expect(NextResponse.json).toHaveBeenCalledWith(
            { message: 'Authentication required' },
            {
                status: 401,
                headers: { 'WWW-Authenticate': 'Basic' },
            },
        )
    })

    it('should proceed with NextResponse.next() for valid credentials', async () => {
        const validAuth = Buffer.from(`${AUTH_USER}:${AUTH_PASS}`).toString('base64')
        global.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))

        middleware({ headers: { Authorization: `Basic ${validAuth}` } } as any)

        expect(NextResponse.next).toHaveBeenCalled()
    })
})
