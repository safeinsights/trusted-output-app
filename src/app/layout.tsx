import type { Metadata } from 'next'
import './globals.css'
import '@mantine/core/styles.layer.css'
import { Providers } from '@/components/providers'
import { AppLayout } from '@/components/app-layout'
import { ColorSchemeScript } from '@mantine/core'
import '@mantine/core/styles.css'
import 'mantine-datatable/styles.layer.css'

export const metadata: Metadata = {
    title: 'SafeInsights - TOA',
    description: 'SafeInsights - Trusted Output Application',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <head>
                <ColorSchemeScript />
            </head>
            <body>
                <Providers>
                    <AppLayout>{children}</AppLayout>
                </Providers>
            </body>
        </html>
    )
}
