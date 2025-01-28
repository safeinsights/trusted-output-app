import { describe, it, expect } from 'vitest'
import { render } from '@/tests/test-utils'
import { AppLayout } from '@/components/app-layout'

describe('AppLayout', () => {
    it('renders header with logo and title', () => {
        const { container } = render(
            <AppLayout>
                <div>Test Content</div>
            </AppLayout>,
        )

        expect(container.querySelector('.mantine-AppShell-header')).toBeTruthy()
        expect(container.querySelector('a[href="/"]')).toBeTruthy()
        expect(container.querySelector('h3')?.textContent).toBe('Trusted Output App')
    })

    it('renders children content', () => {
        const { container } = render(
            <AppLayout>
                <div data-testid="test-content">Test Content</div>
            </AppLayout>,
        )

        expect(container.querySelector('.mantine-AppShell-main')).toBeTruthy()
        expect(container.querySelector('[data-testid="test-content"]')?.textContent).toBe('Test Content')
    })

    it('renders footer', () => {
        const { container } = render(
            <AppLayout>
                <div>Test Content</div>
            </AppLayout>,
        )

        expect(container.querySelector('.mantine-AppShell-footer')?.textContent).toBe('A SafeInsights production')
    })

    it('renders notifications component', () => {
        const { container } = render(
            <AppLayout>
                <div>Test Content</div>
            </AppLayout>,
        )

        expect(container.querySelector('.mantine-Notifications-root')).toBeDefined()
    })
})
