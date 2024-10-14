import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import os from 'os'

const UPLOAD_DIR = path.resolve(process.env.ROOT_PATH ?? os.tmpdir(), "public/uploads")

function isFile(obj: any): obj is File {
    return obj instanceof File
}

export const POST = async (req: NextRequest) => {
    const formData = await req.formData()
    const body = Object.fromEntries(formData)

    if ('file' in body && isFile(body.file)) {
        const buffer = Buffer.from(await body.file.arrayBuffer())
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR)
        }

        fs.writeFileSync(
          path.resolve(UPLOAD_DIR, body.file.name),
          buffer
        )
        return NextResponse.json({
            success: true,
            name: body.file.name,
        })
    }

    return NextResponse.next({status: 400})
}
