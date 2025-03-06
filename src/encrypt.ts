import { ResultsWriter } from 'si-encryption/job-results/writer'
import { generateAuthorizationHeaders } from './app/utils'

type ManagementAppPublicKeyResponse = {
    keys: ManagementAppPublicKey[]
}

type ManagementAppPublicKey = {
    jobId: string, publicKey: string, fingerprint: string
}

export const getPublicKeys = async (jobId: string): Promise<ManagementAppPublicKeyResponse | undefined> => {
    const endpoint = `${process.env.MANAGEMENT_APP_API_URL}/api/job/${jobId}/keys`
    const headers = generateAuthorizationHeaders()

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch public keys for job ID: ${jobId}`)
    }

    try {
        const body = await response.json()
        return body
    } catch (e) {
        console.error('Failed to parse response body', e)
    }
}

export const encryptResults = async (jobId: string, jobResults: ArrayBuffer, publicKeys: ManagementAppPublicKey[]): Promise<Blob> => {
    const writerParams = publicKeys.map((key) => {
        return { fingerprint: key.fingerprint, publicKey: key.publicKey }
    })
    const writer = new ResultsWriter(writerParams)

    await writer.addFile(jobId, jobResults)

    const encryptedResults: Blob = await writer.generate()
    return encryptedResults
}
