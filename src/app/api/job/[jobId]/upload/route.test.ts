import { describe, expect, it, beforeEach, vi } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs'
import { UPLOAD_DIR } from '@/app/utils'
import mockFs from 'mock-fs'
import { v4 as uuidv4 } from 'uuid'

import * as mgmt from '@/app/management-app-requests'

vi.mock('@/app/management-app-requests.ts')

beforeEach(() => {
    fs.rmSync(UPLOAD_DIR, { recursive: true, force: true })
})

describe('POST /api/job/[jobId]/upload if no public keys', () => {
    beforeEach(() => {
        vi.mocked(mgmt.getPublicKeys).mockResolvedValue({
            keys: []
        })
    })

    it('should upload a file successfully', async () => {
        const mockFile = new Blob(['id,name\n1,John'], { type: 'text/csv' })
        const mockJobId = uuidv4()

        const formData = new FormData()
        formData.append('file', new File([mockFile], mockJobId))

        const req = {
            formData: async () => formData,
        } as NextRequest

        const params = Promise.resolve({ jobId: mockJobId })
        const response = await POST(req, { params })
        expect(response.status).toBe(200)

        // Check if the file was written to the upload directory
        const filePath = path.resolve(UPLOAD_DIR, mockJobId)
        expect(fs.existsSync(filePath)).toBe(true)

        // Verify the contents of the uploaded file
        const uploadedFileContent = fs.readFileSync(filePath, 'utf-8')
        expect(uploadedFileContent).toBe('id,name\n1,John')
    })

    it('should return failure if no file is uploaded', async () => {
        const formData = new FormData()

        // Mock the NextRequest
        const req = {
            formData: async () => formData,
        } as NextRequest
        const params = Promise.resolve({ jobId: uuidv4() })
        const response = await POST(req, { params })
        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('Form data does not include expected file key')
    })

    it('should return failure if unexpected form data is included', async () => {
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
        const mockJobId = '123'

        const formData = new FormData()

        const req = {
            formData: async () => formData,
        } as NextRequest

        const params = Promise.resolve({ jobId: mockJobId })
        const response = await POST(req, { params })
        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('jobId is not a UUID')
    })

    it('should return an error if no jobID is provided', async () => {
        const formData = new FormData()

        // Mock the NextRequest
        const req = {
            formData: async () => formData,
        } as NextRequest
        const params = Promise.resolve({ jobId: '' })
        const response = await POST(req, { params })
        expect(response.status).toBe(400)
    })

    it('should return an error if the jobID has results already', async () => {
        const mockJobId = uuidv4()

        mockFs({
            [UPLOAD_DIR]: {
                [mockJobId]: '',
            },
        })

        const formData = new FormData()
        formData.append('file', '')

        const req = {
            formData: async () => formData,
        } as NextRequest

        const params = Promise.resolve({ jobId: mockJobId })
        const response = await POST(req, { params })
        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('Data already exists for jobId')
    })

    it('should fall through and 400 if all conditions fail', async () => {
        const mockJobId = uuidv4()

        // Create form data with a 'file' key that is not a valid File object
        const formData = new FormData()
        formData.append('file', 'not-a-file')

        const req = {
            formData: async () => formData,
        } as NextRequest

        const params = Promise.resolve({ jobId: mockJobId })
        const response = await POST(req, { params })

        expect(response.status).toBe(400)
        expect((await response.json()).error).toEqual('')
    })
})

describe('POST /api/job/[jobId]/upload if public keys', () => {
    let req: NextRequest
    let params: Promise<{ jobId: string }>
    let mockJobId: string

    beforeEach(() => {
        vi.mocked(mgmt.getPublicKeys).mockResolvedValue({
            keys: [
                {
                    fingerprint: '77c2d18672112a2ecc8428302822a28ee7356c668423dc5a828ed53ccc87150d',
                    publicKey: `MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEArd5ojUorKV9l1i/canpo
4JEKlENlX2VDB5yAkYevUea+hSpVLFnIBbd5n/Qejqs6uUhtxl1LmqPBuB8dMObL
waqLNWyD0MlHIRlzlLGcJPe7i6Mus2aeeFSGF6bZ/OQ36kbdeJCzM/Q+y3qXfY1j
rvFChbOTBDV0prpDZNNR6EY29V7YGqxIX9hsU8GrnKC2U1olc35lCVxCyVGFep8j
2MuTurD4Vb14RJwWUx0T61vgfD/ZRRZWvTtMfMIF7EFmwGrLpFWC8AG6i0ZzAx6H
cBuz7STvk79l48F5dQKNc43S+FP1KCLF8bSW9xTZ2owCg7d470eftPiIVT539LYH
c26DLdibeQjzAhFHwiKC3ltfY9zmrpKzvM6s1sloTw/VJD/5v+9+kMEeLs0Yx0su
junaozRtmGA0F00pdhZDEr+md0MHEaECvmeSrG8iXiHiEuihCfuAV19ld/O0RVDO
v/RAuzxQGTVe6QMetgEkpRr6Cnlo6fSIdF77D2LEvDH++Nut4MglIyI2/uJ2yAzJ
ePfWw2aZVF80tm3K5n3NHnn9xHfymeU9XBWFVpf7omt1QbtUv0MDv0WyP168qVnh
8q/rTZCb0UylRhIrVHcVoDD7ELG+lLjz87CHFxDSrcVxaCnUSDP6kmK19YqpuzET
daz67mcy8FIz1nBJ4z9P7ekCAwEAAQ==`,
                    jobId: 'jobId' }
            ]
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

        expect(mgmt.uploadResults).toHaveBeenCalledWith(
            mockJobId,
            expect.any(Blob),
            'application/zip'
        )
        expect(response.status).toBe(200)
    })

    it('should return 400 if upload fails', async () => {
        vi.mocked(mgmt.uploadResults).mockResolvedValue({ ok: false, status: 'mockstatus' } as unknown as Response)

        const response = await POST(req, { params })

        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('Failed to post encrypted results: mockstatus')
    })
})
