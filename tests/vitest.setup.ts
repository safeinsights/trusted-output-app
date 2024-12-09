import { afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { UPLOAD_DIR } from '@/app/utils'
import mockFs from 'mock-fs'
import '@testing-library/jest-dom'

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
