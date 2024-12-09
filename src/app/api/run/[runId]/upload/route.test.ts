import { describe, expect, it } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs'
import { UPLOAD_DIR } from '@/app/utils'

describe('POST /api/run/[runId]/upload', () => {
    it('should upload a file successfully', async () => {
        const mockFile = new Blob(['id,name\n1,John'], { type: 'text/csv' })
        const mockRunId = '123'

        const formData = new FormData()
        formData.append('file', new File([mockFile], mockRunId))

        const req = {
            formData: async () => formData,
        } as NextRequest

        const params = { runId: mockRunId }

        const response = await POST(req, { params })
        expect(response.status).toBe(200)

        // Check if the file was written to the upload directory
        const filePath = path.resolve(UPLOAD_DIR, mockRunId)
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
        const params = { runId: '123' }
        const response = await POST(req, { params })
        expect(response.status).toBe(400)
    })

    it('should return an error if no runID is provided', async () => {
        const formData = new FormData()

        // Mock the NextRequest
        const req = {
            formData: async () => formData,
        } as NextRequest
        const params = {}
        // @ts-ignore
        const response = await POST(req, { params })
        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.error).toBe('Missing runId')
    })
})
