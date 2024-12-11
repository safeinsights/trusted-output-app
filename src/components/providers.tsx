'use client'

import { MantineProvider } from '@mantine/core'
import { theme } from '@/theme'
import { ModalsProvider } from '@mantine/modals'
import { isServer, QueryClient } from '@tanstack/query-core'
import { QueryClientProvider } from '@tanstack/react-query'
import { FC } from 'react'

// if using Clerk for authentication:
//    * add the Clerk keys to the .env file,
//    * uncomment the following import line
//      import { ClerkProvider } from "@clerk/nextjs";
//    * add the ClerkProvider component to the tree below

type Props = {
    children: React.ReactNode
}

export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    })
}

let browserQueryClient: QueryClient

export function getQueryClient() {
    if (isServer) {
        return makeQueryClient()
    } else {
        if (!browserQueryClient) {
            browserQueryClient = makeQueryClient()
        }
        return browserQueryClient
    }
}

export const Providers: FC<Props> = ({ children }) => {
    const queryClient = getQueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <MantineProvider theme={theme}>
                <ModalsProvider>{children}</ModalsProvider>
            </MantineProvider>
        </QueryClientProvider>
    )
}
