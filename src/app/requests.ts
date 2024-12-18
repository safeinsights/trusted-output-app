import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'

export interface CSVRecord {
    [key: string]: string
}

interface RunData {
    [fileName: string]: CSVRecord[]
}

export const useRunResults = () => {
    return useQuery({
        queryKey: ['run-results'],
        queryFn: async (): Promise<RunData> => {
            const response = await fetch('/api/run/results')
            const data = await response.json()
            return data.runs as RunData
        },
    })
}

export const useApproveRun = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (fileName: string) => {
            const response = await fetch(`/api/run/${fileName}/approve`, {
                method: 'POST',
            })
            if (!response.ok) {
                const message = await response.json()
                throw new Error(`${message.error}`)
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['run-results'] })
            notifications.show({
                color: 'green',
                title: 'Study Run Approved',
                message: 'The run has been approved.',
                autoClose: 5_000,
                position: 'top-right',
            })
        },
        onError: (error) => {
            console.error(error)

            notifications.show({
                color: 'red',
                title: 'Study Run Approval Failed',
                message: `An error occurred while approving the study run. ${error.message}. Please retry later.`,
                autoClose: 5_000,
                position: 'top-right',
            })
        },
    })
}
