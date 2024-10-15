import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { UPLOAD_DIR } from '@/app/utils'

export async function GET() {
    try {
        // Get all files in the upload directory
        const files = await fs.promises.readdir(UPLOAD_DIR)

        // Filter only .csv files
        const runFiles = files.filter((file) => path.extname(file) === '.csv')

        return NextResponse.json({ runs: runFiles })
    } catch (error) {
        // Handle error (e.g., directory not found, permission error, etc.)
        return NextResponse.json({ error: 'Unable to read files' }, { status: 500 })
    }
}
