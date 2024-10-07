import React, { useEffect, useState } from 'react'
import fs from 'fs'
import path from 'path'

const CsvList: React.FC = () => {
    const [csvFiles, setCsvFiles] = useState<string[]>([])

    useEffect(() => {
        const fetchCsvFiles = async () => {
            const uploadDir = path.join(process.cwd(), 'uploads')
            fs.readdir(uploadDir, (err, files) => {
                if (err) {
                    console.error('Error reading files:', err)
                    return
                }
                // Filter for .csv files only
                const csvFiles = files.filter(file => file.endsWith('.csv'))
                setCsvFiles(csvFiles)
            })
        }

        fetchCsvFiles()
    }, [])

    return (
        <div>
            <h2>Uploaded CSV Files</h2>
            <ul>
                {csvFiles.map(file => (
                    <li key={file}>{file}</li>
                ))}
            </ul>
        </div>
    )
}

export default CsvList
