import { describe, expect, it, beforeEach, vi } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { generateKeyPair, pemToArrayBuffer, pemToJSONBuffer } from 'si-encryption/util'
import { ResultsReader } from 'si-encryption/job-results'

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

describe('POST /api/job/[jobId]/upload with public keys', () => {
    let req: NextRequest
    let params: Promise<{ jobId: string }>
    let mockJobId: string
    let keyPair: Awaited<ReturnType<typeof generateKeyPair>>

    beforeEach(async () => {
        keyPair = await generateKeyPair()

        vi.mocked(mgmt.getPublicKeys).mockResolvedValue({
            keys: [
                {
                    jobId: 'jobId',
                    fingerprint: keyPair.fingerprint,
                    publicKey: pemToJSONBuffer(keyPair.publicKeyString),
                },
            ],
        })

        // Mock data to send in
        mockJobId = uuidv4()

        const formData = new FormData()
        formData.append('file', new File(['id,name\n1,John'], 'test.zip', { type: 'application/zip' }))

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
    })

    it('should encrypt multiple files into a single zip and send to mgmt', async () => {
        vi.mocked(mgmt.uploadResults).mockResolvedValue({ ok: true } as Response)

        const formData = new FormData()
        formData.append('file', new File(['id,name\n1,John'], 'results_a.csv', { type: 'text/csv' }))
        formData.append('file', new File(['col1,col2\nx,y'], 'results_b.csv', { type: 'text/csv' }))

        const multiReq = {
            formData: async () => formData,
        } as NextRequest
        const multiParams = Promise.resolve({ jobId: mockJobId })

        const response = await POST(multiReq, { params: multiParams })

        expect(mgmt.uploadResults).toHaveBeenCalledWith(mockJobId, expect.any(Blob), 'application/zip', 'result')
        expect(response.status).toBe(200)

        const encryptedResults = vi.mocked(mgmt.uploadResults).mock.calls[0][1]
        const reader = new ResultsReader(
            encryptedResults as Blob,
            pemToArrayBuffer(keyPair.privateKeyString),
            keyPair.fingerprint,
        )

        const uploadedFiles = await reader.extractFiles()
        expect(uploadedFiles).toHaveLength(2)

        const fileA = uploadedFiles.find((f) => f.path === 'results_a.csv')
        const fileB = uploadedFiles.find((f) => f.path === 'results_b.csv')

        expect(fileA).toBeDefined()
        expect(new TextDecoder().decode(fileA!.contents)).toEqual('id,name\n1,John')

        expect(fileB).toBeDefined()
        expect(new TextDecoder().decode(fileB!.contents)).toEqual('col1,col2\nx,y')
    })

    it('should return 400 if upload fails', async () => {
        vi.mocked(mgmt.uploadResults).mockResolvedValue({ ok: false, status: 'mockstatus' } as unknown as Response)

        const response = await POST(req, { params })

        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('Failed to post encrypted results: mockstatus')
    })
})
