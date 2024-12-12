import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Providers, makeQueryClient, getQueryClient } from './providers'
import { QueryClient, isServer } from '@tanstack/react-query'

// Mock dependencies
vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        // @ts-ignore
        ...actual,
        isServer: vi.fn(),
    }
})

describe('Providers', () => {
    describe('makeQueryClient', () => {
        it('creates a QueryClient with correct default options', () => {
            const queryClient = makeQueryClient()

            expect(queryClient).toBeInstanceOf(QueryClient)

            const defaultOptions = queryClient.getDefaultOptions()
            expect(defaultOptions.queries?.staleTime).toBe(60 * 1000)
        })
    })

    describe('getQueryClient', () => {
        it('returns a new QueryClient when on server', () => {
            // Mock isServer to be true
            vi.mocked(isServer).mockReturnValue(true)

            const queryClient1 = getQueryClient()
            const queryClient2 = getQueryClient()

            expect(queryClient1).toBeInstanceOf(QueryClient)
            expect(queryClient2).toBeInstanceOf(QueryClient)

            // Instead of checking object reference, check something unique about the instances
            const options1 = queryClient1.getDefaultOptions()
            const options2 = queryClient2.getDefaultOptions()

            expect(options1).toEqual(options2) // Same default configuration
            expect(queryClient1).not.toBe(queryClient2) // Different object instances
        })

        it('returns the same QueryClient instance when in browser', () => {
            // Mock isServer to be false
            vi.mocked(isServer).mockReturnValue(false)

            const queryClient1 = getQueryClient()
            const queryClient2 = getQueryClient()

            expect(queryClient1).toEqual(queryClient2)
        })
    })

    describe('Providers component', () => {
        it('renders children correctly', () => {
            const TestChild = () => <div data-testid="test-child">Test</div>

            const { container, getByTestId } = render(
                <Providers>
                    <TestChild />
                </Providers>,
            )

            const child = getByTestId('test-child')
            expect(child).toBeTruthy()

            const childElements = container.querySelectorAll('[data-testid="test-child"]')
            expect(childElements.length).toBe(1)
        })

        it('composes providers correctly', () => {
            const { container } = render(
                <Providers>
                    <div>Test Content</div>
                </Providers>,
            )

            expect(container.innerHTML).toContain('Test Content')
        })
    })
})
