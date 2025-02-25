import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'

export interface CSVRecord {
    [key: string]: string
}

export interface JobData {
    [fileName: string]: CSVRecord[]
}

export const useJobResults = () => {
    return useQuery({
        queryKey: ['job-results'],
        queryFn: async (): Promise<JobData> => {
            const response = await fetch('/api/job/results')
            const data = await response.json()
            return data.jobs as JobData
        },
    })
}

export const useApproveJob = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (fileName: string) => {
            const response = await fetch(`/api/job/${fileName}/approve`, {
                method: 'POST',
            })
            if (!response.ok) {
                const message = await response.json()
                throw new Error(`${message.error}`)
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['job-results'] })
            notifications.show({
                color: 'green',
                title: 'Study Job Approved',
                message: 'The job has been approved.',
                autoClose: 5_000,
                position: 'top-right',
            })
        },
        onError: (error) => {
            console.error(error)

            notifications.show({
                color: 'red',
                title: 'Study Job Approval Failed',
                message: `An error occurred while approving the study job. ${error.message}. Please retry later.`,
                autoClose: 5_000,
                position: 'top-right',
            })
        },
    })
}
