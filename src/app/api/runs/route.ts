import { UPLOAD_DIR, log } from '@/app/utils'
import fs from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

// This disables caching for this endpoint
export const revalidate = 0

interface Run {
    runId: string
}

export function GET() {
    let runs: Run[] = []
    log(`TOA: Retrieving run ids from filesystem...`)
    if (fs.existsSync(UPLOAD_DIR)) {
        const files = fs.readdirSync(UPLOAD_DIR)
        runs = files.map((file) => {
            return { runId: path.basename(file) }
        })
    }
    return NextResponse.json({ runs })
}
