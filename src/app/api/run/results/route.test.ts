import { GET } from './route'
import fs from 'fs'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { UPLOAD_DIR } from '@/app/utils'

const mockFileContent = 'header1,header2\nvalue1,value2'
const mockFileName = 'test.csv'
const mockFilePath: string = path.join(UPLOAD_DIR, mockFileName)

describe('GET /api/run/results', () => {
    // Create a temporary test directory before each test
    beforeEach(() => {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true }) // Create the directory
        // Write a mock file in the directory
        fs.writeFileSync(mockFilePath, mockFileContent)
    })

    // Clean up the test directory after each test
    afterEach(() => {
        fs.rmSync(UPLOAD_DIR, { recursive: true, force: true }) // Remove the directory and its contents
    })

    it('should return parsed CSV data when files exist', async () => {
        const response = GET()
        const data = await response.json()
        expect(response.status).toBe(200)
        expect(data.runs).toEqual({
            [mockFileName]: [{ header1: 'value1', header2: 'value2' }],
        })
    })

    it('should return empty runs when the directory does not exist', async () => {
        // Simulate the directory not existing
        fs.rmSync(UPLOAD_DIR, { recursive: true, force: true })

        const response = GET()
        const data = await response.json()

        // Verify the response is an empty object
        expect(response.status).toBe(200)
        expect(data.runs).toEqual({})
    })
})
