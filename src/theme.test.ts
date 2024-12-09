import { theme } from './theme'
import { describe, it, expect } from 'vitest'

describe('theme', () => {
    it('should define a Mantine theme', () => {
        expect(theme).toBeDefined()
    })
})
