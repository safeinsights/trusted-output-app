import { describe, expect, it, vi } from 'vitest'
import { updateJobStatus } from './job-status'
import { v4 } from 'uuid'

describe('PUT /api/job/:jobId', () => {
    const jobId = v4()

    it('should return 400 if jobId is missing', async () => {
        const req = new Request('http://localhost', { method: 'PUT' })
        const params = { jobId: '' }
        const res = await updateJobStatus(req, params)

        expect(res.status).toBe(400)
        const data = await res.json()
        expect(data).toEqual({ error: 'Missing jobId' })
    })

    it('should return 400 if JSON data is not of expected shape', async () => {
        const params = { jobId: jobId }

        // Empty object
        let req = new Request('http://localhost', { method: 'PUT', body: JSON.stringify({}) })
        let res = await updateJobStatus(req, params)

        expect(res.status).toBe(400)
        let data = await res.json()
        expect(data).toEqual({ error: 'Malformed request data' })

        // PROVISIONING does not allow message
        req = new Request('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ status: 'JOB-PROVISIONING', message: 'message' }),
        })
        res = await updateJobStatus(req, params)

        expect(res.status).toBe(400)
        data = await res.json()
        expect(data).toEqual({ error: 'Malformed request data' })

        // When allowed message should be string
        req = new Request('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ status: 'JOB-ERRORED', message: 12 }),
        })
        res = await updateJobStatus(req, params)

        expect(res.status).toBe(400)
        data = await res.json()
        expect(data).toEqual({ error: 'Malformed request data' })
    })

    it('should return 400 if status data is not of expected value', async () => {
        const req = new Request('http://localhost', { method: 'PUT', body: JSON.stringify({ status: 'FOO' }) })
        const params = { jobId: jobId }
        const res = await updateJobStatus(req, params)

        expect(res.status).toBe(400)
        const data = await res.json()
        expect(data).toEqual({ error: 'Malformed request data' })
    })

    it('should make request to BMA and succeed if BMA response is ok', async () => {
        // Mock generateAuthorizationHeaders dependency in handler
        vi.mock('@/utils', () => ({
            generateAuthorizationHeaders: () => {
                return { Authorization: 'Bearer tokenvalue' }
            },
        }))

        const mockBMAResponse = vi.fn().mockResolvedValueOnce(new Response())
        vi.stubGlobal('fetch', mockBMAResponse)
        process.env.MANAGEMENT_APP_API_URL = 'http://bma'

        const req = new Request('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ status: 'JOB-RUNNING' }),
        })
        const params = { jobId: jobId }
        const res = await updateJobStatus(req, params)

        expect(mockBMAResponse).toHaveBeenCalledOnce()
        expect(mockBMAResponse).toHaveBeenCalledWith(`http://bma/api/job/${jobId}`, {
            method: 'PUT',
            headers: { Authorization: 'Bearer tokenvalue' },
            body: JSON.stringify({ status: 'JOB-RUNNING' }),
        })
        expect(res.status).toBe(200)
    })

    it('should include message in requset to BMA if provided', async () => {
        // Mock generateAuthorizationHeaders dependency in handler
        vi.mock('@/utils', () => ({
            generateAuthorizationHeaders: () => {
                return { Authorization: 'Bearer tokenvalue' }
            },
        }))

        const mockBMAResponse = vi.fn().mockResolvedValueOnce(new Response())
        vi.stubGlobal('fetch', mockBMAResponse)
        process.env.MANAGEMENT_APP_API_URL = 'http://bma'

        const req = new Request('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ status: 'JOB-RUNNING', message: 'message' }),
        })
        const params = { jobId: jobId }
        const res = await updateJobStatus(req, params)

        expect(mockBMAResponse).toHaveBeenCalledOnce()
        expect(mockBMAResponse).toHaveBeenCalledWith(`http://bma/api/job/${jobId}`, {
            method: 'PUT',
            headers: { Authorization: 'Bearer tokenvalue' },
            body: JSON.stringify({ status: 'JOB-RUNNING', message: 'message' }),
        })
        expect(res.status).toBe(200)
    })

    it('should make request to BMA and fail if BMA response is not ok', async () => {
        // Mock generateAuthorizationHeaders dependency in handler
        vi.mock('@/utils', () => ({
            generateAuthorizationHeaders: () => {
                return { Authorization: 'Bearer tokenvalue' }
            },
        }))

        const mockBMAResponse = vi.fn().mockResolvedValueOnce(new Response(null, { status: 404 }))
        vi.stubGlobal('fetch', mockBMAResponse)
        process.env.MANAGEMENT_APP_API_URL = 'http://bma'

        const req = new Request('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ status: 'JOB-RUNNING' }),
        })
        const params = { jobId: jobId }
        const res = await updateJobStatus(req, params)

        expect(mockBMAResponse).toHaveBeenCalledOnce()
        expect(mockBMAResponse).toHaveBeenCalledWith(`http://bma/api/job/${jobId}`, {
            method: 'PUT',
            headers: { Authorization: 'Bearer tokenvalue' },
            body: JSON.stringify({ status: 'JOB-RUNNING' }),
        })
        expect(res.status).toBe(500)
    })
})
