import { uploadResults } from '@/app/management-app-requests'
import { deleteFile, log, UPLOAD_DIR } from '@/app/utils'
import fs from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function POST(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
    const jobId = (await params).jobId

    if (!jobId) {
        return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })
    }
    log(`Retrieving results for job ID: ${jobId}`)
    const filePath = path.join(UPLOAD_DIR, jobId)
    if (fs.existsSync(filePath)) {
        const fileBuffer = await fs.promises.readFile(filePath)

        const response = await uploadResults(jobId, fileBuffer, 'text/csv')

        if (!response.ok) {
            log(`BMA: Unable to post file for job ID ${jobId}`, 'error')
            return NextResponse.json({ error: 'Unable to post file' }, { status: 500 })
        }

        await deleteFile(jobId)
        return NextResponse.json({ success: true }, { status: 200 })
    }

    return NextResponse.json({ error: 'No file exists to delete' }, { status: 404 })
}
