import { approveResearch, loadMetadata } from '../../utils'
import Link from 'next/link'

export default async function ResearchResultList(props: any) {
    let id = props?.params.id
    if (id && id.startsWith('approve-')) {
        await approveResearch(id.substring(8))
    }

    let result = await loadMetadata()
    return (
        <div>
            <h2>Research Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Run ID</th>
                        <th>Status</th>
                        <th>File</th>
                        <th>Size</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {result.map((file: any) => (
                        <tr key={file.runId}>
                            <td>{file.time}</td>
                            <td>{file.runId}</td>
                            <td>{file.status || 'Pending'}</td>
                            <td>{file.name}</td>
                            <td>{file.size}</td>
                            <td>
                                <button>
                                    <Link href={'/research-review/' + file.runId}>Review</Link>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

