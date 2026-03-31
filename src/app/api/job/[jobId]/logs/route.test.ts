import { describe, expect, it, beforeEach, vi } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { pemToJSONBuffer, pemToArrayBuffer, generateKeyPair } from 'si-encryption/util'
import { ResultsReader } from 'si-encryption/job-results/reader'

import * as mgmt from '@/app/management-app-requests'

vi.mock('@/app/management-app-requests.ts')

describe('POST /api/job/[jobId]/logs', () => {
    it('should return failure if no logs data is included', async () => {
        const formData = new FormData()

        const req = {
            formData: async () => formData,
        } as NextRequest
        const params = Promise.resolve({ jobId: uuidv4() })
        const response = await POST(req, { params })
        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('Form data does not include expected logs key')
    })

    it('should return failure if unexpected form data is included', async () => {
        const formData = new FormData()
        formData.append('logs', JSON.stringify([{ timestamp: 1, message: 'test' }]))
        formData.append('extra', 'unexpected')

        const req = {
            formData: async () => formData,
        } as NextRequest
        const params = Promise.resolve({ jobId: uuidv4() })
        const response = await POST(req, { params })
        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('Form data includes unexpected data keys')
    })

    it('should return failure if jobId is not a UUID', async () => {
        const formData = new FormData()

        const req = {
            formData: async () => formData,
        } as NextRequest

        const params = Promise.resolve({ jobId: '123' })
        const response = await POST(req, { params })
        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('jobId is not a UUID')
    })

    it('should return an error if no jobID is provided', async () => {
        const formData = new FormData()

        const req = {
            formData: async () => formData,
        } as NextRequest
        const params = Promise.resolve({ jobId: '' })
        const response = await POST(req, { params })
        expect(response.status).toBe(400)
    })

    it('should return an error if no public keys are found', async () => {
        vi.mocked(mgmt.getPublicKeys).mockResolvedValue({ keys: [] })

        const mockJobId = uuidv4()
        const formData = new FormData()
        formData.append('logs', JSON.stringify([{ timestamp: 1, message: 'test' }]))

        const req = {
            formData: async () => formData,
        } as NextRequest
        const params = Promise.resolve({ jobId: mockJobId })
        const response = await POST(req, { params })
        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('No public keys found for job ID: ' + mockJobId)
    })
})

describe('POST /api/job/[jobId]/logs with public keys', async () => {
    const keyPair = await generateKeyPair()
    let mockJobId: string

    function setupRequest(logsPayload: string) {
        mockJobId = uuidv4()

        const formData = new FormData()
        formData.append('logs', logsPayload)

        const req = {
            formData: async () => formData,
        } as NextRequest

        const params = Promise.resolve({ jobId: mockJobId })
        return { req, params }
    }

    beforeEach(() => {
        vi.mocked(mgmt.getPublicKeys).mockResolvedValue({
            keys: [
                {
                    jobId: 'jobId',
                    publicKey: pemToJSONBuffer(keyPair.publicKeyString),
                    fingerprint: keyPair.fingerprint,
                },
            ],
        })
    })

    it('should encrypt JSON logs as logs.json and send to mgmt', async () => {
        vi.mocked(mgmt.uploadResults).mockResolvedValue({ ok: true } as Response)
        const jsonPayload = JSON.stringify([{ timestamp: 1, message: 'Test log' }])
        const { req, params } = setupRequest(jsonPayload)

        const response = await POST(req, { params })

        expect(mgmt.uploadResults).toHaveBeenCalledWith(mockJobId, expect.any(Blob), 'application/zip', 'log')
        expect(response.status).toBe(200)

        const encryptedResults = vi.mocked(mgmt.uploadResults).mock.calls[0][1]
        const reader = new ResultsReader(
            encryptedResults as Blob,
            pemToArrayBuffer(keyPair.privateKeyString),
            keyPair.fingerprint,
        )

        const uploadedFiles = await reader.extractFiles()
        expect(uploadedFiles).toHaveLength(1)
        expect(uploadedFiles[0].path).toEqual('logs.json')
        expect(new TextDecoder().decode(uploadedFiles[0].contents)).toEqual(jsonPayload)
    })

    it('should encrypt plain text logs as logs.txt and send to mgmt', async () => {
        vi.mocked(mgmt.uploadResults).mockResolvedValue({ ok: true } as Response)
        const textPayload = 'Some plain text log output'
        const { req, params } = setupRequest(textPayload)

        const response = await POST(req, { params })

        expect(mgmt.uploadResults).toHaveBeenCalledWith(mockJobId, expect.any(Blob), 'application/zip', 'log')
        expect(response.status).toBe(200)

        const encryptedResults = vi.mocked(mgmt.uploadResults).mock.calls[0][1]
        const reader = new ResultsReader(
            encryptedResults as Blob,
            pemToArrayBuffer(keyPair.privateKeyString),
            keyPair.fingerprint,
        )

        const uploadedFiles = await reader.extractFiles()
        expect(uploadedFiles).toHaveLength(1)
        expect(uploadedFiles[0].path).toEqual('logs.txt')
        expect(new TextDecoder().decode(uploadedFiles[0].contents)).toEqual(textPayload)
    })

    it('should return 400 if upload fails', async () => {
        vi.mocked(mgmt.uploadResults).mockResolvedValue({ ok: false, status: 'mockstatus' } as unknown as Response)
        const { req, params } = setupRequest(JSON.stringify([{ timestamp: 1, message: 'Test log' }]))

        const response = await POST(req, { params })

        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('Failed to post encrypted logs: mockstatus')
    })
})
