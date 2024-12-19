import { Group, AppShell, AppShellHeader, AppShellMain, AppShellFooter } from '@mantine/core'
import { SafeInsightsLogo } from './si-logo'
import Link from 'next/link'
import { Notifications } from '@mantine/notifications'

import '@mantine/notifications/styles.css'

type Props = {
    children: React.ReactNode
}

export function AppLayout({ children }: Props) {
    return (
        <AppShell header={{ height: 60 }} padding="md">
            <Notifications />
            <AppShellHeader>
                <Group h="100%" px="md" justify="space-between">
                    <Link href="/">
                        <SafeInsightsLogo height={30} />
                    </Link>
                    <h3>Trusted Output App</h3>
                </Group>
            </AppShellHeader>

            <AppShellMain>{children}</AppShellMain>

            <AppShellFooter>A SafeInsights production</AppShellFooter>
        </AppShell>
    )
}
