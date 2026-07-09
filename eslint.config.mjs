// eslint.config.mjs
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier/flat'
import antiTrojanSource from 'eslint-plugin-anti-trojan-source'
import globals from 'globals'

/** @type {import('eslint').Linter.Config[]} */
const config = [
    {
        ignores: ['vendor/**', 'dist/**', 'coverage/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        languageOptions: {
            globals: { ...globals.node },
        },
    },
    {
        plugins: { 'anti-trojan-source': antiTrojanSource },
        rules: { 'anti-trojan-source/no-bidi': 'error' },
    },
    {
        rules: {
            // Removing the no-console rule as we can use a wrapper that checks the environment before logging
            // 'no-console': ['error', { allow: ['warn', 'error', 'log'] }],
            // TypeScript itself catches undefined references; the core rule produces false positives on TS types.
            'no-undef': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { ignoreRestSiblings: true, varsIgnorePattern: '_+', argsIgnorePattern: '^_' },
            ],
            semi: ['error', 'never'],
        },
    },
]

export default config
