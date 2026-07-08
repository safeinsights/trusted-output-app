import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        setupFiles: ['./tests/vitest.setup.ts'],
        mockReset: true,
        reporters: process.env.CI ? ['default', 'github-actions'] : ['verbose'],
        environment: 'node',
        env: { NODE_ENV: 'test' },
        include: ['src/**/*.(test).{js,jsx,ts,tsx}'],
        coverage: {
            enabled: true,
            thresholds: {
                lines: true,
            },
            include: ['src/**/*.{js,jsx,ts,tsx}'],
            exclude: ['src/**/*.test.{js,jsx,ts,tsx}'],
            reportOnFailure: true,
        },
    },
})
