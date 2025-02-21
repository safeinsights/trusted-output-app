import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { UPLOAD_DIR, log } from '@/app/utils'
import { parse } from 'csv-parse/sync'

// This disables caching for this endpoint
export const revalidate = 0

export function GET() {
    const jobs: Record<string, any[]> = {} // eslint-disable-line
    log('Retrieving results from upload directory')
    if (fs.existsSync(UPLOAD_DIR)) {
        const files = fs.readdirSync(UPLOAD_DIR)

        for (const file of files) {
            const filePath = path.join(UPLOAD_DIR, file)
            log(`Processing file: ${file}`)
            const fileContent = fs.readFileSync(filePath, 'utf-8')

            jobs[file] = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
            })
        }
    }

    return NextResponse.json({ jobs: jobs })
}
