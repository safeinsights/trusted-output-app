import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { UPLOAD_DIR } from '@/app/utils'
import { unlinkSync } from 'node:fs'

// TODO This component will do two things
//  1. Post the file to the management API
//  2. If the management call is successful, we will delete the file from our filesystem
//  2.a If unsuccessful - show appropriate error message?
export const POST = async (req: NextRequest, { params }: { params: { runId: string } }) => {
    const runId = params.runId

    if (!runId) {
        return NextResponse.json({ error: 'Missing runId' }, { status: 400 })
    }

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
