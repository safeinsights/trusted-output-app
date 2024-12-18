import { POST } from '@/app/api/run/[runId]/approve/route'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UPLOAD_DIR } from '@/app/utils'
import mockFs from 'mock-fs'
import { v4 } from 'uuid'

describe('POST /api/run/:runId/approve', () => {
    const mockFileContent = 'header1,header2\nvalue1,value2'
    const runId = v4()

    beforeEach(() => {
        // Mock the file system with the necessary file
        mockFs({
            [UPLOAD_DIR]: {
                [runId]: mockFileContent,
            },
        })
    })

    it('should return 400 if runId is missing', async () => {
        const req = new Request('http://localhost', { method: 'POST' })
        // @ts-ignore
        const res = await POST(req as any, { params: {} })

        // Check status
        expect(res.status).toBe(400)
    })

    it('should return 400 if the file does not exist', async () => {
        // Simulate the file not existing by removing it from mockFs
        mockFs({
            [UPLOAD_DIR]: {}, // Empty the directory to simulate no file for 'runId'
        })

        const req = new Request('http://localhost', { method: 'POST' })
        const res = await POST(req as any, { params: { runId: 'non-existent-run' } })

        // Check status
        expect(res.status).toBe(400)

        // Check JSON payload
        const data = await res.json()
        expect(data).toEqual({ error: 'No file exists to delete' })
    })

    it('should return 500 if the external API request fails', async () => {
        // Mock the fetch call to simulate failure
        vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false }))

        const req = new Request('http://localhost', { method: 'POST' })
        const res = await POST(req as any, { params: { runId } })

        // Check status
        expect(res.status).toBe(500)

        // Check JSON payload
        const data = await res.json()
        expect(data).toEqual({ error: 'Unable to post file' })
    })

    it('should return 200 and success if the file exists and external API request succeeds', async () => {
        // Mock the fetch call to simulate success
        vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: true }))

        const req = new Request('http://localhost', { method: 'POST' })
        const res = await POST(req as any, { params: { runId } })

        // Check status
        expect(res.status).toBe(200)

        // Check JSON payload
        const data = await res.json()
        expect(data).toEqual({ success: true })
    })
})
