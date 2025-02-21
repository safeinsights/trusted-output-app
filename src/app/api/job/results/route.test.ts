import { GET } from './route'
import { beforeEach, describe, expect, it } from 'vitest'
import { UPLOAD_DIR } from '@/app/utils'
import mockFs from 'mock-fs'

describe('GET /api/job/results', () => {
    const mockFileContent = 'header1,header2\nvalue1,value2'
    const mockFileName = 'test.csv'

    // Create a temporary test directory and file before each test
    beforeEach(() => {
        // Use mockFs to create the file in the mocked directory
        mockFs({
            [UPLOAD_DIR]: {
                [mockFileName]: mockFileContent, // Mock the file directly
            },
        })
    })

    it('should return parsed CSV data when files exist', async () => {
        const response = GET()
        const data = await response.json()
        expect(response.status).toBe(200)
        expect(data.jobs).toEqual({
            [mockFileName]: [{ header1: 'value1', header2: 'value2' }],
        })
    })

    it('should return empty jobs when the directory does not exist', async () => {
        // Simulate the directory not existing by removing it from mockFs
        mockFs({
            [UPLOAD_DIR]: {},
        })

        const response = GET()
        const data = await response.json()

        // Verify the response is an empty object
        expect(response.status).toBe(200)
        expect(data.jobs).toEqual({})
    })
})
