import { beforeAll, vi } from 'vitest'
beforeAll(() => {
    vi.mock('next/navigation', () => require('next-router-mock'))
})
