import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@/tests/test-utils'
import { useApproveRun, useRunResults } from './requests'
import { notifications } from '@mantine/notifications'

vi.mock('@mantine/notifications', () => ({
    notifications: {
        show: vi.fn(),
    },
}))

describe('useRunResults', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('fetches run results successfully', async () => {
        const mockData = {
            runs: {
                'file1.csv': [{ col1: 'value1' }],
                'file2.csv': [{ col1: 'value2' }],
            },
        }

        global.fetch = vi.fn().mockResolvedValue({
            json: () => Promise.resolve(mockData),
        })

        const { result } = renderHook(() => useRunResults())

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(result.current.data).toEqual(mockData.runs)
        expect(fetch).toHaveBeenCalledWith('/api/run/results')
    })

    it('handles fetch error', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useRunResults())

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })

        expect(result.current.error).toBeDefined()
    })
})

describe('useApproveRun', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('approves run successfully', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
        })

        const { result } = renderHook(() => useApproveRun())

        result.current.mutate('test.csv')

        await waitFor(() => {
            expect(notifications.show).toHaveBeenCalledWith({
                color: 'green',
                title: 'Study Run Approved',
                message: 'The run has been approved.',
                autoClose: 5_000,
                position: 'top-right',
            })
        })

        expect(fetch).toHaveBeenCalledWith('/api/run/test.csv/approve', {
            method: 'POST',
        })
    })

    it('handles approval error', async () => {
        const errorMessage = 'Approval failed'
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: errorMessage }),
        })

        const { result } = renderHook(() => useApproveRun())

        result.current.mutate('test.csv')

        await waitFor(() => {
            expect(notifications.show).toHaveBeenCalledWith({
                color: 'red',
                title: 'Study Run Approval Failed',
                message: `An error occurred while approving the study run. ${errorMessage}. Please retry later.`,
                autoClose: 5_000,
                position: 'top-right',
            })
        })
    })
})
