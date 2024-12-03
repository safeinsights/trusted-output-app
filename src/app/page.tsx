'use client'

import { FC } from 'react'
import { Alert, Button, Flex, Grid, LoadingOverlay, Modal, Paper, ScrollArea, Stack, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { mainStyles, pageStyles } from './page.css'
import { DataTable } from 'mantine-datatable'
import { CSVRecord, useApproveRun, useRunResults } from '@/app/requests'

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

const Approve: FC<{ fileName: string }> = ({ fileName }) => {
    const approve = useApproveRun()
    return <Button onClick={() => approve.mutate(fileName)}>Approve</Button>
}

const Results: FC<{ fileName: string; records: CSVRecord[] }> = ({ fileName, records }) => {
    const [opened, { open, close }] = useDisclosure(false)
    const columns = Object.keys(records[0]).map((key: string) => ({
        accessor: key,
        title: key,
    }))

    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                size="100%"
                title={`Results for ${fileName}`}
                scrollAreaComponent={ScrollArea.Autosize}
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
                centered
            >
                <DataTable
                    idAccessor={columns[0].title}
                    withTableBorder={false}
                    withColumnBorders={true}
                    records={records}
                    columns={columns}
                />
            </Modal>

            <Button variant="outline" onClick={open}>
                View Results
            </Button>
        </>
    )
}
