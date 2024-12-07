'use client'

import { MantineProvider } from '@mantine/core'
import { theme } from '@/theme'
import { ModalsProvider } from '@mantine/modals'
import { isServer, QueryClient } from '@tanstack/query-core'
import { QueryClientProvider } from '@tanstack/react-query'

// if using Clerk for authentication:
//    * add the Clerk keys to the .env file,
//    * uncomment the following import line
//      import { ClerkProvider } from "@clerk/nextjs";
//    * add the ClerkProvider component to the tree below

type Props = {
    children: React.ReactNode
}

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // With SSR, we usually want to set some default staleTime
                // above 0 to avoid refetching immediately on the client
                staleTime: 60 * 1000,
            },
        },
    })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
    if (isServer) {
        // Server: always make a new query client
        return makeQueryClient()
    } else {
        // Browser: make a new query client if we don't already have one
        // This is very important, so we don't re-make a new client if React
        // suspends during the initial render. This may not be needed if we
        // have a suspense boundary BELOW the creation of the query client
        if (!browserQueryClient) browserQueryClient = makeQueryClient()
        return browserQueryClient
    }
}
export const Providers: React.FC<Props> = ({ children }) => {
    const queryClient = getQueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <MantineProvider theme={theme}>
                <ModalsProvider>{children}</ModalsProvider>
            </MantineProvider>
        </QueryClientProvider>
    )
}
