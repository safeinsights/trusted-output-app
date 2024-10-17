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

        const fileContent = await fs.promises.readFile(filePath, 'utf-8')
        console.error('fileContent', fileContent)
        // TODO Create a parsable formData by the endpoint
        const data  = new FormData()
        data.append('file', new File([Uint8Array.from(fileContent.split(''), c => c.charCodeAt(0))], runId, { type: 'text/csv' }))
        console.error('data', data)
        const endpoint = `${process.env.MANAGEMENT_APP_API_URL}/api/run/${process.env.MANAGEMENT_APP_MEMBER_ID}/results`
        const request = new Request(endpoint, {
            method: 'POST',
            body: data,
            headers:{ ...generateAuthorizationHeaders(),
                'Content-Type': 'multipart/form-data'
            },
        })

        const response  = await fetch(request)
        if (!response.ok) {
            return NextResponse.json({ error: 'Unable to post file' }, { status: 500 })
        }

        await deleteFile(runId)
    }

    return NextResponse.json({
        success: true,
    })
}
