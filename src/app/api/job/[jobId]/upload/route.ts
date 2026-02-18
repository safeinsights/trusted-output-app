import { isValidUUID, log, ensureValue } from '@/app/utils'
import { NextRequest, NextResponse } from 'next/server'
import { getPublicKeys, ManagementAppPublicKey, uploadResults } from '@/app/management-app-requests'
import type { PublicKey } from 'si-encryption/job-results/types'
import { ResultsWriter } from 'si-encryption/job-results/writer'

const encryptResults = async (
    jobId: string,
    jobResults: ArrayBuffer,
    publicKeys: ManagementAppPublicKey[],
): Promise<Blob> => {
    const writerParams = publicKeys.map((key) => {
        return { fingerprint: key.fingerprint, publicKey: new Uint8Array(key.publicKey.data).buffer } as PublicKey
    })
    const writer = new ResultsWriter(writerParams)

    await writer.addFile(jobId, jobResults)

    const encryptedResults: Blob = await writer.generate()
    return encryptedResults
}

export const POST = async (req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) => {
    const formData = await req.formData()
    const body = Object.fromEntries(formData)
    const jobId = (await params).jobId
    let errorMessage = ''

    log(`Received results upload request for jobId ${jobId}`)

    if (!jobId) {
        errorMessage = 'Missing jobId'
    } else if (!isValidUUID(jobId)) {
        errorMessage = 'jobId is not a UUID'
    } else if (!('file' in body)) {
        errorMessage = 'Form data does not include expected file key'
    } else if (Object.keys(body).length !== 1) {
        errorMessage = 'Form data includes unexpected data keys'
    }

    if (errorMessage.length > 0) {
        log(errorMessage, 'error')
        return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const publicKeys = ensureValue(await getPublicKeys(jobId))

    if (publicKeys.keys.length === 0) {
        errorMessage = 'No public keys found for job ID: ' + jobId
        log(errorMessage, 'error')
        return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    log('Encrypting results with public keys ...')
    const data = body.file as Blob
    const resultsBuffer = await data.arrayBuffer()
    const encryptedResults = await encryptResults(jobId, resultsBuffer, publicKeys.keys)
    const response = await uploadResults(jobId, encryptedResults, 'application/zip', 'result')

    if (!response.ok) {
        errorMessage = `Failed to post encrypted results: ${response.status}`
        log(errorMessage, 'error')
        return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    return NextResponse.json({}, { status: 200 })
}
