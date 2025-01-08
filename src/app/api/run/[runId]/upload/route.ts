import { NextRequest, NextResponse } from 'next/server'
import { saveFile, UPLOAD_DIR, isValidUUID } from '@/app/utils'
import path from 'path'
import fs from 'fs'

function isFile(obj: FormDataEntryValue): obj is File {
    return obj instanceof File
}

export const POST = async (req: NextRequest, { params }: { params: Promise<{ runId: string }> }) => {
    const formData = await req.formData()
    const body = Object.fromEntries(formData)
    const runId = (await params).runId

    if (!runId) {
        return NextResponse.json({ error: 'Missing runId' }, { status: 400 })
    }

    if (!isValidUUID(runId)) {
        return NextResponse.json({ error: 'runId is not a UUID' }, { status: 400 })
    }

    if (!('file' in body)) {
        return NextResponse.json({ error: 'Form data does not include expected file key' }, { status: 400 })
    }

    if (Object.keys(body).length !== 1) {
        return NextResponse.json({ error: 'Form data includes unexpected data keys' }, { status: 400 })
    }

    const filePath = path.join(UPLOAD_DIR, runId)
    if (fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'Data already exists for runId' }, { status: 400 })
    }

    if ('file' in body && isFile(body.file)) {
        await saveFile(body.file, runId)
        return NextResponse.json({}, { status: 200 })
    }

    return NextResponse.json({}, { status: 400 })
}
