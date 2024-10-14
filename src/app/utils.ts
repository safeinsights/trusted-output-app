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

export const loadMetadata = async () => {
    let metadata: any = []
    let metadataPath = path.resolve(UPLOAD_DIR, `metadata.json`)
    if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
    }
    return metadata
}

export const getFileExtension = (filename: string) => {
    const parts = filename.split('.')
    return parts.length > 1 ? parts.pop()?.toUpperCase() : 'N/A'
}

// TODO Override runID if already exists
export const saveMetadata = async (file: Blob, name: string, runId: string) => {
    const uploaded_metadata = {
        runId: runId,
        name: name,
        size: file.size,
        mimeType: file.type,
        time: new Date().toISOString(),
        fileType: getFileExtension(name),
    }
    let metadata = await loadMetadata()
    metadata.push(uploaded_metadata)
    let metadataPath = path.resolve(UPLOAD_DIR, `metadata.json`)
    try {
        fs.writeFileSync(metadataPath, JSON.stringify(metadata))
    } catch (err) {
        console.error('Error writing metadata:', err)
    }
    return metadata
}

export const saveFile = async (file: Blob, name: string, runId: string) => {
    await createUploadDirIfNotExists()
    await saveMetadata(file, name, runId)
    const buffer = Buffer.from(await file.arrayBuffer())
    try {
        fs.writeFileSync(path.resolve(UPLOAD_DIR, String(runId)), buffer)
    } catch (err) {
        console.error('Error writing file:', err)
    }
}

export const parseCSV = (data: string) => {
    let lines = data.split('\n')
    let headers = lines[0].split(',')
    let result = []
    for (let i = 1; i < lines.length; i++) {
        let obj: any = { tableCounter: i }
        let currentline = lines[i].split(',')
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j]
        }
        result.push(obj)
    }
    return {
        headers: headers,
        data: result,
    }
}

export const parseData = (metadata: any, data: string, runId: string) => {
    let props = metadata.find((file: any) => file.runId === runId)
    if (props?.fileType === 'CSV') {
        return parseCSV(data)
    }
    return data
}

export const loadResearchForReview = async (runId: string) => {
    let result: string = 'The Research Results are not available'
    let filePath = path.resolve(UPLOAD_DIR, runId)
    if (fs.existsSync(filePath)) {
        result = fs.readFileSync(filePath, 'utf8')
    }
    return parseData(await loadMetadata(), result, runId)
}

export const approveResearch = async (runId: string) => {
    let metadata = await loadMetadata()
    let file = metadata.find((file: any) => file.runId === runId)
    if (file) {
        file.status = 'Approved'
    }
    let metadataPath = path.resolve(UPLOAD_DIR, `metadata.json`)
    try {
        fs.writeFileSync(metadataPath, JSON.stringify(metadata))
    } catch (err) {
        console.error('Error writing metadata:', err)
    }
}
