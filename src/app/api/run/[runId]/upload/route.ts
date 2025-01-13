import { NextRequest, NextResponse } from 'next/server'
import { saveFile, UPLOAD_DIR, isValidUUID, log } from '@/app/utils'
import path from 'path'
import fs from 'fs'

function isFile(obj: FormDataEntryValue): obj is File {
    return obj instanceof File
}

export const POST = async (req: NextRequest, { params }: { params: Promise<{ runId: string }> }) => {
    const formData = await req.formData()
    const body = Object.fromEntries(formData)
    const runId = (await params).runId
    let errorMessage = ''

    if (!runId) {
        errorMessage = 'Missing runId'
    } else if (!isValidUUID(runId)) {
        errorMessage = 'runId is not a UUID'
    } else if (!('file' in body)) {
        errorMessage = 'Form data does not include expected file key'
    } else if (Object.keys(body).length !== 1) {
        errorMessage = 'Form data includes unexpected data keys'
    }
    const filePath = path.join(UPLOAD_DIR, runId)
    if (fs.existsSync(filePath)) {
        errorMessage = 'Data already exists for runId'
    }
    if (errorMessage.length == 0 && 'file' in body && isFile(body.file)) {
        await saveFile(body.file, runId)
        return NextResponse.json({}, { status: 200 })
    }
    log(errorMessage, 'error')
    return NextResponse.json({}, { status: 400 })
}
