import { beforeEach, describe, expect, it } from 'vitest'
import path from 'path'
import { GET } from '@/app/api/runs/route'
import { UPLOAD_DIR } from '@/app/utils'
import mockFs from 'mock-fs'

describe('GET /api/runs', () => {
    const testFiles = ['1', '2', '3', 'empty']

    beforeEach(() => {
        // Mock the file system with test files in the UPLOAD_DIR
        const mockUploadDir: Record<string, string> = {}
        testFiles.forEach((file) => {
            const filePath = path.join(UPLOAD_DIR, file)
            mockUploadDir[filePath] = '' // Mock an empty file
        })

        // Use mockFs to simulate the file system
        mockFs({
            [UPLOAD_DIR]: mockUploadDir,
        })
    })

    it('should return a list of run IDs from CSV files', async () => {
        const response = GET()

        expect(response.status).toBe(200)
        const json = await response.json()

        expect(json).toEqual({
            runs: [{ runId: '1' }, { runId: '2' }, { runId: '3' }, { runId: 'empty' }],
        })
    })

    it('should return an empty array if the directory doesnt exist', async () => {
        // Simulate the absence of the directory by removing it from mockFs
        mockFs({})

        const response = GET()

        expect(response.status).toBe(200)
        const json = await response.json()
        expect(json).toEqual({ runs: [] })
    })
})
