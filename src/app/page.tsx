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
                                    {
                                        accessor: 'communicate',
                                        title: '',
                                        render: () => <Communicate />,
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

const Communicate: FC<{}> = () => {
    // TODO Wire up logic to contact the researcher
    const showCommunicationNotification = () => {
        notifications.show({
            color: 'blue',
            title: 'Researcher Communication',
            message: 'Communication has been done between member and researcher!',
            autoClose: 30_000,
            position: 'top-right',
        })
    }
    return <Button onClick={() => showCommunicationNotification()}>Contact Researcher</Button>
}

const Approve: FC<{ fileName: string }> = ({fileName}) => {
    const router = useRouter()
    // TODO Wire up logic to hit backend approve endpoint
    const [error, setError] = useState<string | null>(null)
    const approve = async () => {
        try {
            const response = await fetch(`/api/run/${fileName}/approve`,
                {
                    method: 'POST'
                }
            )
            if (!response.ok) {
                throw new Error('Failed to fetch run results')
            }
            await response.json()
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'An error occurred')
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
                size="xl"
                title={`Results for ${fileName}`}
                scrollAreaComponent={ScrollArea.Autosize}
            >
                <DataTable
                    withTableBorder={false}
                    withColumnBorders={false}
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

            <Button onClick={open}>View Results</Button>
        </>
    )
}
