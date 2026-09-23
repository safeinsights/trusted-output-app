import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        setupFiles: ['./tests/vitest.setup.ts'],
        mockReset: true,
        reporters: process.env.CI ? ['default', 'github-actions'] : ['verbose'],
        environment: 'node',
        include: ['src/**/*.(test).{js,ts}'],
        coverage: {
            enabled: true,
            // Eventually, after discussion, add some global rules
            // thresholds: { 100: true },
            thresholds: {
                lines: true,
            },
            include: ['src/**/*.{js,ts}'],
            exclude: ['src/index.ts', 'src/**/*.test.{js,ts}'],
            reportOnFailure: true,
        },
    },
})
