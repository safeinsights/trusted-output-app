'use client'

import { Alert, LoadingOverlay, Paper, Stack, Title } from '@mantine/core'
import { DataTable } from 'mantine-datatable'
import { useRunResults } from '@/app/requests'
import { Approve } from '@/components/approve-button'
import { Results } from '@/components/results'

export default function Home() {
    const { data: runs = {}, isLoading, isError, error } = useRunResults()

    if (isError) {
        return <div>Error: {error.toString()}</div>
    }

    if (isLoading) {
        return <LoadingOverlay />
    }

    if (Object.entries(runs).length === 0) {
        return (
            <Alert color="orange" title="Run Results" mb="lg">
                No Study result is available at this time.
            </Alert>
        )
    }

    return (
        <Stack align="center" justify="center">
            <Stack>
                <Paper m="xl" shadow="xs" p="xl">
                    <Title order={2} mb="md">
                        Run Results
                    </Title>

                    <Stack>
                        <DataTable
                            idAccessor={'fileName'}
                            withTableBorder={false}
                            withColumnBorders={false}
                            records={Object.entries(runs).map(([fileName]) => {
                                return {
                                    fileName: fileName,
                                }
                            })}
                            columns={[
                                { accessor: 'fileName', title: '', textAlign: 'right' },
                                {
                                    accessor: 'results',
                                    title: '',
                                    render: (item) => (
                                        <Results fileName={item.fileName} records={runs[item.fileName]} />
                                    ),
                                },
                                {
                                    accessor: 'approve',
                                    title: '',
                                    render: (item) => <Approve fileName={item.fileName} />,
                                },
                            ]}
                        />
                    </Stack>
                </Paper>
            </Stack>
        </Stack>
    )
}
