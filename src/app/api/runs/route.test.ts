import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { UPLOAD_DIR } from '@/app/utils'
import { GET } from '@/app/api/run/route'

describe('GET /api/runs', () => {
    const testFiles = ['1', '2', '3', 'empty']

    // Create test files before each test
    beforeEach(() => {
        // Ensure the upload directory exists
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true })
        }

        // Write test files to the upload directory
        testFiles.forEach(file => {
            const filePath = path.join(UPLOAD_DIR, file)
            fs.writeFileSync(filePath, '')
        })
    })

    // Clean up the test files after each test
    afterEach(() => {
        testFiles.forEach(file => {
            const filePath = path.join(UPLOAD_DIR, file)
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
        })

        // Optionally, remove the directory if it's empty
        if (fs.existsSync(UPLOAD_DIR) && fs.readdirSync(UPLOAD_DIR).length === 0) {
            fs.rmdirSync(UPLOAD_DIR)
        }
    })

    it('should return a list of run IDs from CSV files', async () => {
        const response = await GET()

        expect(response.status).toBe(200)
        const json = await response.json()

        // Only the .csv files should be listed, excluding non-CSV files
        expect(json).toEqual({
            runs: [
                { runId: '1' },
                { runId: '2' },
                { runId: '3' },
                { runId: 'empty' },
            ],
        })
    })

    it('should return a 500 error if the directory cannot be read', async () => {
        // Remove the upload directory to simulate an error
        fs.rmSync(UPLOAD_DIR, { recursive: true })
        const response = await GET()

        expect(response.status).toBe(500)
        const json = await response.json()
        expect(json).toEqual({ error: 'Unable to read files' })
    })
})
