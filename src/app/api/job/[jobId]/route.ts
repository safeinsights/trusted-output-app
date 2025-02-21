import { NextRequest, NextResponse } from 'next/server'
import { generateAuthorizationHeaders } from '@/app/utils'

enum AllowedStatusUpdates {
    JOB_PROVISIONING = 'JOB-PROVISIONING',
    JOB_RUNNING = 'JOB-RUNNING',
    JOB_ERRORED = 'JOB-ERRORED',
}

type RunStatusUpdateRequest =
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
function isRunStatusUpdateRequest(data: any): data is RunStatusUpdateRequest {
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ runId: string }> }) {
    const runId = (await params).runId

    if (!runId) {
        return NextResponse.json({ error: 'Missing runId' }, { status: 400 })
    }

    const requestData = await request.json()

    if (!isRunStatusUpdateRequest(requestData)) {
        return NextResponse.json({ error: 'Malformed request data' }, { status: 400 })
    }

    const endpoint = `${process.env.MANAGEMENT_APP_API_URL}/api/run/${runId}`
    const response = await fetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(requestData),
        headers: {
            ...generateAuthorizationHeaders(),
        },
    })

    if (!response.ok) {
        return NextResponse.json({ error: 'Unable to update run status' }, { status: 500 })
    }

    return NextResponse.json({}, { status: 200 })
}
