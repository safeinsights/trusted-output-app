import { afterEach, beforeEach } from 'vitest'

const OLD_ENV = process.env

beforeEach(() => {
    process.env = { ...OLD_ENV } // Make a copy
})

afterEach(() => {
    process.env = OLD_ENV // Restore old environment
})
