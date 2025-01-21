import { NextRequest, NextResponse } from 'next/server'
import { generateAuthorizationHeaders } from '@/app/utils'

const allowedStatusUpdates = ['PROVISIONING', 'RUNNING', 'ERRORED'] as const

type RunStatusUpdateRequest = {
    status: (typeof allowedStatusUpdates)[number]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRunStatusUpdateRequest(data: any): data is RunStatusUpdateRequest {
    return (
        typeof data === 'object' &&
        data !== null &&
        typeof data.status === 'string' &&
        allowedStatusUpdates.includes(data.status)
    )
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
        body: JSON.stringify({ status: requestData.status }),
        headers: {
            ...generateAuthorizationHeaders(),
        },
    })

    if (!response.ok) {
        return NextResponse.json({ error: 'Unable to update run status' }, { status: 500 })
    }

    return NextResponse.json({}, { status: 200 })
}
