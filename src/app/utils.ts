import path from 'path'
import fs from 'fs'
import os from 'os'

export const UPLOAD_DIR = path.resolve(os.tmpdir(), 'public/uploads')

export const createUploadDirIfNotExists = async () => {
    try {
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR)
        }
    } catch (err) {
        console.error('Error creating directory:', err)
    }
}

export const saveFile = async (file: Blob, runId: string) => {
    await createUploadDirIfNotExists()
    const buffer = Buffer.from(await file.arrayBuffer())
    try {
        fs.writeFileSync(path.resolve(UPLOAD_DIR, `${runId}.csv`), buffer)
    } catch (err) {
        console.error('Error writing file:', err)
    }
}

export const deleteFile = async (runId: string) => {
    await createUploadDirIfNotExists()
    try {
        fs.unlinkSync(path.resolve(UPLOAD_DIR, `${runId}.csv`))
    } catch (err) {
        console.error('Error writing file:', err)
    }
}
