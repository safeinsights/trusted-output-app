import { createUploadDirIfNotExists, saveFile, deleteFile, generateAuthorizationHeaders, UPLOAD_DIR } from './utils'
import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

describe('Utils', () => {
    beforeEach(() => {
        fs.rmSync(UPLOAD_DIR, { recursive: true, force: true })
    })

    afterEach(() => {
        fs.rmSync(UPLOAD_DIR, { recursive: true, force: true })
    })

    describe('createUploadDirIfNotExists', () => {
        it('should create the upload directory if it does not exist', async () => {
            // Ensure the directory does not exist
            expect(fs.existsSync(UPLOAD_DIR)).toBe(false)

            createUploadDirIfNotExists()

            // Verify the directory was created
            expect(fs.existsSync(UPLOAD_DIR)).toBe(true)
        })

        it('should not create the upload directory if it already exists', async () => {
            // Create the directory manually
            fs.mkdirSync(UPLOAD_DIR, { recursive: true })

            // Ensure the directory exists
            expect(fs.existsSync(UPLOAD_DIR)).toBe(true)

            // Try to create it again
            createUploadDirIfNotExists()

            // Verify the directory was not recreated
            const files = fs.readdirSync(UPLOAD_DIR)

            // No files should be added unexpectedly
            expect(files).toEqual([])
        })
    })

    describe('saveFile', () => {
        it('should save the file to the correct path', async () => {
            const file = new Blob(['test file content'], { type: 'text/plain' })
            const runId = 'test-run-id'

            await saveFile(file, runId)

            // Verify the file is saved at the expected path
            const filePath = path.resolve(UPLOAD_DIR, runId)
            expect(fs.existsSync(filePath)).toBe(true)

            // Clean up the file after the test
            fs.rmSync(filePath)
        })
    })

    describe('deleteFile', () => {
        it('should delete the file from the correct path', async () => {
            const file = new Blob(['test file content'], { type: 'text/plain' })
            const runId = 'test-run-id'

            // Save the file first
            await saveFile(file, runId)

            // Verify the file exists
            const filePath = path.resolve(UPLOAD_DIR, runId)
            expect(fs.existsSync(filePath)).toBe(true)

            // Now delete the file
            await deleteFile(runId)

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

            // @ts-ignore
            const tokenSpy = vi.spyOn(jwt, 'sign').mockReturnValueOnce('mock-jwt-token')

            const headers = generateAuthorizationHeaders()

            expect(headers).toEqual({
                Authorization: 'Bearer mock-jwt-token',
            })
            expect(tokenSpy).toHaveBeenCalledWith({ iss: memberId }, privateKey, { algorithm: 'RS256' })
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
})
