import { render, screen } from '@testing-library/react'
import { vi, describe, expect, beforeEach, it } from 'vitest'
import Home from '@/app/page'

const mockUseRunResults = {
    data: {},
    isLoading: false,
    isError: false,
    error: null,
}

vi.mock('@/app/requests', async () => {
    const actual = await vi.importActual('@/app/requests')
    return {
        ...actual,
        useRunResults: vi.fn(() => mockUseRunResults),
    }
})

describe('Home Page', () => {
    beforeEach(() => {
        // Reset mock to default before each test
        mockUseRunResults.data = {}
        mockUseRunResults.isLoading = false
        mockUseRunResults.isError = false
        mockUseRunResults.error = null
    })

    it('renders the error state', () => {
        mockUseRunResults.isError = true
        mockUseRunResults.error = new Error('Failed to load')

        render(<Home />)

        const errorElement = screen.getByText(/error: failed to load/i)
        expect(errorElement).toBeInTheDocument()
    })

    it('renders the loading state', () => {
        mockUseRunResults.isLoading = true

        render(<Home />)

        const loadingOverlay = screen.getByTestId('loading-overlay')
        expect(loadingOverlay).toBeInTheDocument()
    })

    it('renders the empty state', () => {
        mockUseRunResults.data = {}

        render(<Home />)

        const emptyAlert = screen.getByText(/no study result is available/i)
        expect(emptyAlert).toBeInTheDocument()
    })

    it('renders the table with data', () => {
        mockUseRunResults.data = {
            'file1.csv': [{ id: 1, value: 'Sample Result 1' }],
            'file2.csv': [{ id: 2, value: 'Sample Result 2' }],
        }

        render(<Home />)

        const tableTitle = screen.getByText(/run results/i)
        expect(tableTitle).toBeInTheDocument()

        const firstFile = screen.getByText(/file1.csv/i)
        expect(firstFile).toBeInTheDocument()

        const secondFile = screen.getByText(/file2.csv/i)
        expect(secondFile).toBeInTheDocument()
    })
})
