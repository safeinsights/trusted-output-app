import { isValidUUID, log, saveFile, UPLOAD_DIR } from '@/app/utils'
import fs from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

function isFile(obj: FormDataEntryValue): obj is File {
    return obj instanceof File
}

export const POST = async (req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) => {
    const formData = await req.formData()
    const body = Object.fromEntries(formData)
    const jobId = (await params).jobId
    let errorMessage = ''

    if (!jobId) {
        errorMessage = 'Missing jobId'
    } else if (!isValidUUID(jobId)) {
        errorMessage = 'jobId is not a UUID'
    } else if (!('file' in body)) {
        errorMessage = 'Form data does not include expected file key'
    } else if (Object.keys(body).length !== 1) {
        errorMessage = 'Form data includes unexpected data keys'
    }
    const filePath = path.join(UPLOAD_DIR, jobId)
    if (fs.existsSync(filePath)) {
        errorMessage = 'Data already exists for jobId'
    }
    if (errorMessage.length == 0 && 'file' in body && isFile(body.file)) {
        await saveFile(body.file, jobId)
        return NextResponse.json({}, { status: 200 })
    }
    log(errorMessage, 'error')
    return NextResponse.json({ error: errorMessage }, { status: 400 })
}
