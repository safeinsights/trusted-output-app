import { describe, it, expect, vi, beforeEach } from 'vitest'
import { REQUIRED_ENV_VARS } from '@/lib/utils'

describe('server startup', () => {
    beforeEach(() => {
        vi.resetModules()
        vi.unstubAllEnvs()
    })

    it.each(REQUIRED_ENV_VARS)('refuses to boot when %s is missing', async (name) => {
        vi.stubEnv('NODE_ENV', 'production')
        vi.stubEnv('PORT', '0')
        for (const required of REQUIRED_ENV_VARS) {
            vi.stubEnv(required, required === name ? undefined : 'set-for-this-test')
        }

        const booted = await import('@/server').catch((error: Error) => error)

        if (!(booted instanceof Error)) {
            booted.server.close()
            throw new Error(`Server booted with ${name} missing; the startup assertion did not run`)
        }
        expect(booted.message).toContain(`Missing required environment variable: ${name}`)
    })
})
