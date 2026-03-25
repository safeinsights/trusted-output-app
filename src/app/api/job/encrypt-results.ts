import { ManagementAppPublicKey } from '@/app/management-app-requests'
import type { PublicKey } from 'si-encryption/job-results/types'
import { ResultsWriter } from 'si-encryption/job-results/writer'

export const encryptResults = async (
    fileName: string,
    jobResults: ArrayBuffer,
    publicKeys: ManagementAppPublicKey[],
): Promise<Blob> => {
    const writerParams = publicKeys.map((key) => {
        return { fingerprint: key.fingerprint, publicKey: new Uint8Array(key.publicKey.data).buffer } as PublicKey
    })
    const writer = new ResultsWriter(writerParams)

    await writer.addFile(fileName, jobResults)

    const encryptedResults: Blob = await writer.generate()
    return encryptedResults
}
