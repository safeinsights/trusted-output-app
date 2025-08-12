'use client'

import { Alert, LoadingOverlay, Paper, Stack, Title } from '@mantine/core'
import { DataTable } from 'mantine-datatable'
import { useJobResults } from '@/app/requests'
import { Approve } from '@/components/approve-button'
import { Results } from '@/components/results'

const isLambdaDeployment = process.env.NEXT_PUBLIC_LAMBDA_DEPLOYMENT === 'true'

function LambdaModePage() {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>SafeInsights - Trusted Output Application</h1>
            <p>API-only mode. UI is disabled in Lambda deployment.</p>
        </div>
    )
}

function UIModePage() {
    const { data: jobs = {}, isLoading, isError, error } = useJobResults()

    if (isLoading) {
        return <LoadingOverlay visible={true} />
    }

    if (isError) {
        return <div>Error: {error.toString()}</div>
    }

    if (Object.entries(jobs).length === 0) {
        return (
            <Alert color="orange" title="Job Results" mb="lg">
                No Study result is available at this time.
            </Alert>
        )
    }

    return (
        <Stack align="center" justify="center">
            <Stack>
                <Paper m="xl" shadow="xs" p="xl">
                    <Title order={2} mb="md">
                        Job Results
                    </Title>

                    <Stack>
                        <DataTable
                            idAccessor={'fileName'}
                            withTableBorder={false}
                            withColumnBorders={false}
                            records={Object.entries(jobs).map(([fileName]) => {
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
                                        <Results fileName={item.fileName} records={jobs[item.fileName]} />
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

export default function Home() {
    return isLambdaDeployment ? <LambdaModePage /> : <UIModePage />
}
