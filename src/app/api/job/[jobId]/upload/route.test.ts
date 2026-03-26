import { describe, expect, it, beforeEach, vi } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { pemToJSONBuffer, pemToArrayBuffer, generateKeyPair } from 'si-encryption/util'
import { ResultsReader } from 'si-encryption/job-results/reader'

import * as mgmt from '@/app/management-app-requests'

vi.mock('@/app/management-app-requests.ts')

describe('POST /api/job/[jobId]/upload', () => {
    it('should return failure if no file is uploaded', async () => {
        vi.mocked(mgmt.getPublicKeys).mockResolvedValue({ keys: [] })

        const formData = new FormData()

        const req = {
            formData: async () => formData,
        } as NextRequest
        const params = Promise.resolve({ jobId: uuidv4() })
        const response = await POST(req, { params })
        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('Form data does not include expected file key')
    })

    it('should return failure if unexpected form data is included', async () => {
        vi.mocked(mgmt.getPublicKeys).mockResolvedValue({ keys: [] })

        const mockFile = new Blob(['id,name\n1,John'], { type: 'text/csv' })
        const mockJobId = uuidv4()

        const formData = new FormData()
        formData.append('file', new File([mockFile], mockJobId))
        formData.append('file2', new File([mockFile], mockJobId))

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
        formData.append('file', new File(['data'], mockJobId))

        const req = {
            formData: async () => formData,
        } as NextRequest
        const params = Promise.resolve({ jobId: mockJobId })
        const response = await POST(req, { params })
        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('No public keys found for job ID: ' + mockJobId)
    })
})

describe('POST /api/job/[jobId]/upload with public keys', async () => {
    let req: NextRequest
    let params: Promise<{ jobId: string }>
    let mockJobId: string
    const keyPair = await generateKeyPair()

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

        // Mock data to send in
        mockJobId = uuidv4()

        const formData = new FormData()
        formData.append('file', new File(['id,name\n1,John'], 'cool_results.csv', { type: 'text/csv' }))

        req = {
            formData: async () => formData,
        } as NextRequest

        params = Promise.resolve({ jobId: mockJobId })
    })

    it('should encrypt results and send to mgmt', async () => {
        vi.mocked(mgmt.uploadResults).mockResolvedValue({ ok: true } as Response)

        const response = await POST(req, { params })

        expect(mgmt.uploadResults).toHaveBeenCalledWith(mockJobId, expect.any(Blob), 'application/zip', 'result')
        expect(response.status).toBe(200)

        const encryptedResults = vi.mocked(mgmt.uploadResults).mock.calls[0][1]

        const reader = new ResultsReader(
            encryptedResults as Blob,
            pemToArrayBuffer(keyPair.privateKeyString),
            keyPair.fingerprint,
        )

        const uploadedFiles = await reader.extractFiles()
        expect(Object.keys(reader.manifest.files)).toHaveLength(1)
        expect(uploadedFiles).toHaveLength(1)
        expect(uploadedFiles[0].path).toEqual('cool_results.csv')
        expect(new TextDecoder().decode(uploadedFiles[0].contents)).toEqual('id,name\n1,John')
    })

    it('should return 400 if upload fails', async () => {
        vi.mocked(mgmt.uploadResults).mockResolvedValue({ ok: false, status: 'mockstatus' } as unknown as Response)

        const response = await POST(req, { params })

        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('Failed to post encrypted results: mockstatus')
    })
})
