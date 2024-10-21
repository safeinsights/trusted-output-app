import { NextRequest, NextResponse } from 'next/server'
import { deleteFile, generateAuthorizationHeaders, UPLOAD_DIR } from '@/app/utils'
import path from 'path'
import fs from 'fs'

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
    const filePath = path.join(UPLOAD_DIR, runId)
    if (fs.existsSync(filePath)) {

        const fileBuffer = await fs.promises.readFile(filePath)

        const formData = new FormData()
        formData.append('file', new File([fileBuffer], runId, { type: 'text/csv' }))

        const endpoint = `${process.env.MANAGEMENT_APP_API_URL}/api/run/${runId}/results`
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                ...generateAuthorizationHeaders(),
            },
        })

        if (!response.ok) {
            return NextResponse.json({ error: 'Unable to post file' }, { status: 500 })
        }

        await deleteFile(runId)
    }

    return NextResponse.json({
        success: true,
    })
}
