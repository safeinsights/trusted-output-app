import { generateAuthorizationHeaders } from '@/utils'

enum AllowedStatusUpdates {
    JOB_PROVISIONING = 'JOB-PROVISIONING',
    JOB_RUNNING = 'JOB-RUNNING',
    JOB_ERRORED = 'JOB-ERRORED',
}

type JobStatusUpdateRequest =
    | {
          status: AllowedStatusUpdates.JOB_PROVISIONING
      }
    | {
          status: AllowedStatusUpdates.JOB_RUNNING
          message?: string
      }
    | {
          status: AllowedStatusUpdates.JOB_ERRORED
          message?: string
      }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isJobStatusUpdateRequest(data: any): data is JobStatusUpdateRequest {
    if (typeof data !== 'object' || data === null || typeof data.status !== 'string') {
        return false
    }

    if (!Object.values(AllowedStatusUpdates).includes(data.status)) {
        return false
    }

    if (data.status === AllowedStatusUpdates.JOB_PROVISIONING && data.message !== undefined) {
        return false
    }

    if (
        (data.status === AllowedStatusUpdates.JOB_RUNNING || data.status === AllowedStatusUpdates.JOB_ERRORED) &&
        data.message !== undefined &&
        typeof data.message !== 'string'
    ) {
        return false
    }

    return true
}

export async function updateJobStatus(request: Request, { jobId }: { jobId: string }) {
    if (!jobId) {
        return Response.json({ error: 'Missing jobId' }, { status: 400 })
    }

    let requestData: unknown
    try {
        requestData = await request.json()
    } catch {
        return Response.json({ error: 'Malformed request data' }, { status: 400 })
    }

    if (!isJobStatusUpdateRequest(requestData)) {
        return Response.json({ error: 'Malformed request data' }, { status: 400 })
    }

    const endpoint = `${process.env.MANAGEMENT_APP_API_URL}/api/job/${jobId}`
    const response = await fetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(requestData),
        headers: {
            ...generateAuthorizationHeaders(),
        },
    })

    if (!response.ok) {
        return Response.json({ error: 'Unable to update job status' }, { status: 500 })
    }

    return Response.json({}, { status: 200 })
}
