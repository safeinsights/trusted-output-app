import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { createTheme } from '@mantine/core'
import { getQueryClient, makeQueryClient, Providers } from '@/components/providers'

// Partial mock to include createTheme
vi.mock('@mantine/core', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        // @ts-ignore
        ...actual,
        MantineProvider: vi.fn(({ children }) => <div>{children}</div>),
        createTheme: vi.fn((config) => config || {}),
    }
})

vi.mock('@mantine/modals', () => ({
    ModalsProvider: vi.fn(({ children }) => <div>{children}</div>),
}))

vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        // @ts-ignore
        ...actual,
        QueryClientProvider: vi.fn(({ children }) => <div>{children}</div>),
    }
})

vi.mock('@tanstack/query-core', () => ({
    isServer: false,
    QueryClient: vi.fn(),
}))

describe('Providers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('makeQueryClient', () => {
        it('creates QueryClient with correct default options', () => {
            makeQueryClient()

            expect(QueryClient).toHaveBeenCalledWith(
                expect.objectContaining({
                    defaultOptions: {
                        queries: {
                            staleTime: 60 * 1000,
                        },
                    },
                }),
            )
        })
    })

    describe('getQueryClient', () => {
        it('creates new client on server', () => {
            // Simulate server environment
            vi.mock('@tanstack/query-core', () => ({
                isServer: true,
                QueryClient: vi.fn(),
            }))

            const client = getQueryClient()

            expect(makeQueryClient).toHaveBeenCalled()
            expect(client).toBeTruthy()
        })

        it('reuses browser client on subsequent calls', () => {
            // Reset to browser environment
            vi.mock('@tanstack/query-core', () => ({
                isServer: false,
                QueryClient: vi.fn(),
            }))

            const firstClient = getQueryClient()
            const secondClient = getQueryClient()

            expect(firstClient).toBe(secondClient)
        })
    })

    describe('Providers component', () => {
        it('renders children through nested providers', () => {
            const TestChild = () => <div>Test Child</div>

            const { getByText } = render(
                <Providers>
                    <TestChild />
                </Providers>,
            )

            expect(getByText('Test Child')).toBeInTheDocument()
        })

        it('passes theme to MantineProvider', () => {
            render(<Providers>test</Providers>)

            expect(vi.mocked(createTheme)).toHaveBeenCalledWith(expect.anything())
        })
    })
})
