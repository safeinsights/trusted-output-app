import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/tests/test-utils'
import userEvent from '@testing-library/user-event'
import { Results } from '@/components/results'

// Mock data for testing
const mockRecords = [
    { id: '1', name: 'John', age: '30' },
    { id: '2', name: 'Jane', age: '25' },
]

describe('Results Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows empty state when no records', () => {
        const { container } = render(<Results fileName="test.csv" records={[]} />)
        expect(container.textContent).toContain('No results available!')
    })

    it('renders view results button', () => {
        render(<Results fileName="test.csv" records={mockRecords} />)
        expect(screen.getByRole('button', { name: /view results/i })).toBeDefined()
    })

    it('opens modal with correct title when button is clicked', async () => {
        render(<Results fileName="test.csv" records={mockRecords} />)

        const button = screen.getByRole('button', { name: /view results/i })
        await userEvent.click(button)

        expect(screen.getByText('Results for test.csv')).toBeDefined()
    })

    it('displays data table with correct columns', async () => {
        render(<Results fileName="test.csv" records={mockRecords} />)

        const button = screen.getByRole('button', { name: /view results/i })
        await userEvent.click(button)

        // Check for column headers
        expect(screen.getByText('id')).toBeDefined()
        expect(screen.getByText('name')).toBeDefined()
        expect(screen.getByText('age')).toBeDefined()
    })

    it('displays data table with correct records', async () => {
        render(<Results fileName="test.csv" records={mockRecords} />)

        const button = screen.getByRole('button', { name: /view results/i })
        await userEvent.click(button)

        // Check for data cells
        expect(screen.getByText('John')).toBeDefined()
        expect(screen.getByText('30')).toBeDefined()
        expect(screen.getByText('Jane')).toBeDefined()
        expect(screen.getByText('25')).toBeDefined()
    })

    it('handles empty records array', () => {
        render(<Results fileName="empty.csv" records={[]} />)

        expect(screen.getByText('No results available!')).not.toBeNull()
    })

    it('creates correct column configuration from record keys', async () => {
        const customRecords = [{ custom_field: 'value1', another_field: 'value2' }]

        render(<Results fileName="test.csv" records={customRecords} />)

        const button = screen.getByRole('button', { name: /view results/i })
        await userEvent.click(button)

        expect(screen.getByText('custom_field')).toBeDefined()
        expect(screen.getByText('another_field')).toBeDefined()
        expect(screen.getByText('value1')).toBeDefined()
        expect(screen.getByText('value2')).toBeDefined()
    })
})
