import { middleware } from './middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
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

    const createMockRequest = (authHeader?: string): Partial<NextRequest> => ({
        headers: new Map<string, string | null>([['authorization', authHeader || null]]),
        get(key: string) {
            return this.headers.get(key.toLowerCase()) || null
        },
    })

    it('should return 401 for missing Authorization header', () => {
        const mockRequest = createMockRequest()
        middleware(mockRequest as NextRequest)

        expect(NextResponse.json).toHaveBeenCalledWith(
            { message: 'Authentication required' },
            {
                status: 401,
                headers: { 'WWW-Authenticate': 'Basic' },
            },
        )
    })

    it('should return 401 for invalid credentials', () => {
        const invalidAuth = Buffer.from('invalid:credentials').toString('base64')
        const mockRequest = createMockRequest(`Basic ${invalidAuth}`)
        middleware(mockRequest as NextRequest)

        expect(NextResponse.json).toHaveBeenCalledWith(
            { message: 'Authentication required' },
            {
                status: 401,
                headers: { 'WWW-Authenticate': 'Basic' },
            },
        )
    })

    it('should proceed with NextResponse.next() for valid credentials', () => {
        const validAuth = Buffer.from(`${AUTH_USER}:${AUTH_PASS}`).toString('base64')
        const mockRequest = createMockRequest(`Basic ${validAuth}`)
        middleware(mockRequest as NextRequest)

        expect(NextResponse.next).toHaveBeenCalled()
    })
})
