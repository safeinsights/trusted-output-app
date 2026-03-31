import { isValidUUID, log, ensureValue } from '@/app/utils'
import { NextRequest, NextResponse } from 'next/server'
import { getPublicKeys, uploadResults } from '@/app/management-app-requests'
import { encryptResults, type EncryptableFile } from '@/app/api/job/encrypt-results'

type FileType = 'result' | 'log'

const formDataKeys: Record<FileType, string> = {
    result: 'file',
    log: 'logs',
}

interface LogUploadHandlerConfig {
    fileType: 'log'
    extractPayloads: (_body: Record<string, FormDataEntryValue>) => EncryptableFile[] | Promise<EncryptableFile[]>
}

interface ResultUploadHandlerConfig {
    fileType: 'result'
    extractPayloads: (_formData: FormData) => EncryptableFile[] | Promise<EncryptableFile[]>
}

type UploadHandlerConfig = LogUploadHandlerConfig | ResultUploadHandlerConfig

export const createEncryptAndUploadHandler = (config: UploadHandlerConfig) => {
    const { fileType } = config
    const formDataKey = formDataKeys[fileType]
    const label = fileType === 'result' ? 'results' : 'logs'

    return async (req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) => {
        const [formData, { jobId }] = await Promise.all([req.formData(), params])

        log(`Received ${label} upload request for jobId ${jobId}`)

        if (!isValidUUID(jobId)) {
            log('jobId is not a UUID', 'error')
            return NextResponse.json({ error: 'jobId is not a UUID' }, { status: 400 })
        }

        let files: EncryptableFile[]

        if (config.fileType === 'log') {
            const body = Object.fromEntries(formData)

            if (!(formDataKey in body)) {
                const msg = `Form data does not include expected ${formDataKey} key`
                log(msg, 'error')
                return NextResponse.json({ error: msg }, { status: 400 })
            }

            if (Object.keys(body).length !== 1) {
                log('Form data includes unexpected data keys', 'error')
                return NextResponse.json({ error: 'Form data includes unexpected data keys' }, { status: 400 })
            }

            files = await config.extractPayloads(body)
        } else {
            const keys = [...formData.keys()]

            if (keys.length === 0) {
                const msg = `Form data does not include expected ${formDataKey} key`
                log(msg, 'error')
                return NextResponse.json({ error: msg }, { status: 400 })
            }

            if (!keys.every((k) => k === formDataKey)) {
                log('Form data includes unexpected data keys', 'error')
                return NextResponse.json({ error: 'Form data includes unexpected data keys' }, { status: 400 })
            }

            files = await config.extractPayloads(formData)
        }

        if (files.length === 0) {
            const msg = `No ${label} provided`
            log(msg, 'error')
            return NextResponse.json({ error: msg }, { status: 400 })
        }

        const publicKeys = ensureValue(await getPublicKeys(jobId))

        if (publicKeys.keys.length === 0) {
            const msg = 'No public keys found for job ID: ' + jobId
            log(msg, 'error')
            return NextResponse.json({ error: msg }, { status: 400 })
        }

        log(`Encrypting ${label} with public keys ...`)
        const encrypted = await encryptResults(files, publicKeys.keys)
        const response = await uploadResults(jobId, encrypted, 'application/zip', fileType)

        if (!response.ok) {
            const msg = `Failed to post encrypted ${label}: ${response.status}`
            log(msg, 'error')
            return NextResponse.json({ error: msg }, { status: 400 })
        }

        return NextResponse.json({}, { status: 200 })
    }
}
