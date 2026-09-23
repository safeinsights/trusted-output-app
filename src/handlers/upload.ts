import { createEncryptAndUploadHandler } from '@/handlers/encrypt-and-upload'

export const uploadResults = createEncryptAndUploadHandler({
    fileType: 'result',
    extractPayloads: async (formData) => {
        const entries = formData.getAll('file')
        const files = entries.filter((e): e is File => e instanceof File)
        return Promise.all(files.map(async (f) => ({ name: f.name, data: await f.arrayBuffer() })))
    },
})
