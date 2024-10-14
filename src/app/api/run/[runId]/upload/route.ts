import { NextRequest, NextResponse } from 'next/server'
import { saveFile } from '@/app/utils'

function isFile(obj: any): obj is File {
    return obj instanceof File
}

export const POST = async (req: NextRequest) => {
    const formData = await req.formData()
    const body = Object.fromEntries(formData)
    const data = (body.data as string) || null

    if ('file' in body && isFile(body.file)) {
        await saveFile(body.file, body.file.name, data)

        return NextResponse.json({
            success: true,
            name: body.file.name,
        })
    }

    return NextResponse.next({ status: 400 })
}
