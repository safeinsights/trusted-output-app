import { UPLOAD_DIR, log } from '@/app/utils'
import fs from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

// This disables caching for this endpoint
export const revalidate = 0

interface Job {
    jobId: string
}

export function GET() {
    let jobs: Job[] = []
    log(`TOA: Retrieving job ids from filesystem...`)
    if (fs.existsSync(UPLOAD_DIR)) {
        const files = fs.readdirSync(UPLOAD_DIR)
        jobs = files.map((file) => {
            return { jobId: path.basename(file) }
        })
    }
    return NextResponse.json({ jobs })
}
