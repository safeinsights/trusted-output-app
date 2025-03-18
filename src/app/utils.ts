import path from 'path'
import fs from 'fs'
import os from 'os'
import jwt from 'jsonwebtoken'
import { validate as uuidValidate } from 'uuid'

export const UPLOAD_DIR = path.resolve(os.tmpdir(), 'public/uploads')

export const createUploadDirIfNotExists = () => {
    log(`Creating upload directory at ${UPLOAD_DIR}`)
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }
}

export const saveFile = async (file: Blob, jobId: string) => {
    createUploadDirIfNotExists()
    log(`Saving file for job ID: ${jobId}`)
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(path.resolve(UPLOAD_DIR, jobId), buffer)
}

export const deleteFile = async (jobId: string) => {
    createUploadDirIfNotExists()
    log(`Deleting file for job ID: ${jobId}`)
    fs.unlinkSync(path.resolve(UPLOAD_DIR, jobId))
}

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
    } else if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
        console[level](`[${level.toUpperCase()}] - ${message}`)
    }
}

export const ensureValue = <T>(value: T | undefined | null, message?: string): T => {
    if (value === undefined || value === null) {
        throw new Error(message || `Value is ${value}`)
    }
    return value
}
