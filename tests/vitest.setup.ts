import { afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { UPLOAD_DIR } from '@/app/utils'
import mockFs from 'mock-fs'

const OLD_ENV = process.env

beforeAll(() => {
    vi.mock('next/navigation', () => require('next-router-mock'))
})

beforeEach(() => {
    mockFs({
        [UPLOAD_DIR]: {},
    })
    process.env = { ...OLD_ENV } // Make a copy
})

afterEach(() => {
    mockFs.restore()
    process.env = OLD_ENV // Restore old environment
})
