import { describe, it, expect, vi } from 'vitest'
import { makeQueryClient, getQueryClient, Providers } from './providers'
import { QueryClient } from '@tanstack/query-core'
import { render } from '@testing-library/react'
import React from 'react'

// Mock dependencies
vi.mock('@tanstack/query-core', async () => {
    const actual = await vi.importActual('@tanstack/query-core')
    return {
        ...actual,
        isServer: false, // Default to client-side for testing
    }
})

describe('Providers', () => {
    describe('makeQueryClient', () => {
        it('creates a QueryClient with default options', () => {
            const queryClient = makeQueryClient()

            expect(queryClient).toBeInstanceOf(QueryClient)

            // Check default query options
            const defaultOptions = queryClient.getDefaultOptions().queries
            expect(defaultOptions?.staleTime).toBe(60 * 1000)
        })
    })

    describe('getQueryClient', () => {
        it('returns a new query client on the server', () => {
            // Mock isServer to true
            vi.mock('@tanstack/query-core', async () => {
                const actual = await vi.importActual('@tanstack/query-core')
                return {
                    ...actual,
                    isServer: true,
                }
            })

            const queryClient = getQueryClient()
            expect(queryClient).toBeInstanceOf(QueryClient)
        })

        it('returns the same query client on the client side', () => {
            // Mock isServer to false
            vi.mock('@tanstack/query-core', async () => {
                const actual = await vi.importActual('@tanstack/query-core')
                return {
                    ...actual,
                    isServer: false,
                }
            })

            const firstClient = getQueryClient()
            const secondClient = getQueryClient()

            expect(firstClient).toBe(secondClient)
        })
    })

    describe('Providers Component', () => {
        it('renders children wrapped with providers', () => {
            const TestChild = () => <div>Test Child</div>

            const { getByText } = render(
                <Providers>
                    <TestChild />
                </Providers>,
            )

            // Verify child is rendered
            expect(getByText('Test Child')).toBeInTheDocument()
        })

        it('provides query client context', () => {
            const TestChild = () => <div>Test Child</div>

            const { container } = render(
                <Providers>
                    <TestChild />
                </Providers>,
            )

            // Check for QueryClientProvider and MantineProvider
            const queryClientProvider = container.querySelector('[data-rq-provider]')
            const mantineProvider = container.querySelector('[data-mantine-color-scheme]')

            expect(queryClientProvider).toBeTruthy()
            expect(mantineProvider).toBeTruthy()
        })
    })
})
