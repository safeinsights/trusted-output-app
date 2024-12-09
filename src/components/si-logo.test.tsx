import { render } from '@testing-library/react'
import { SafeInsightsLogo } from './si-logo'
import { describe, it, expect } from 'vitest'

describe('SafeInsightsLogo', () => {
    it('renders correctly', () => {
        const { container } = render(<SafeInsightsLogo />)
        expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('accepts and applies custom props', () => {
        const { container } = render(<SafeInsightsLogo data-testid="custom-logo" className="test-class" />)
        const svgElement = container.querySelector('svg')
        expect(svgElement).toHaveAttribute('data-testid', 'custom-logo')
        expect(svgElement).toHaveClass('test-class')
    })
})
