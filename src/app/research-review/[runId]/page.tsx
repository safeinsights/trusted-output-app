import {
    Button,
    Group,
    Stack,
    Table,
    TableTbody,
    TableTd,
    TableTh,
    TableThead,
    TableTr,
    Text,
    Title
} from '@mantine/core'
import { loadResearchForReview } from '@/app/utils'

interface PageParams {
    params: { runId: string }
}

const ReviewPage = async ({ params: { runId } }: PageParams) => {
    // Read the files from the disk during server-side rendering
    const results: any = (await loadResearchForReview(runId)) || undefined
    const headers: any = results?.headers || []
    const data: any = results?.data || []

    if (!data.length) {
        return <Title order={4}>No data available for this run</Title>
    }

    return (
        <Stack>
            <Title order={2}>Review run {runId}</Title>
            <Stack>
                <Text>
                    If any of result seems confusing, please communicate with the researcher and if everything
                    looks correct Please approve by clicking below.
                </Text>
                <Group>
                    <Button>Communicate with Researcher</Button>
                    <Button>
                        Approve
                        {/*TODO Figure out if we can just hit our API? break this out into its own client component?*/}
                        {/*<Link href={`/research-results/approve-${runId}`}>Approve</Link>*/}
                    </Button>
                </Group>
            </Stack>
            <Table>
                <TableThead>
                    <TableTr>
                        {headers.map((header: any) => (
                            <TableTh key={header}>{header}</TableTh>
                        ))}
                    </TableTr>
                </TableThead>
                <TableTbody>
                    {data.map((row: any) => (
                        <TableTr key={row.tableCounter}>
                            {headers.map((header: any) => (
                              <TableTd key={header}>{row[header]}</TableTd>
                            ))}
                        </TableTr>
                    ))}
                </TableTbody>
            </Table>

        </Stack>
    )
}

export default ReviewPage
