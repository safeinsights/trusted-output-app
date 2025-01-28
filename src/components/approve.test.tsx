import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@/tests/test-utils'
import { Approve } from '@/components/approve-button'

describe('Approve', () => {
    it('renders approve button', () => {
        const { container } = render(<Approve fileName="test.csv" />)
        expect(container.querySelector('button')).toBeTruthy()
    })

    it('has correct text content', () => {
        const { container } = render(<Approve fileName="test.csv" />)
        expect(container.querySelector('button')?.textContent).toBe('Approve')
    })

    it('can be clicked', () => {
        const { container } = render(<Approve fileName="test.csv" />)
        const button = container.querySelector('button')
        expect(() => fireEvent.click(button!)).not.toThrow()
    })
})
