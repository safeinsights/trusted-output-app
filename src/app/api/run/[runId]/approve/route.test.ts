import { POST } from '@/app/api/run/[runId]/approve/route'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import path from 'path'
import { UPLOAD_DIR } from '@/app/utils'
import fs from 'fs'

describe('POST /api/run/:runId/approve', () => {
    const mockFileContent = 'header1,header2\nvalue1,value2'
    const runId = 'test-run-id'
    const mockFilePath: string = path.join(UPLOAD_DIR, runId)

    // Create a temporary test directory before each test
    beforeEach(() => {
        // recreate directory
        fs.mkdirSync(UPLOAD_DIR, { recursive: true })
        // add the file
        fs.writeFileSync(mockFilePath, mockFileContent)
    })

    // Clean up the test directory after each test
    afterEach(() => {
        fs.rmSync(UPLOAD_DIR, { recursive: true, force: true })
    })
    it('should return 400 if runId is missing', async () => {
        const req = new Request('http://localhost', { method: 'POST' })
        const res = await POST(req as any, { params: {} })

        // Check status
        expect(res.status).toBe(400)

        // Check JSON payload
        const data = await res.json()
        expect(data).toEqual({ error: 'Missing runId' })
    })

    it('should return 400 if the file does not exist', async () => {
        const req = new Request('http://localhost', { method: 'POST' })
        const res = await POST(req as any, { params: { runId: 'non-existent-run' } })

        // Check status
        expect(res.status).toBe(400)

        // Check JSON payload
        const data = await res.json()
        expect(data).toEqual({ error: 'No file exists to delete' })
    })
})
