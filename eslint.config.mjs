// eslint.config.mjs
import nextConfig from 'eslint-config-next'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: ['src/styles/generated/'],
    },
    ...nextConfig,
    ...nextCoreWebVitals,
    ...nextTypescript,
    prettier,
    {
        rules: {
            // Removing the no-console rule as we can use a wrapper that checks the environment before logging
            // 'no-console': ['error', { allow: ['warn', 'error', 'log'] }],
            'no-unused-vars': ['error', { ignoreRestSiblings: true, varsIgnorePattern: '_+', argsIgnorePattern: '^_' }],
            semi: ['error', 'never'],
        },
    },
]
