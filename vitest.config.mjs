import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths(), vanillaExtractPlugin()],
    setupFiles: './vitest.setup.ts',
    test: {
        mockReset: true,
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
            exclude: ['src/components/providers.tsx'],
            reportOnFailure: true,
        },
    },
})
