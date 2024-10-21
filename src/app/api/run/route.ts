import { NextResponse } from 'next/server'
import fs from 'fs'
import { UPLOAD_DIR } from '@/app/utils'
import path from 'path'

export async function GET() {
    try {
        const files = await fs.promises.readdir(UPLOAD_DIR)
        const runs = files.map(file => {
            return { runId: path.basename(file) }
        })
        return NextResponse.json({ runs })
    } catch (error) {
        // Handle error (e.g., directory not found, permission error, etc.)
        return NextResponse.json({ error: 'Unable to read files' }, { status: 500 })
    }
}
