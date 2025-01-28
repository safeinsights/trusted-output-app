import { FC } from 'react'
import { CSVRecord } from '@/app/requests'
import { useDisclosure } from '@mantine/hooks'
import { Button, Modal, ScrollArea, Text } from '@mantine/core'
import { DataTable } from 'mantine-datatable'

export const Results: FC<{ fileName: string; records: CSVRecord[] }> = ({ fileName, records }) => {
    const [opened, { open, close }] = useDisclosure(false)

    if (!records.length) {
        return <Text>No results available!</Text>
    }

    const columns = Object.keys(records[0]).map((key: string) => ({
        accessor: key,
        title: key,
    }))

    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                mod={{
                    'data-testid': 'close-results-modal',
                }}
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
