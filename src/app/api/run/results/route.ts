import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { UPLOAD_DIR } from '@/app/utils'
import { parse } from 'csv-parse/sync'

export async function GET() {
    try {
        const files = await fs.promises.readdir(UPLOAD_DIR)

        const runs: Record<string, any[]> = {}

        for (const file of files) {
            const filePath = path.join(UPLOAD_DIR, file)
            const fileContent = await fs.promises.readFile(filePath, 'utf-8')

            runs[file] = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
            })
        }

        return NextResponse.json({ runs: runs })
    } catch (error) {
        return NextResponse.json({ error: 'Unable to read files' }, { status: 500 })
    }
}
