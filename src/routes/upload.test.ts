import { describe, expect, it, beforeEach, vi } from 'vitest'
import { uploadResultFiles } from './upload'
import { v4 as uuidv4 } from 'uuid'
import { generateKeyPair, pemToArrayBuffer, pemToJSONBuffer } from 'si-encryption/util'
import { ResultsReader } from 'si-encryption/job-results'

import * as mgmt from '@/lib/management-app-requests'

vi.mock('@/lib/management-app-requests')

describe('POST /api/job/[jobId]/upload', () => {
    it('should return failure if no file is uploaded', async () => {
        vi.mocked(mgmt.getPublicKeys).mockResolvedValue({ keys: [] })

        const formData = new FormData()

        const req = {
            formData: async () => formData,
        } as unknown as Request
        const params = { jobId: uuidv4() }
        const response = await uploadResultFiles(req, params)
        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('No results provided')
    })

    it('should return failure if jobId is not a UUID', async () => {
        const formData = new FormData()

        const req = {
            formData: async () => formData,
        } as unknown as Request

        const params = { jobId: '123' }
        const response = await uploadResultFiles(req, params)
        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('jobId is not a UUID')
    })

    it('should return an error if no jobID is provided', async () => {
        const formData = new FormData()

        const req = {
            formData: async () => formData,
        } as unknown as Request
        const params = { jobId: '' }
        const response = await uploadResultFiles(req, params)
        expect(response.status).toBe(400)
    })

    it('should return an error if no public keys are found', async () => {
        vi.mocked(mgmt.getPublicKeys).mockResolvedValue({ keys: [] })

        const mockJobId = uuidv4()
        const formData = new FormData()
        formData.append('file', new File(['data'], mockJobId))

        const req = {
            formData: async () => formData,
        } as unknown as Request
        const params = { jobId: mockJobId }
        const response = await uploadResultFiles(req, params)
        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('No public keys found for job ID: ' + mockJobId)
    })
})

describe('POST /api/job/[jobId]/upload with public keys', () => {
    let req: Request
    let params: { jobId: string }
    let mockJobId: string
    let keyPair: Awaited<ReturnType<typeof generateKeyPair>>

    const decrypt = async () => {
        const encryptedResults = vi.mocked(mgmt.uploadResults).mock.calls[0][1]
        const reader = new ResultsReader(
            encryptedResults as Blob,
            pemToArrayBuffer(keyPair.privateKeyString),
            keyPair.fingerprint,
        )
        return reader.extractFiles()
    }

    const requestWith = (formData: FormData) => ({ formData: async () => formData }) as unknown as Request

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

        mockJobId = uuidv4()

        const formData = new FormData()
        formData.append('file', new File(['id,name\n1,John'], 'cool_results.csv', { type: 'text/csv' }))

        req = requestWith(formData)
        params = { jobId: mockJobId }
    })

    it('should encrypt results and send to mgmt', async () => {
        vi.mocked(mgmt.uploadResults).mockResolvedValue({ ok: true } as Response)

        const response = await uploadResultFiles(req, params)

        expect(mgmt.uploadResults).toHaveBeenCalledWith(mockJobId, expect.any(Blob), 'application/zip', 'result')
        expect(response.status).toBe(200)

        const uploadedFiles = await decrypt()
        expect(uploadedFiles).toHaveLength(1)
        expect(uploadedFiles[0].path).toEqual('cool_results.csv')
        expect(new TextDecoder().decode(uploadedFiles[0].contents)).toEqual('id,name\n1,John')
    })

    it('should encrypt multiple files sent under the repeated file field', async () => {
        vi.mocked(mgmt.uploadResults).mockResolvedValue({ ok: true } as Response)

        const formData = new FormData()
        formData.append('file', new File(['id,name\n1,John'], 'results_a.csv', { type: 'text/csv' }))
        formData.append('file', new File(['col1,col2\nx,y'], 'results_b.csv', { type: 'text/csv' }))

        const response = await uploadResultFiles(requestWith(formData), { jobId: mockJobId })

        expect(mgmt.uploadResults).toHaveBeenCalledWith(mockJobId, expect.any(Blob), 'application/zip', 'result')
        expect(response.status).toBe(200)

        const uploadedFiles = await decrypt()
        expect(uploadedFiles).toHaveLength(2)
        expect(uploadedFiles.find((f) => f.path === 'results_a.csv')).toBeDefined()
        expect(uploadedFiles.find((f) => f.path === 'results_b.csv')).toBeDefined()
    })

    it('should accept files sent under file and file2 fields', async () => {
        vi.mocked(mgmt.uploadResults).mockResolvedValue({ ok: true } as Response)

        const formData = new FormData()
        formData.append('file', new File(['id,name\n1,John'], 'a.csv', { type: 'text/csv' }))
        formData.append('file2', new File(['col1,col2\nx,y'], 'b.csv', { type: 'text/csv' }))

        const response = await uploadResultFiles(requestWith(formData), { jobId: mockJobId })

        expect(response.status).toBe(200)
        const uploadedFiles = await decrypt()
        expect(uploadedFiles).toHaveLength(2)
        expect(uploadedFiles.find((f) => f.path === 'a.csv')).toBeDefined()
        expect(uploadedFiles.find((f) => f.path === 'b.csv')).toBeDefined()
    })

    it('should accept files sent under arbitrary field names (file1, file2)', async () => {
        vi.mocked(mgmt.uploadResults).mockResolvedValue({ ok: true } as Response)

        const formData = new FormData()
        formData.append('file1', new File(['one'], 'one.csv', { type: 'text/csv' }))
        formData.append('file2', new File(['two'], 'two.csv', { type: 'text/csv' }))

        const response = await uploadResultFiles(requestWith(formData), { jobId: mockJobId })

        expect(response.status).toBe(200)
        const uploadedFiles = await decrypt()
        expect(uploadedFiles).toHaveLength(2)
        expect(uploadedFiles.find((f) => f.path === 'one.csv')).toBeDefined()
        expect(uploadedFiles.find((f) => f.path === 'two.csv')).toBeDefined()
    })

    it('should ignore non-file string fields', async () => {
        vi.mocked(mgmt.uploadResults).mockResolvedValue({ ok: true } as Response)

        const formData = new FormData()
        formData.append('file', new File(['id,name\n1,John'], 'only.csv', { type: 'text/csv' }))
        formData.append('meta', 'some-string-value')

        const response = await uploadResultFiles(requestWith(formData), { jobId: mockJobId })

        expect(response.status).toBe(200)
        const uploadedFiles = await decrypt()
        expect(uploadedFiles).toHaveLength(1)
        expect(uploadedFiles[0].path).toEqual('only.csv')
    })

    it('should return 400 if upload fails', async () => {
        vi.mocked(mgmt.uploadResults).mockResolvedValue({ ok: false, status: 'mockstatus' } as unknown as Response)

        const response = await uploadResultFiles(req, params)

        expect(response.status).toBe(400)
        expect((await response.json()).error).toBe('Failed to post encrypted results: mockstatus')
    })
})
