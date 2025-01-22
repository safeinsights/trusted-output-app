import { render } from '@/tests/test-utils'
import { SafeInsightsLogo } from './si-logo'
import { describe, it, expect } from 'vitest'

describe('SafeInsightsLogo', () => {
    it('renders correctly', () => {
        const { container } = render(<SafeInsightsLogo />)
        const svgElement = container.querySelector('svg')
        expect(svgElement).not.toBeNull() // Ensure the SVG element exists
    })

    it('accepts and applies custom props', () => {
        const { container } = render(<SafeInsightsLogo data-testid="custom-logo" className="test-class" />)
        const svgElement = container.querySelector('svg')
        expect(svgElement).not.toBeNull() // Ensure the SVG element exists

        // Check the custom props
        if (svgElement) {
            expect(svgElement.getAttribute('data-testid')).toBe('custom-logo')
            expect(svgElement.classList.contains('test-class')).toBe(true)
        }
    })
})
