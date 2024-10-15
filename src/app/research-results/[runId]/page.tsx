import { Button, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core'
import { approveResearch, loadMetadata } from '../../utils'
import Link from 'next/link'

interface PageParams {
    params: { runId: string }
}

export default async function ResearchResultList({ params: { runId } }: PageParams) {
    if (runId?.startsWith('approve-')) {
        await approveResearch(runId.substring(8))
    }

    let result = await loadMetadata()

    const rows = result.map((file: any) => (
        <TableTr key={file.runId}>
            <TableTd>{file.time}</TableTd>
            <TableTd>{file.runId}</TableTd>
            <TableTd>{file.status || 'Pending'}</TableTd>
            <TableTd>{file.name}</TableTd>
            <TableTd>{file.size}</TableTd>
            <TableTd>
                <Button>
                    <Link href={'/research-review/' + file.runId}>Review</Link>
                </Button>
            </TableTd>
        </TableTr>
    ))
    return (
        <Table>
            <TableThead>
                <TableTr>
                    <TableTh>Time</TableTh>
                    <TableTh>Run ID</TableTh>
                    <TableTh>Status</TableTh>
                    <TableTh>File</TableTh>
                    <TableTh>Size</TableTh>
                    <TableTh></TableTh>
                </TableTr>
            </TableThead>
            <TableTbody>{rows}</TableTbody>
        </Table>
    )
}
