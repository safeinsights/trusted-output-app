import { NextRequest, NextResponse } from 'next/server'
import { saveFile } from '@/app/utils'

function isFile(obj: any): obj is File {
    return obj instanceof File
}

export const POST = async (req: NextRequest, { params }: { params: { runId: string } }) => {
    const formData = await req.formData()
    const body = Object.fromEntries(formData)
    const runId = params.runId

    if (!runId) {
        return NextResponse.json({ error: 'Missing runId' }, { status: 400 })
    }

    if ('file' in body && isFile(body.file)) {
        await saveFile(body.file, runId)
        return NextResponse.json({}, { status: 200 })
    }

    return NextResponse.json({}, { status: 400 })
}
