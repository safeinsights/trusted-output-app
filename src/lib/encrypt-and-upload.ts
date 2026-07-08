import { isValidUUID, log, ensureValue } from '@/lib/utils'
import { json } from '@/http/json'
import type { RouteHandler } from '@/http/router'
import { getPublicKeys, uploadResults } from '@/lib/management-app-requests'
import { encryptResults, type EncryptableFile } from '@/lib/encrypt-results'

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

export const createEncryptAndUploadHandler = (config: UploadHandlerConfig): RouteHandler => {
    const { fileType } = config
    const formDataKey = formDataKeys[fileType]
    const label = fileType === 'result' ? 'results' : 'logs'

    return async (req, params) => {
        const formData = await req.formData()
        const jobId = params.jobId

        log(`Received ${label} upload request for jobId ${jobId}`)

        if (!isValidUUID(jobId)) {
            log('jobId is not a UUID', 'error')
            return json({ error: 'jobId is not a UUID' }, 400)
        }

        let files: EncryptableFile[]

        if (config.fileType === 'log') {
            const body = Object.fromEntries(formData)

            if (!(formDataKey in body)) {
                const msg = `Form data does not include expected ${formDataKey} key`
                log(msg, 'error')
                return json({ error: msg }, 400)
            }

            if (Object.keys(body).length !== 1) {
                log('Form data includes unexpected data keys', 'error')
                return json({ error: 'Form data includes unexpected data keys' }, 400)
            }

            files = await config.extractPayloads(body)
        } else {
            files = await config.extractPayloads(formData)
        }

        if (files.length === 0) {
            const msg = `No ${label} provided`
            log(msg, 'error')
            return json({ error: msg }, 400)
        }

        const publicKeys = ensureValue(await getPublicKeys(jobId))

        if (publicKeys.keys.length === 0) {
            const msg = 'No public keys found for job ID: ' + jobId
            log(msg, 'error')
            return json({ error: msg }, 400)
        }

        log(`Encrypting ${label} with public keys ...`)
        const encrypted = await encryptResults(files, publicKeys.keys)
        const response = await uploadResults(jobId, encrypted, 'application/zip', fileType)

        if (!response.ok) {
            const msg = `Failed to post encrypted ${label}: ${response.status}`
            log(msg, 'error')
            return json({ error: msg }, 400)
        }

        return json({}, 200)
    }
}
