import { NextRequest, NextResponse } from 'next/server'
import { deleteFile } from '@/app/utils'

// TODO This component will do two things
//  1. Post the file to the management API
//  2. If the management call is successful, we will delete the file from our filesystem
//  2.a If unsuccessful - show appropriate error message?
// To be done in https://openstax.atlassian.net/browse/SHRMP-21
export const POST = async (req: NextRequest, { params }: { params: { runId: string } }) => {
    const runId = params.runId

    if (!runId) {
        return NextResponse.json({ error: 'Missing runId' }, { status: 400 })
    }

    await deleteFile(runId)

    return NextResponse.json({
        success: true,
    })
}
