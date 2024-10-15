import { NextResponse } from 'next/server'
import { loadResearchForReview } from '@/app/utils'

export async function GET(request: Request, { params }: { params: { runId: string } }) {
    const { runId } = params

    try {
        // Call the loadResearchForReview function
        const result = await loadResearchForReview(runId)

        if (!result) {
            return NextResponse.next({ status: 400 })

        }
        // Return the result as JSON
        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        // Handle errors and return an error response
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}
