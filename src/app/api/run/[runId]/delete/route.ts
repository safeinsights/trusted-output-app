import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { loadMetadata, metadataPath, UPLOAD_DIR } from '@/app/utils'
import { unlinkSync } from 'node:fs'

export const POST = async (req: NextRequest, {params}: { params: { runId: string } }) => {
    const runId = params.runId

    if (!runId) {
        return NextResponse.json({ error: 'Missing runId' }, { status: 400 })
    }

    let metadata = await loadMetadata()
    const runToDeleteIndex = metadata.findIndex((metadata: any) => metadata.runId === runId)
    if (runToDeleteIndex !== -1) {
        metadata.splice(runToDeleteIndex, 1)
    }
    // Remove deleted file from metadata
    fs.writeFileSync(metadataPath, JSON.stringify(metadata))

    // Delete the run file itself
    const filePath = path.resolve(UPLOAD_DIR, runId)
    try {
        unlinkSync(filePath)
    } catch (err) {
        return NextResponse.json({ status: 400 })
    }

    return NextResponse.json({
        success: true,
    })
}
