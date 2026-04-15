import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        setupFiles: ['./tests/vitest.setup.ts'],
        mockReset: true,
        reporters: process.env.CI ? ['default', 'github-actions'] : ['verbose'],
        environment: 'happy-dom',
        include: ['src/**/*.(test).{js,jsx,ts,tsx}'],
        exclude: ['src/components/providers.test.tsx'],
        coverage: {
            enabled: true,
            // Eventually, after discussion, add some global rules
            // thresholds: { 100: true },
            thresholds: {
                lines: true,
            },
            include: ['src/**/*.{js,jsx,ts,tsx}'],
            exclude: ['src/components/providers.tsx', 'src/styles/**/*.ts', 'src/**/*.test.{js,jsx,ts,tsx}'],
            reportOnFailure: true,
        },
    },
})
