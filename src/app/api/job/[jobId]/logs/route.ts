import { createEncryptAndUploadHandler } from '@/app/api/job/encrypt-and-upload'

export const POST = createEncryptAndUploadHandler({
    fileType: 'log',
    extractPayload: (body) => new TextEncoder().encode(body.logs as string).buffer as ArrayBuffer,
    extractPayloadName: (body) => {
        try {
            JSON.parse(body.logs as string)
            return 'logs.json'
        } catch {
            return 'logs.txt'
        }
    },
})
