import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { UPLOAD_DIR } from '@/app/utils'
import { parse } from 'csv-parse/sync'

// This disables caching for this endpoint
export const revalidate = 0

export function GET() {
    const runs: Record<string, any[]> = {} // eslint-disable-line

    if (fs.existsSync(UPLOAD_DIR)) {
        const files = fs.readdirSync(UPLOAD_DIR)

        for (const file of files) {
            const filePath = path.join(UPLOAD_DIR, file)
            const fileContent = fs.readFileSync(filePath, 'utf-8')

            runs[file] = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
            })
        }
    }

    return NextResponse.json({ runs: runs })
}
