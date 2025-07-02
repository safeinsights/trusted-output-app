import { generateAuthorizationHeaders, log } from './utils'
import { type SerializedBuffer } from 'si-encryption/util'

export type ManagementAppPublicKey = {
    jobId: string
    publicKey: SerializedBuffer
    fingerprint: string
}

export const getPublicKeys = async (jobId: string): Promise<{ keys: ManagementAppPublicKey[] } | undefined> => {
    const endpoint = `${process.env.MANAGEMENT_APP_API_URL}/api/job/${jobId}/keys`
    const headers = generateAuthorizationHeaders()

    log(`BMA: Retrieving public keys for job ID: ${jobId}`)
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

    const body = await response.json()
    return body
}

export const uploadResults = async (
    jobId: string,
    results: Buffer | Blob,
    type: 'text/csv' | 'application/zip',
    fileType: 'result' | 'log',
) => {
    const formData = new FormData()
    formData.append(fileType, new File([results], jobId, { type: type }))

    const endpoint = `${process.env.MANAGEMENT_APP_API_URL}/api/job/${jobId}/results`
    log(`BMA: Uploading results ${endpoint}`)
    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
            ...generateAuthorizationHeaders(),
        },
    })
    return response
}
