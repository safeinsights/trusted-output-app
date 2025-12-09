import {
    createUploadDirIfNotExists,
    deleteFile,
    generateAuthorizationHeaders,
    isValidUUID,
    saveFile,
    UPLOAD_DIR,
} from './utils'
import mockFs from 'mock-fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import { describe, expect, it, vi } from 'vitest'
import fs from 'fs'
import { v4 } from 'uuid'

describe('Utils', () => {
    describe('createUploadDirIfNotExists', () => {
        it('should create the upload directory if it does not exist', async () => {
            // Ensure the directory does not exist
            mockFs({})
            expect(() => fs.statSync(UPLOAD_DIR)).toThrow()

            createUploadDirIfNotExists()

            // Verify the directory was created
            expect(fs.statSync(UPLOAD_DIR).isDirectory()).toBe(true)
        })
    })

    describe('saveFile', () => {
        it('should save the file to the correct path', async () => {
            const file = new Blob(['test file content'], { type: 'text/plain' })
            const jobId = v4()

            await saveFile(file, jobId)

            // Verify the file is saved at the expected path
            const filePath = path.resolve(UPLOAD_DIR, jobId)
            expect(fs.existsSync(filePath)).toBe(true)

            // Verify the content of the file
            const content = fs.readFileSync(filePath, 'utf8')
            expect(content).toBe('test file content')
        })
    })

    describe('deleteFile', () => {
        it('should delete the file from the correct path', async () => {
            const mockFileContent = 'header1,header2\nvalue1,value2'
            const mockFileName = 'test.csv'

            // Mock the file system with the necessary file
            mockFs({
                [UPLOAD_DIR]: {
                    [mockFileName]: mockFileContent,
                },
            })

            // Verify the file exists
            const filePath = path.resolve(UPLOAD_DIR, mockFileName)
            expect(fs.existsSync(filePath)).toBe(true)

            // Now delete the file
            await deleteFile(mockFileName)

            // Verify the file was deleted
            expect(fs.existsSync(filePath)).toBe(false)
        })
    })

    describe('generateAuthorizationHeaders', () => {
        it('should generate a valid Authorization header with JWT', () => {
            const privateKey = 'private-key'
            const memberId = 'member-id'
            process.env.MANAGEMENT_APP_PRIVATE_KEY = privateKey
            process.env.MANAGEMENT_APP_MEMBER_ID = memberId
            // @ts-expect-error seems to be a unique TypeScript error that isn't real
            const tokenSpy = vi.spyOn(jwt, 'sign').mockReturnValueOnce('mock-jwt-token')

            const headers = generateAuthorizationHeaders()

            expect(headers).toEqual({
                Authorization: 'Bearer mock-jwt-token',
            })
            expect(tokenSpy).toHaveBeenCalledWith({ iss: memberId }, privateKey, { algorithm: 'RS256', expiresIn: 60 })
        })

        it('should return an empty Authorization header if privateKey or memberId is missing', () => {
            delete process.env.MANAGEMENT_APP_PRIVATE_KEY
            delete process.env.MANAGEMENT_APP_MEMBER_ID

            const headers = generateAuthorizationHeaders()

            expect(headers).toEqual({
                Authorization: 'Bearer ',
            })
        })
    })

    describe('isValidUUID', () => {
        it('should return false on an invalid UUID', () => {
            expect(isValidUUID('123')).toBe(false)
        })

        it('should return true on a valid UUID', () => {
            expect(isValidUUID('a9bcdef7-575e-4083-8fbf-e1a743f29f24')).toBe(true)
        })
    })
})
