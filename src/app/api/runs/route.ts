import { NextResponse } from 'next/server'
import fs from 'fs'
import { UPLOAD_DIR } from '@/app/utils'
import path from 'path'

// This disables caching for this endpoint
export const revalidate = 0

interface Run {
    runId: string
}

export async function GET() {
    try {
        let runs: Run[] = []

        if (fs.existsSync(UPLOAD_DIR)) {
            const files = await fs.promises.readdir(UPLOAD_DIR)
            runs = files.map((file) => {
                return { runId: path.basename(file) }
            })
        }
        return NextResponse.json({ runs })
    } catch (error) {
        // Handle error (e.g., directory not found, permission error, etc.)
        return NextResponse.json({ error: 'Unable to read files' }, { status: 500 })
    }
}
