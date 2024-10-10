import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { POST } from '@/app/api/upload/route' // Adjust the import path
import { NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { rm } from 'fs/promises' // for cleanup

const UPLOAD_DIR = path.resolve(os.tmpdir(), 'public/uploads')

// Ensure the upload directory exists
beforeEach(() => {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }
})

// Clean up after each test
afterEach(async () => {
    await rm(UPLOAD_DIR, { recursive: true, force: true })
})

describe('POST /api/upload', () => {
    it('should upload a file successfully', async () => {
        // Mock a CSV file as a Blob
        const mockFile = new Blob(['id,name\n1,John'], { type: 'text/csv' })
        const mockFileName = 'test.csv'

        // Create a FormData object with the mock file
        const formData = new FormData()
        formData.append('file', new File([mockFile], mockFileName))

        // Mock the NextRequest
        const req = {
            formData: async () => formData,
        } as NextRequest

        const response = await POST(req)
        const json = await response.json()

        expect(json.success).toBe(true)
        expect(json.name).toBe(mockFileName)

        // Check if the file was written to the upload directory
        const filePath = path.resolve(UPLOAD_DIR, mockFileName)
        expect(fs.existsSync(filePath)).toBe(true)

        // Verify the contents of the uploaded file
        const uploadedFileContent = fs.readFileSync(filePath, 'utf-8')
        expect(uploadedFileContent).toBe('id,name\n1,John')
    })

    it('should return failure if no file is uploaded', async () => {
        // Empty FormData object
        const formData = new FormData()

        // Mock the NextRequest
        const req = {
            formData: async () => formData,
        } as NextRequest

        const response = await POST(req)
        const json = await response.json()

        expect(json.success).toBe(false)
    })
})
