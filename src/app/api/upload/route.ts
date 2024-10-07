// app/api/upload/route.ts

import { NextResponse } from 'next/server'
import multer from 'multer'
import fs from 'fs'
import path from 'path'

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads')
        // Create the uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir)
        }
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname) // Save with original filename
    },
})

const upload = multer({ storage })

export async function POST(req: Request) {
    // Create a new Promise for multer to handle the file upload
    return new Promise((resolve) => {
        upload.single('file')(req as any, {} as any, (err) => {
            if (err) {
                return resolve(NextResponse.json({ message: 'File upload failed.' }, { status: 500 }))
            }
            // If file is uploaded successfully
            return resolve(NextResponse.json({ message: 'File uploaded successfully.' }, { status: 200 }))
        })
    })
}
