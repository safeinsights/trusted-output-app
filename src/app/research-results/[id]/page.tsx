import { loadMetadata, approveReasearch} from '../../utils'
import Link from 'next/link'


const ResearchResultList = async (props: any) => {
    // Read the files from the disk during server-side rendering
    let id = props?.params.id
    console.log(id)
    if (id && id.startsWith('approve-')) {
        await approveReasearch(id.substring(8))
    }
    let result = await loadMetadata()
    return (
<div>
                    <h2>Research Results</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Researcher</th>
                                <th>Study</th>
                                <th>File</th>
                                <th>Size</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.map((file:any) => (
                                <tr key={file.savedFile}>
                                    <td>{file.time}</td>
                                    <td>{file.status || 'Pending'}</td>
                                    <td>{file.researcher}</td>
                                    <td>{file.study}</td>
                                    <td>{file.name}</td>
                                    <td>{file.size}</td>
                                    <td>
                                        <button>
                                            <Link href={"/research-review/"+file.savedFile}>Review</Link>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
    )
}

export default ResearchResultList
