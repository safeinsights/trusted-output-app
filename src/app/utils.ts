import jwt from 'jsonwebtoken'
import { validate as uuidValidate } from 'uuid'

export const generateAuthorizationHeaders = () => {
    log('BMA: Generating authorization headers')
    // Generate JWT token
    const privateKey = process.env.MANAGEMENT_APP_PRIVATE_KEY
    const memberId = process.env.MANAGEMENT_APP_MEMBER_ID
    let token = ''
    if (privateKey && memberId) {
        token = jwt.sign(
            {
                iss: memberId,
            },
            privateKey,
            { algorithm: 'RS256', expiresIn: 60 },
        )
    }
    return {
        Authorization: `Bearer ${token}`,
    }
}

export const isValidUUID = (value: string): boolean => {
    return uuidValidate(value)
}

export const log = (message: string, level: 'info' | 'error' = 'info', error: Error | undefined = undefined) => {
    if (error) {
        console.error(`[${level.toUpperCase()}] - ${message} - ${error.message}`)
    } else {
        console[level](`[${level.toUpperCase()}] - ${message}`)
    }
}

export const ensureValue = <T>(value: T | undefined | null, message?: string): T => {
    if (value === undefined || value === null) {
        throw new Error(message || `Value is ${value}`)
    }
    return value
}
