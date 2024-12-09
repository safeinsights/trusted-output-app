import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { getQueryClient, makeQueryClient, Providers } from './providers'
import { QueryClient } from '@tanstack/query-core'

// Mocking `isServer` and `QueryClient`
vi.mock('@tanstack/query-core', () => {
    const actual = vi.importActual('@tanstack/query-core')
    return {
        ...actual,
        isServer: false, // Default to false
        QueryClient: vi.fn(() => ({
            defaultOptions: {
                queries: { staleTime: 60 * 1000 },
            },
        })),
    }
})

describe('getQueryClient', () => {
    afterEach(() => {
        vi.resetModules()
    })

    it('creates a new query client on the server', async () => {
        vi.mock('@tanstack/query-core', () => ({ isServer: true }))
        const queryClient = getQueryClient()
        expect(queryClient).toBeInstanceOf(QueryClient)
    })

    it('reuses the query client in the browser', async () => {
        vi.mock('@tanstack/query-core', () => ({ isServer: false }))
        const firstClient = getQueryClient()
        const secondClient = getQueryClient()
        expect(firstClient).toBe(secondClient)
    })
})

describe('Providers', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('renders children correctly', () => {
        render(
            <Providers>
                <div data-testid="test-child">Test Child</div>
            </Providers>,
        )
        expect(screen.getByTestId('test-child')).toHaveTextContent('Test Child')
    })

    it('creates a QueryClient with default options', () => {
        const queryClient = makeQueryClient()
        expect(queryClient).toBeInstanceOf(QueryClient)
        expect(queryClient.defaultOptions?.queries?.staleTime).toBe(60000)
    })

    it('creates a new query client on the server for each request', () => {
        // Mock `isServer` to return true
        const { isServer } = vi.importActual('@tanstack/query-core')
        vi.mocked(isServer).mockReturnValue(true)

        const { getQueryClient } = require('./providers')
        const firstClient = getQueryClient()
        const secondClient = getQueryClient()

        expect(firstClient).not.toBe(secondClient)
        expect(QueryClient).toHaveBeenCalledTimes(2) // Two separate clients created
    })

    it('reuses browserQueryClient when `isServer` is false', () => {
        // Mock `isServer` to return false
        const { isServer } = vi.importActual('@tanstack/query-core')
        vi.mocked(isServer).mockReturnValue(false)

        const { getQueryClient } = require('./providers')
        const firstClient = getQueryClient()
        const secondClient = getQueryClient()

        expect(firstClient).toBe(secondClient) // Reuses the same client
        expect(QueryClient).toHaveBeenCalledTimes(1) // Only one client created
    })
})
