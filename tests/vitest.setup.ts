import { afterEach, beforeAll, beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom'
import { UPLOAD_DIR } from '@/app/utils'
import mockFs from 'mock-fs'

beforeAll(() => {
    vi.mock('next/navigation', () => require('next-router-mock'))
})

beforeEach(() => {
    mockFs({
        [UPLOAD_DIR]: {},
    })
})

afterEach(() => {
    mockFs.restore()
})
