'use client'

import { FC, useEffect, useState } from 'react'
import { Alert, Flex, Button, Paper, LoadingOverlay, Modal, ScrollArea, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { footerStyles, mainStyles, pageStyles } from './page.css'
import { DataTable } from 'mantine-datatable'
import { useRouter } from 'next/navigation'

interface RunData {
    [fileName: string]: CSVRecord[]
}

interface CSVRecord {
    [key: string]: string
}

export default function Home() {
    const [runs, setRuns] = useState<RunData | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Fetch the data from the API
        const fetchRunResults = async () => {
            try {
                const response = await fetch('/api/run/results')
                if (!response.ok) {
                    throw new Error('Failed to fetch run results')
                }

                const data = await response.json()
                setRuns(data.runs)
            } catch (err: any) {
                setError(err.message || 'An error occurred')
            }
        }

        fetchRunResults()
    }, [])

    if (error) {
        return <div>Error: {error}</div>
    }

    if (!runs) {
        return <LoadingOverlay />
    }

    return (
        <div className={pageStyles}>
            <main className={mainStyles}>
                {Object.entries(runs).length == 0 ? (
                    <Alert color="orange" title="Run Results" mb="lg">
                        No Study result is available at this time.
                    </Alert>
                ) : (
                    <Paper m="xl" shadow="xs" p="xl">
                        <Title order={2} mb="md">
                            Run Results
                        </Title>

                        <Flex direction={'column'}>
                            <DataTable
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
                        </Flex>
                    </Paper>
                )}
            </main>
            <footer className={footerStyles}>A SafeInsights production</footer>
        </div>
    )
}

const Approve: FC<{ fileName: string }> = ({ fileName }) => {
    const router = useRouter()
    const approve = async () => {
        try {
            const response = await fetch(`/api/run/${fileName}/approve`, {
                method: 'POST',
            })
            if (!response.ok) {
                throw new Error('Failed to submit result to management app.')
            }
            await response.json()
            notifications.show({
                color: 'green',
                title: 'Study Run Approved',
                message: 'The run has been approved.',
                autoClose: 5_000,
                position: 'top-right',
            })
            router.refresh()
        } catch (err: any) {
            console.error(err)
            notifications.show({
                color: 'red',
                title: 'Study Run Approval Failed',
                message: `An error occured while approving the study run. ${err.message}. Please retry later.`,
                autoClose: 5_000,
                position: 'top-right',
            })
        }
    }

    return <Button onClick={() => approve()}>Approve</Button>
}

const Results: FC<{ fileName: string; records: CSVRecord[] }> = ({ fileName, records }) => {
    const [opened, { open, close }] = useDisclosure(false)

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
                    withTableBorder={false}
                    withColumnBorders={true}
                    records={records.map((record: any) => {
                        return {
                            ...record,
                        }
                    })}
                    columns={Object.keys(records[0]).map((key: string) => ({
                        accessor: key,
                        title: key,
                    }))}
                />
            </Modal>

            <Button variant="outline" onClick={open}>
                View Results
            </Button>
        </>
    )
}
