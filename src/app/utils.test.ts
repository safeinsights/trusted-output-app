import {
    generateAuthorizationHeaders,
    isValidUUID,
} from './utils'
import jwt from 'jsonwebtoken'
import { describe, expect, it, vi } from 'vitest'

describe('Utils', () => {
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
