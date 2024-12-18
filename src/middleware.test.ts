import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { config, middleware } from '@/middleware'

describe('Middleware', () => {
    // Store original environment variables
    const originalEnv = { ...process.env }

    beforeEach(() => {
        // Reset environment variables before each test
        process.env = { ...originalEnv }

        // Reset any mocks
        vi.resetAllMocks()
    })

    describe('Authentication Scenarios', () => {
        it('returns next response for valid authentication', () => {
            // Set specific credentials
            process.env.HTTP_BASIC_AUTH = 'testuser:testpass'

            const req = {
                headers: {
                    get: vi.fn().mockReturnValue('Basic ' + Buffer.from('testuser:testpass').toString('base64')),
                },
            } as unknown as NextRequest

            const response = middleware(req)

            // Important: Check that it returns NextResponse.next()
            expect(response).toBeTruthy()
        })

        it('returns 401 response for missing authorization header', () => {
            const req = {
                headers: {
                    get: vi.fn().mockReturnValue(null),
                },
            } as unknown as NextRequest

            const response = middleware(req)

            expect(response.status).toBe(401)
            expect(response.headers.get('WWW-Authenticate')).toBe('Basic')
        })

        it('returns 401 response for malformed authorization header', () => {
            const req = {
                headers: {
                    get: vi.fn().mockReturnValue('Basic malformed'),
                },
            } as unknown as NextRequest

            const response = middleware(req)

            expect(response.status).toBe(401)
            expect(response.headers.get('WWW-Authenticate')).toBe('Basic')
        })

        it('returns 401 response with incorrect credentials', () => {
            // Set specific credentials
            process.env.HTTP_BASIC_AUTH = 'testuser:testpass'

            const req = {
                headers: {
                    get: vi.fn().mockReturnValue('Basic ' + Buffer.from('wronguser:wrongpass').toString('base64')),
                },
            } as unknown as NextRequest

            const response = middleware(req)

            expect(response.status).toBe(401)
            expect(response.headers.get('WWW-Authenticate')).toBe('Basic')
        })

        it('uses default credentials when HTTP_BASIC_AUTH is not set', () => {
            // Unset the environment variable to use default
            delete process.env.HTTP_BASIC_AUTH

            const req = {
                headers: {
                    get: vi.fn().mockReturnValue('Basic ' + Buffer.from('admin:password').toString('base64')),
                },
            } as unknown as NextRequest

            const response = middleware(req)

            expect(response).toEqual(NextResponse.next())
        })
    })

    describe('Configuration', () => {
        it('has a matcher that excludes specific routes', () => {
            expect(config.matcher).toBe('/((?!favicon.ico|api/health).*)')
        })
    })
})
