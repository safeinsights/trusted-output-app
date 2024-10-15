import type { Metadata } from 'next'
import './globals.css'
import '@mantine/core/styles.css'
import { Providers } from '@/components/providers'
import { Anchor, Group } from '@mantine/core'
import Link from 'next/link'

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
            <body>
                <Providers>
                    <header>
                        <Group gap="xl">
                            <Anchor component={Link} href="/">
                                Trusted Output App
                            </Anchor>
                            <Anchor component={Link} href="/research-results/all">
                                Results
                            </Anchor>
                        </Group>
                    </header>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
