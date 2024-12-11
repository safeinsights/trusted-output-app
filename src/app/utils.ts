import path from 'path'
import fs from 'fs'
import os from 'os'
import jwt from 'jsonwebtoken'

export const UPLOAD_DIR = path.resolve(os.tmpdir(), 'public/uploads')

export const createUploadDirIfNotExists = () => {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }
}

export const saveFile = async (file: Blob, runId: string) => {
    createUploadDirIfNotExists()
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(path.resolve(UPLOAD_DIR, runId), buffer)
}

export const deleteFile = async (runId: string) => {
    createUploadDirIfNotExists()
    fs.unlinkSync(path.resolve(UPLOAD_DIR, runId))
}

export const generateAuthorizationHeaders = () => {
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
            { algorithm: 'RS256' },
        )
    }
    return {
        Authorization: `Bearer ${token}`,
    }
}
