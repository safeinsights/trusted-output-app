import { createEncryptAndUploadHandler } from '@/lib/encrypt-and-upload'

export const uploadResultFiles = createEncryptAndUploadHandler({
    fileType: 'result',
    extractPayloads: async (formData) => {
        const files = [...formData.values()].filter((e): e is File => e instanceof File)
        return Promise.all(files.map(async (f) => ({ name: f.name, data: await f.arrayBuffer() })))
    },
})
