import jwt from 'jsonwebtoken'
import { validate as uuidValidate } from 'uuid'

export const REQUIRED_ENV_VARS = [
    'MANAGEMENT_APP_API_URL',
    'MANAGEMENT_APP_MEMBER_ID',
    'MANAGEMENT_APP_PRIVATE_KEY',
] as const

const isSet = (value: string | undefined): value is string => Boolean(value)

const missingEnvError = (missing: readonly string[]): Error =>
    new Error(`Missing required environment variable${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}`)

export const requiredEnv = (name: (typeof REQUIRED_ENV_VARS)[number]): string => {
    const value = process.env[name]
    if (!isSet(value)) {
        throw missingEnvError([name])
    }
    return value
}

export const assertRequiredEnv = (): void => {
    const missing = REQUIRED_ENV_VARS.filter((name) => !isSet(process.env[name]))
    if (missing.length > 0) {
        throw missingEnvError(missing)
    }
}

export const generateAuthorizationHeaders = () => {
    log('BMA: Generating authorization headers')
    const token = jwt.sign(
        { iss: requiredEnv('MANAGEMENT_APP_MEMBER_ID') },
        requiredEnv('MANAGEMENT_APP_PRIVATE_KEY'),
        {
            algorithm: 'RS256',
            expiresIn: 60,
        },
    )
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
