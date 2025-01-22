import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/tests/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from './page'
import * as requests from './requests'

vi.mock('./requests', async () => {
    const actual = await vi.importActual('./requests')
    return {
        ...actual,
        useRunResults: vi.fn(),
        useApproveRun: vi.fn(),
    }
})

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})

describe('Home', () => {
    it('shows loading state', () => {
        vi.mocked(requests.useRunResults).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
        } as any)

        const { container } = render(<Home />)
        expect(container.querySelector('.mantine-LoadingOverlay-root')).toBeDefined()
    })

    it('shows error state', () => {
        vi.mocked(requests.useRunResults).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: new Error('Test error'),
        } as any)

        render(<Home />)
        expect(screen.getByText('Error: Error: Test error')).toBeDefined()
    })

    it('shows empty state', () => {
        vi.mocked(requests.useRunResults).mockReturnValue({
            data: {},
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        render(<Home />)
        expect(screen.getByText('No Study result is available at this time.')).not.toBeNull()
    })

    it('renders results table', () => {
        const mockData = {
            'test.csv': [{ col1: 'value1', col2: 'value2' }],
        }

        vi.mocked(requests.useRunResults).mockReturnValue({
            data: mockData,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        vi.mocked(requests.useApproveRun).mockReturnValue({
            mutate: vi.fn(),
        } as any)

        render(<Home />)

        expect(screen.getByText('Run Results')).toBeDefined()
        expect(screen.getByText('test.csv')).toBeDefined()
        expect(screen.getByText('View Results')).toBeDefined()
        expect(screen.getByText('Approve')).toBeDefined()
    })
})
