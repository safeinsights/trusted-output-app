import { NextRequest, NextResponse } from 'next/server'
import { saveFile } from '../../utils'

export const POST = async (req: NextRequest) => {
    const formData = await req.formData()
    const body = Object.fromEntries(formData)
    const file = (body.file as Blob) || null
    const data = (body.data as string) || null
    let error: string | null = 'Invalid request'
    if (file) {
        try {
            await saveFile(file, (body.file as File).name, data)
            return NextResponse.json({
                success: true,
                name: (body.file as File).name,
            })
        } catch (err) {
            console.error('Error saving file:', err)
            error = `Could not save file. ${err}`
        }
    }

    return NextResponse.json({
        success: false,
        message: error,
    })
}
