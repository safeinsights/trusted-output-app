import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import RootLayout from './layout'

describe('RootLayout', () => {
    it('renders children correctly', () => {
        render(
            <RootLayout>
                <div data-testid="test-child">Test Content</div>
            </RootLayout>,
        )

        // Assert that the child is rendered
        const child = screen.getByTestId('test-child')
        expect(child).not.toBeNull()
        expect(child.textContent).toBe('Test Content')
    })
})
