import { NextResponse } from 'next/server'
import fs from 'fs'
import { UPLOAD_DIR } from '@/app/utils'
import path from 'path'

// This disables caching for this endpoint
export const revalidate = 0

interface Run {
    runId: string
}

export function GET() {
    let runs: Run[] = []

    if (fs.existsSync(UPLOAD_DIR)) {
        const files = fs.readdirSync(UPLOAD_DIR)
        runs = files.map((file) => {
            return { runId: path.basename(file) }
        })
    }
    return NextResponse.json({ runs })
}
