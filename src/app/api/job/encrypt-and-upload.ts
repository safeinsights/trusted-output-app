import { isValidUUID, log, ensureValue } from '@/app/utils'
import { NextRequest, NextResponse } from 'next/server'
import { getPublicKeys, uploadResults } from '@/app/management-app-requests'
import { encryptResults } from '@/app/api/job/encrypt-results'

type FileType = 'result' | 'log'

const formDataKeys: Record<FileType, string> = {
    result: 'file',
    log: 'logs',
}

interface UploadHandlerConfig {
    fileType: FileType
    extractPayload: (_body: Record<string, FormDataEntryValue>) => ArrayBuffer | Promise<ArrayBuffer>
}

export const createEncryptAndUploadHandler = (config: UploadHandlerConfig) => {
    const { fileType, extractPayload } = config
    const formDataKey = formDataKeys[fileType]
    const label = fileType === 'result' ? 'results' : 'logs'

    return async (req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) => {
        const [formData, { jobId }] = await Promise.all([req.formData(), params])
        const body = Object.fromEntries(formData)

        log(`Received ${label} upload request for jobId ${jobId}`)

        if (!isValidUUID(jobId)) {
            log('jobId is not a UUID', 'error')
            return NextResponse.json({ error: 'jobId is not a UUID' }, { status: 400 })
        }

        if (!(formDataKey in body)) {
            const msg = `Form data does not include expected ${formDataKey} key`
            log(msg, 'error')
            return NextResponse.json({ error: msg }, { status: 400 })
        }

        if (Object.keys(body).length !== 1) {
            log('Form data includes unexpected data keys', 'error')
            return NextResponse.json({ error: 'Form data includes unexpected data keys' }, { status: 400 })
        }

        const publicKeys = ensureValue(await getPublicKeys(jobId))

        if (publicKeys.keys.length === 0) {
            const msg = 'No public keys found for job ID: ' + jobId
            log(msg, 'error')
            return NextResponse.json({ error: msg }, { status: 400 })
        }

        log(`Encrypting ${label} with public keys ...`)
        const payload = await extractPayload(body)
        const encrypted = await encryptResults(jobId, payload, publicKeys.keys)
        const response = await uploadResults(jobId, encrypted, 'application/zip', fileType)

        if (!response.ok) {
            const msg = `Failed to post encrypted ${label}: ${response.status}`
            log(msg, 'error')
            return NextResponse.json({ error: msg }, { status: 400 })
        }

        return NextResponse.json({}, { status: 200 })
    }
}
