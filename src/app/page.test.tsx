import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/tests/test-utils'
import Home from './page'
import * as requests from './requests'
import { useJobResults } from './requests'

vi.mock('@/app/requests', () => ({
    useJobResults: vi.fn(),
    useApproveJob: vi.fn(),
}))

describe('Home', () => {
    it('shows the loading overlay when loading', () => {
        vi.mocked(useJobResults).mockReturnValue({
            isLoading: true,
            isError: false,
            data: undefined,
            error: null,
        } as never)

        render(<Home />)

        const loadingOverlay = document.querySelector('.mantine-LoadingOverlay-root')
        expect(loadingOverlay).toBeDefined()
    })

    it('shows error state', () => {
        vi.mocked(requests.useJobResults).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: new Error('Test error'),
        } as never)

        render(<Home />)
        expect(screen.getByText('Error: Error: Test error')).toBeDefined()
    })

    it('shows empty state', () => {
        vi.mocked(requests.useJobResults).mockReturnValue({
            data: {},
            isLoading: false,
            isError: false,
            error: null,
        } as never)

        render(<Home />)
        expect(screen.getByText('No Study result is available at this time.')).not.toBeNull()
    })

    it('renders results table', () => {
        const mockData = {
            'test.csv': [{ col1: 'value1', col2: 'value2' }],
        }

        vi.mocked(requests.useJobResults).mockReturnValue({
            data: mockData,
            isLoading: false,
            isError: false,
            error: null,
        } as never)

        vi.mocked(requests.useApproveJob).mockReturnValue({
            mutate: vi.fn(),
        } as never)

        render(<Home />)

        expect(screen.getByText('Job Results')).toBeDefined()
        expect(screen.getByText('test.csv')).toBeDefined()
        expect(screen.getByText('View Results')).toBeDefined()
        expect(screen.getByText('Approve')).toBeDefined()
    })
})
