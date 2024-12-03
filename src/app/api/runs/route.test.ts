import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { GET } from '@/app/api/runs/route'
import { UPLOAD_DIR } from '@/app/utils'

describe('GET /api/runs', () => {
    const testFiles = ['1', '2', '3', 'empty']

    beforeEach(() => {
        fs.rmSync(UPLOAD_DIR, { recursive: true, force: true })
        // Write test files to the upload directory
        testFiles.forEach((file) => {
            const filePath = path.join(UPLOAD_DIR, file)
            fs.writeFileSync(filePath, '')
        })
    })

    afterEach(() => {
        fs.rmSync(UPLOAD_DIR, { recursive: true, force: true })
    })

    it('should return a list of run IDs from CSV files', async () => {
        const response = GET()

        expect(response.status).toBe(200)
        const json = await response.json()

        // Only the .csv files should be listed, excluding non-CSV files
        expect(json).toEqual({
            runs: [{ runId: '1' }, { runId: '2' }, { runId: '3' }, { runId: 'empty' }],
        })
    })

    it('should return an empty array if the directory doesnt exist', async () => {
        // Remove the upload directory to simulate an error
        fs.rmSync(UPLOAD_DIR, { recursive: true })
        const response = GET()

        expect(response.status).toBe(200)
        const json = await response.json()
        expect(json).toEqual({ runs: [] })
    })
})
