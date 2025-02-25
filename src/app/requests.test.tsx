import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@/tests/test-utils'
import { useApproveJob, useJobResults } from './requests'
import { notifications } from '@mantine/notifications'

vi.mock('@mantine/notifications', () => ({
    notifications: {
        show: vi.fn(),
    },
}))

describe('useJobResults', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('fetches job results successfully', async () => {
        const mockData = {
            jobs: {
                'file1.csv': [{ col1: 'value1' }],
                'file2.csv': [{ col1: 'value2' }],
            },
        }

        global.fetch = vi.fn().mockResolvedValue({
            json: () => Promise.resolve(mockData),
        })

        const { result } = renderHook(() => useJobResults())

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(result.current.data).toEqual(mockData.jobs)
        expect(fetch).toHaveBeenCalledWith('/api/job/results')
    })

    it('handles fetch error', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useJobResults())

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })

        expect(result.current.error).toBeDefined()
    })
})

describe('useApproveJob', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('approves job successfully', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
        })

        const { result } = renderHook(() => useApproveJob())

        result.current.mutate('test.csv')

        await waitFor(() => {
            expect(notifications.show).toHaveBeenCalledWith({
                color: 'green',
                title: 'Study Job Approved',
                message: 'The job has been approved.',
                autoClose: 5_000,
                position: 'top-right',
            })
        })

        expect(fetch).toHaveBeenCalledWith('/api/job/test.csv/approve', {
            method: 'POST',
        })
    })

    it('handles approval error', async () => {
        const errorMessage = 'Approval failed'
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: errorMessage }),
        })

        const { result } = renderHook(() => useApproveJob())

        result.current.mutate('test.csv')

        await waitFor(() => {
            expect(notifications.show).toHaveBeenCalledWith({
                color: 'red',
                title: 'Study Job Approval Failed',
                message: `An error occurred while approving the study job. ${errorMessage}. Please retry later.`,
                autoClose: 5_000,
                position: 'top-right',
            })
        })
    })
})
