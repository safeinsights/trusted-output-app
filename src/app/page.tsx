'use client'

import { FC, useEffect, useState } from 'react'
import { Button, Group, LoadingOverlay, Modal, ModalHeader, ScrollArea, Stack, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

interface RunData {
    [fileName: string]: { [key: string]: string }[];
}

// TODO Put results here eventually in a refactor, for now just redirect
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
        <Stack>
            <Title order={2}>Run Results</Title>
            <Stack>
                {Object.entries(runs).map(([fileName, records]) => (
                    <Group key={fileName}>
                        <Title order={3}>{fileName}</Title>
                        <Results fileName={fileName} records={records}/>
                        <Approve />
                    </Group>
                ))}
            </Stack>
        </Stack>
    )
}

const Approve: FC<{}> =() => {
    // TODO Wire up logic to hit backend approve endpoint
    return (
        <Button>Approve</Button>
    )
}

const Results: FC<{ fileName: string; records: any }> = ({ fileName, records}) => {
    const [opened, { open, close }] = useDisclosure(false)

    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                title={`Results for ${fileName}`}
                scrollAreaComponent={ScrollArea.Autosize}
            >
                <table>
                    <thead>
                    <tr>
                        {Object.keys(records[0]).map((key) => (
                            <th key={key}>{key}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {records.map((record, index) => (
                        <tr key={index}>
                            {Object.values(record).map((value, idx) => (
                                <td key={idx}>{value}</td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </Modal>

            <Button onClick={open}>View Results</Button>
        </>
    )
}

