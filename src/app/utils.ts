import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'public/uploads')

export const createUploadDirIfNotExists = async () => {
    try {
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR)
        }
    } catch (err) {
        console.error('Error creating directory:', err)
    }
}

export const listFiles = async () => {
    let files: string[] = []
    let error: string | null = null
    await createUploadDirIfNotExists()

    try {
        files = fs.readdirSync(UPLOAD_DIR)
    } catch (err) {
        console.error('Error reading files:', err)
        error = 'Could not read files.'
    }

    return { files, error }
}

export const loadMetadata = async () => {
    let metadata : any = []
    let metadataPath = path.resolve(UPLOAD_DIR, `metadata.json`)
    if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
    }
    return metadata
}

export const getFileExtension = (filename: string) => {
    const parts = filename.split('.')
    return parts.length > 1 ? parts.pop()?.toUpperCase() : "N/A"
}

export const saveMetadata = async (file: Blob, name: string, time: string, generatedName: string, data: any ) => {
    let info = JSON.parse(data) || undefined

    const uploaded_metadata = {
        researcher : info?.researcher || 'Unknown',
        study : info?.study || 'Unknown',
        name: name,
        size: file.size,
        mimeType: file.type,
        time: time,
        fileType: getFileExtension(name),
        savedFile: generatedName,
    }
    let metadata = await loadMetadata()
    metadata.push(uploaded_metadata)
    let metadataPath = path.resolve(UPLOAD_DIR, `metadata.json`)
    try{
        fs.writeFileSync(metadataPath, JSON.stringify(metadata))
    } catch (err) {
        console.error('Error writing metadata:', err)
    }
    return metadata
}

export const saveFile = async (file: Blob, name: string, data: any) => {
    let randomName = uuidv4()
    await createUploadDirIfNotExists()
    await saveMetadata(file, name, new Date().toISOString(), randomName, data)
    const buffer = Buffer.from(await file.arrayBuffer())
    try{
        fs.writeFileSync(path.resolve(UPLOAD_DIR, randomName), buffer)
    } catch (err) {
        console.error('Error writing file:', err)
    }
}

export const parseCSV = (data: string) => {
    let lines = data.split('\n')
    let headers = lines[0].split(';')
    let result = []
    for (let i = 1; i < lines.length; i++) {
        let obj : any = { tableCounter: i}
        let currentline = lines[i].split(';')
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j]
        }
        result.push(obj)
    }
    return {
        headers: headers,
        data: result
    }
}

export const parseData = (metadata:any, data: string, filename:string) => {
    let props = metadata.find((file:any) => file.savedFile === filename)
    if (props?.fileType === 'CSV') {
        return parseCSV(data)
    }
    return data
}

export const loadResearchForReview = async (savedFileName: string) => {
    let result: string = "The Research Results are not available"
    let filePath = path.resolve(UPLOAD_DIR, savedFileName)
    if (fs.existsSync(filePath)) {
        result = fs.readFileSync(filePath, 'utf8')
    }
    return parseData(await loadMetadata(), result, savedFileName)
}
export const approveReasearch = async (savedFileName: string) => {
    console.log('Approving research:', savedFileName)
    let metadata = await loadMetadata()
    let file = metadata.find((file:any) => file.savedFile === savedFileName)
    if (file) {
        file.status = "Approved"
    }
    let metadataPath = path.resolve(UPLOAD_DIR, `metadata.json`)
    try{
        fs.writeFileSync(metadataPath, JSON.stringify(metadata))
    } catch (err) {
        console.error('Error writing metadata:', err)
    }
}
