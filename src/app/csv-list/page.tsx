import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = path.resolve(process.cwd(), 'public/uploads')

const CSVList = async () => {
    // Read the files from the disk during server-side rendering
    let files: string[] = []
    let error: string | null = null

    try {
        files = fs.readdirSync(UPLOAD_DIR)
    } catch (err) {
        console.error('Error reading files:', err)
        error = 'Could not read files.'
    }

    return (
        <div>
            <h1>Upload CSV</h1>
            <h2>Uploaded CSV Files</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {files.map((file) => (
                    <li key={file}>
                        <a href={`/uploads/${file}`} target="_blank" rel="noopener noreferrer">
                            {file}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default CSVList
