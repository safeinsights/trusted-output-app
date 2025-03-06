import { isValidUUID, log, saveFile, UPLOAD_DIR, ensureValue, generateAuthorizationHeaders } from '@/app/utils'
import fs from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { encryptResults, getPublicKeys } from '@/encrypt'

function isFile(obj: FormDataEntryValue): obj is File {
    return obj instanceof File
}

export const POST = async (req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) => {
    const formData = await req.formData()
    const body = Object.fromEntries(formData)
    const jobId = (await params).jobId
    let errorMessage = ''

    if (!jobId) {
        errorMessage = 'Missing jobId'
    } else if (!isValidUUID(jobId)) {
        errorMessage = 'jobId is not a UUID'
    } else if (!('file' in body)) {
        errorMessage = 'Form data does not include expected file key'
    } else if (Object.keys(body).length !== 1) {
        errorMessage = 'Form data includes unexpected data keys'
    }

    log("Getting public keys ...")
    let publicKeys = await getPublicKeys(jobId)
    publicKeys = ensureValue(publicKeys)
    if (publicKeys.keys.length === 0) {
        log('No public keys found for job ID: ' + jobId)
        log('Legacy approval: Saving results in memory ...')
        const filePath = path.join(UPLOAD_DIR, jobId)
        if (fs.existsSync(filePath)) {
            errorMessage = 'Data already exists for jobId'
        }
        if (errorMessage.length == 0 && 'file' in body && isFile(body.file)) {
            await saveFile(body.file, jobId)
            return NextResponse.json({}, { status: 200 })
        }
    } else {
        log('Encrypting results with public keys ...')
        const resultsBuffer = Buffer.from(await body.file.arrayBuffer())
        const encryptedResults = await encryptResults(jobId, resultsBuffer, publicKeys.keys)
        const formData = new FormData()
        formData.append('file', new File([encryptedResults], jobId, { type: 'application/zip' }))
        const endpoint = `${process.env.MANAGEMENT_APP_API_URL}/api/job/${jobId}/results`
        log(`BMA: Uploading encrypted results ${endpoint}`)
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                ...generateAuthorizationHeaders(),
            },
        })
        if (!response.ok) {
            errorMessage = `Failed to post encrypted results: ${response.status}`
        } else {
            return NextResponse.json({}, { status: 200 })
        }
    }

    log(errorMessage, 'error')
    return NextResponse.json({ error: errorMessage }, { status: 400 })
}
