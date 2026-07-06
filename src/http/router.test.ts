import { describe, it, expect } from 'vitest'
import { Router, type RouteHandler } from './router'

const ok: RouteHandler = () => new Response('ok')

describe('Router', () => {
    it('matches a static path and method', () => {
        const r = new Router()
        r.register('GET', '/api/health', ok)
        const match = r.match('GET', '/api/health')
        expect(match).not.toBeNull()
        expect(match!.params).toEqual({})
    })

    it('extracts a :param and URL-decodes it', () => {
        const r = new Router()
        r.register('POST', '/api/job/:jobId/logs', ok)
        const match = r.match('POST', '/api/job/abc%20123/logs')
        expect(match).not.toBeNull()
        expect(match!.params).toEqual({ jobId: 'abc 123' })
    })

    it('is method-sensitive', () => {
        const r = new Router()
        r.register('GET', '/api/health', ok)
        expect(r.match('POST', '/api/health')).toBeNull()
    })

    it('returns null when no route matches', () => {
        const r = new Router()
        r.register('GET', '/api/health', ok)
        expect(r.match('GET', '/api/nope')).toBeNull()
    })

    it('does not let a :param span path segments', () => {
        const r = new Router()
        r.register('PUT', '/api/job/:jobId', ok)
        expect(r.match('PUT', '/api/job/abc/extra')).toBeNull()
    })
})
