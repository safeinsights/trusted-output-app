import { render, screen } from '@testing-library/react'
import { AppLayout } from './app-layout'
import { describe, expect, it } from 'vitest'

describe('AppLayout Component', () => {
    it('renders the children inside the layout', () => {
        render(
            <AppLayout>
                <div data-testid="test-child">Test Content</div>
            </AppLayout>,
        )
        expect(screen.getByTestId('test-child')).toHaveTextContent('Test Content')
    })

    it('displays the SafeInsights logo', () => {
        render(
            <AppLayout>
                <div />
            </AppLayout>,
        )
        const logoLink = screen.getByRole('link', { name: /safeinsights logo/i })
        expect(logoLink).toBeInTheDocument()
        expect(logoLink.getAttribute('href')).toBe('/') // Optional: Check link destination
    })

    it('contains the header with the correct text', () => {
        render(
            <AppLayout>
                <div />
            </AppLayout>,
        )
        expect(screen.getByRole('heading', { level: 3, name: /trusted output app/i })).toBeInTheDocument()
    })

    it('displays the footer text', () => {
        render(
            <AppLayout>
                <div />
            </AppLayout>,
        )
        expect(screen.getByText(/a safeinsights production/i)).toBeInTheDocument()
    })

    it('renders the Notifications component', () => {
        render(
            <AppLayout>
                <div />
            </AppLayout>,
        )
        // Assuming Notifications renders a region with aria-label or accessible name
        expect(screen.getByRole('region', { name: /notifications/i })).toBeInTheDocument()
    })
})
