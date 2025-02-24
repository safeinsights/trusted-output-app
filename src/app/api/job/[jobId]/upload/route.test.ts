import { describe, expect, it, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs'
import { UPLOAD_DIR } from '@/app/utils'
import mockFs from 'mock-fs'
import { v4 as uuidv4 } from 'uuid'

beforeEach(() => {
    fs.rmSync(UPLOAD_DIR, { recursive: true, force: true })
})

describe('POST /api/job/[jobId]/upload', () => {
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
