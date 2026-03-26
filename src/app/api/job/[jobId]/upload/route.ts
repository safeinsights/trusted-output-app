import { createEncryptAndUploadHandler } from '@/app/api/job/encrypt-and-upload'

export const POST = createEncryptAndUploadHandler({
    fileType: 'result',
    extractPayload: (body) => (body.file as Blob).arrayBuffer(),
    extractPayloadName: (body) => (body.file as File).name,
})
