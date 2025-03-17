import { generateAuthorizationHeaders, log } from './utils'

export type ManagementAppPublicKey = {
    jobId: string
    publicKey: string
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

    try {
        const body = await response.json()
        return body
    } catch (e) {
        console.error('Failed to parse response body', e)
    }
}

export const uploadResults = async (jobId: string, results: Buffer | Blob, type: 'text/csv' | 'application/zip') => {
    const formData = new FormData()
    formData.append('file', new File([results], jobId, { type: type }))

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
