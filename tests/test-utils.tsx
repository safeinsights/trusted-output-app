import { render, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { theme } from '@/theme'
import { ReactElement, ReactNode } from 'react'

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })

export function renderWithProviders(ui: ReactElement) {
    const testQueryClient = createTestQueryClient()

    return render(
        <QueryClientProvider client={testQueryClient}>
            <MantineProvider theme={theme}>
                <ModalsProvider>{ui}</ModalsProvider>
            </MantineProvider>
        </QueryClientProvider>,
    )
}

export function renderHookWithProviders<T>(callback: () => T) {
    const testQueryClient = createTestQueryClient()

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={testQueryClient}>
            <MantineProvider theme={theme}>
                <ModalsProvider>{children}</ModalsProvider>
            </MantineProvider>
        </QueryClientProvider>
    )

    return renderHook(callback, { wrapper })
}

// Test utils
export * from '@testing-library/react'
export { renderWithProviders as render, renderHookWithProviders as renderHook }
