import { createEncryptAndUploadHandler } from '@/app/api/job/encrypt-and-upload'

export const POST = createEncryptAndUploadHandler({
    fileType: 'log',
    extractPayloads: (body) => {
        const content = new TextEncoder().encode(body.logs as string).buffer as ArrayBuffer
        let name: string
        try {
            JSON.parse(body.logs as string)
            name = 'logs.json'
        } catch {
            name = 'logs.txt'
        }
        return [{ name, data: content }]
    },
})
