import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { getQueryClient, Providers } from './providers'
import { QueryClient } from '@tanstack/react-query'

// Create a mock for isServer
const mockIsServer = vi.fn(() => false)

// Temporarily replace the isServer implementation
vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        // @ts-expect-error Ignore the type error
        ...actual,
        isServer: () => mockIsServer(),
    }
})

// Mock Mantine and Modals providers to avoid rendering actual components
vi.mock('@mantine/core', () => ({
    MantineProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mantine-provider">{children}</div>
    ),
}))

vi.mock('@mantine/modals', () => ({
    ModalsProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="modals-provider">{children}</div>
    ),
}))

describe('Providers', () => {
    // Reset the mock before each test
    beforeEach(() => {
        mockIsServer.mockReset()
        mockIsServer.mockReturnValue(false) // Default to false
    })

    describe('getQueryClient', () => {
        it('returns a new QueryClient when on server', () => {
            // Set isServer to true for this test
            mockIsServer.mockReturnValue(true)

            const queryClient1 = getQueryClient()
            const queryClient2 = getQueryClient()

            expect(queryClient1).toBeInstanceOf(QueryClient)
            expect(queryClient2).toBeInstanceOf(QueryClient)

            // Ensure different instances are created on server
            expect(queryClient1).not.toEqual(queryClient2)
        })

        it('returns the same QueryClient instance when in browser', () => {
            // Ensure isServer is false
            mockIsServer.mockReturnValue(false)

            const queryClient1 = getQueryClient()
            const queryClient2 = getQueryClient()

            // Should return the same instance
            expect(queryClient1).toEqual(queryClient2)
        })
    })

    describe('Providers component', () => {
        it('renders children within all providers', () => {
            const TestChild = () => <div data-testid="test-child">Test Content</div>

            const { getByTestId, container } = render(
                <Providers>
                    <TestChild />
                </Providers>,
            )

            // Check if child is rendered
            const child = getByTestId('test-child')
            expect(child).toBeTruthy()

            // Verify provider hierarchy
            const mantineProvider = container.querySelector('[data-testid="mantine-provider"]')
            const modalsProvider = container.querySelector('[data-testid="modals-provider"]')

            expect(mantineProvider).toBeTruthy()
            expect(modalsProvider).toBeTruthy()

            // Ensure child is within the providers
            expect(modalsProvider?.textContent).toContain('Test Content')
        })

        it('passes children correctly through provider layers', () => {
            const TestChild = () => <div data-testid="test-child">Nested Content</div>

            const { container } = render(
                <Providers>
                    <TestChild />
                </Providers>,
            )

            // Verify the content is present in the final rendered output
            const childContent = container.textContent
            expect(childContent).toContain('Nested Content')
        })
    })
})
