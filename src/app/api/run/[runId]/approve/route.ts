import { deleteFile, generateAuthorizationHeaders, log, UPLOAD_DIR } from '@/app/utils'
import fs from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function POST(request: NextRequest, { params }: { params: Promise<{ runId: string }> }) {
    const runId = (await params).runId

    if (!runId) {
        return NextResponse.json({ error: 'Missing runId' }, { status: 400 })
    }
    log(`Retrieving results for run ID: ${runId}`)
    const filePath = path.join(UPLOAD_DIR, runId)
    if (fs.existsSync(filePath)) {
        const fileBuffer = await fs.promises.readFile(filePath)

        const formData = new FormData()
        formData.append('file', new File([fileBuffer], runId, { type: 'text/csv' }))

        const endpoint = `${process.env.MANAGEMENT_APP_API_URL}/api/run/${runId}/results`
        log(`BMA: Uploading results ${endpoint}`)
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                ...generateAuthorizationHeaders(),
            },
        })

        if (!response.ok) {
            log(`BMA: Unable to post file for run ID ${runId}`, 'error')
            return NextResponse.json({ error: 'Unable to post file' }, { status: 500 })
        }

        await deleteFile(runId)
        return NextResponse.json({ success: true }, { status: 200 })
    }

    return NextResponse.json({ error: 'No file exists to delete' }, { status: 404 })
}
