import { describe, expect, it, vi } from 'vitest'
import { AllowedStatusUpdates, PUT } from '@/app/api/run/[runId]/route'
import { v4 } from 'uuid'
import { NextRequest } from 'next/server'

describe('PUT /api/run/:runId', () => {
    const runId = v4()

    it('should return 400 if runId is missing', async () => {
        const req = new NextRequest('http://localhost', { method: 'PUT' })
        const params = Promise.resolve({ runId: '' })
        const res = await PUT(req, { params })

        expect(res.status).toBe(400)
        const data = await res.json()
        expect(data).toEqual({ error: 'Missing runId' })
    })

    it('should return 400 if JSON data is not of expected shape', async () => {
        const params = Promise.resolve({ runId: runId })

        // Empty object
        let req = new NextRequest('http://localhost', { method: 'PUT', body: JSON.stringify({}) })
        let res = await PUT(req, { params })

        expect(res.status).toBe(400)
        let data = await res.json()
        expect(data).toEqual({ error: 'Malformed request data' })

        // PROVISIONING does not allow message
        req = new NextRequest('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ status: AllowedStatusUpdates.JOB_PROVISIONING, message: 'message' }),
        })
        res = await PUT(req, { params })

        expect(res.status).toBe(400)
        data = await res.json()
        expect(data).toEqual({ error: 'Malformed request data' })

        // When allowed message should be string
        req = new NextRequest('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ status: AllowedStatusUpdates.JOB_ERRORED, message: 12 }),
        })
        res = await PUT(req, { params })

        expect(res.status).toBe(400)
        data = await res.json()
        expect(data).toEqual({ error: 'Malformed request data' })
    })

    it('should return 400 if status data is not of expected value', async () => {
        const req = new NextRequest('http://localhost', { method: 'PUT', body: JSON.stringify({ status: 'FOO' }) })
        const params = Promise.resolve({ runId: runId })
        const res = await PUT(req, { params })

        expect(res.status).toBe(400)
        const data = await res.json()
        expect(data).toEqual({ error: 'Malformed request data' })
    })

    it('should make request to BMA and succeed if BMA response is ok', async () => {
        // Mock generateAuthorizationHeaders dependency in handler
        vi.mock('@/app/utils', () => ({
            generateAuthorizationHeaders: () => {
                return { Authorization: 'Bearer tokenvalue' }
            },
        }))

        const mockBMAResponse = vi.fn().mockResolvedValueOnce(new Response())
        vi.stubGlobal('fetch', mockBMAResponse)
        process.env.MANAGEMENT_APP_API_URL = 'http://bma'

        const req = new NextRequest('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ status: AllowedStatusUpdates.JOB_RUNNING }),
        })
        const params = Promise.resolve({ runId: runId })
        const res = await PUT(req, { params })

        expect(mockBMAResponse).toHaveBeenCalledOnce()
        expect(mockBMAResponse).toHaveBeenCalledWith(`http://bma/api/run/${runId}`, {
            method: 'PUT',
            headers: { Authorization: 'Bearer tokenvalue' },
            body: JSON.stringify({ status: AllowedStatusUpdates.JOB_RUNNING }),
        })
        expect(res.status).toBe(200)
    })

    it('should include message in requset to BMA if provided', async () => {
        // Mock generateAuthorizationHeaders dependency in handler
        vi.mock('@/app/utils', () => ({
            generateAuthorizationHeaders: () => {
                return { Authorization: 'Bearer tokenvalue' }
            },
        }))

        const mockBMAResponse = vi.fn().mockResolvedValueOnce(new Response())
        vi.stubGlobal('fetch', mockBMAResponse)
        process.env.MANAGEMENT_APP_API_URL = 'http://bma'

        const req = new NextRequest('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ status: AllowedStatusUpdates.JOB_RUNNING, message: 'message' }),
        })
        const params = Promise.resolve({ runId: runId })
        const res = await PUT(req, { params })

        expect(mockBMAResponse).toHaveBeenCalledOnce()
        expect(mockBMAResponse).toHaveBeenCalledWith(`http://bma/api/run/${runId}`, {
            method: 'PUT',
            headers: { Authorization: 'Bearer tokenvalue' },
            body: JSON.stringify({ status: AllowedStatusUpdates.JOB_RUNNING, message: 'message' }),
        })
        expect(res.status).toBe(200)
    })

    it('should make request to BMA and fail if BMA response is not ok', async () => {
        // Mock generateAuthorizationHeaders dependency in handler
        vi.mock('@/app/utils', () => ({
            generateAuthorizationHeaders: () => {
                return { Authorization: 'Bearer tokenvalue' }
            },
        }))

        const mockBMAResponse = vi.fn().mockResolvedValueOnce(new Response(null, { status: 404 }))
        vi.stubGlobal('fetch', mockBMAResponse)
        process.env.MANAGEMENT_APP_API_URL = 'http://bma'

        const req = new NextRequest('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ status: AllowedStatusUpdates.JOB_RUNNING }),
        })
        const params = Promise.resolve({ runId: runId })
        const res = await PUT(req, { params })

        expect(mockBMAResponse).toHaveBeenCalledOnce()
        expect(mockBMAResponse).toHaveBeenCalledWith(`http://bma/api/run/${runId}`, {
            method: 'PUT',
            headers: { Authorization: 'Bearer tokenvalue' },
            body: JSON.stringify({ status: AllowedStatusUpdates.JOB_RUNNING }),
        })
        expect(res.status).toBe(500)
    })
})
