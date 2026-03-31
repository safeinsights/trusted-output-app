import { ManagementAppPublicKey } from '@/app/management-app-requests'
import type { PublicKey } from 'si-encryption/job-results/types'
import { ResultsWriter } from 'si-encryption/job-results/writer'

export type EncryptableFile = { name: string; data: ArrayBuffer }

export const encryptResults = async (files: EncryptableFile[], publicKeys: ManagementAppPublicKey[]): Promise<Blob> => {
    const writerParams = publicKeys.map((key) => {
        return { fingerprint: key.fingerprint, publicKey: new Uint8Array(key.publicKey.data).buffer } as PublicKey
    })
    const writer = new ResultsWriter(writerParams)

    for (const file of files) {
        await writer.addFile(file.name, file.data)
    }

    const encryptedResults: Blob = await writer.generate()
    return encryptedResults
}
