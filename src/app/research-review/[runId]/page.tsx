import { loadResearchForReview } from '../../utils'
import Link from 'next/link'

interface PageParams {
    params: { runId: string }
}

const ReviewPage = async ({ params: { runId } }: PageParams) => {
    // Read the files from the disk during server-side rendering
    const results: any = (await loadResearchForReview(runId)) || undefined
    const headers: any = results?.headers || []
    const data: any = results?.data || []

    return (
        <div>
            <h2>Review</h2>
            {results && headers.length > 0 && data.length > 0 ? (
                <div>
                    <table>
                        <thead>
                            <tr>
                                {headers.map((header: any) => (
                                    <th key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row: any) => (
                                <tr key={row.tableCounter}>
                                    {headers.map((header: any) => (
                                        <td key={header}>{row[header]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div>
                        <p>
                            If any of result seems confusing, please communicate with the researcher and if everything
                            looks correct Please approve by clicking below.
                        </p>
                        <button>Communicate with Researcher</button>
                        <button>
                            <Link href={`/research-results/approve-${runId}`}>Approve</Link>
                        </button>
                    </div>
                </div>
            ) : (
                <p style={{ color: 'red' }}>No result found.</p>
            )}
        </div>
    )
}

export default ReviewPage
