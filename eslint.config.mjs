// eslint.config.mjs
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier/flat'
import antiTrojanSource from 'eslint-plugin-anti-trojan-source'

export default tseslint.config(
    {
        ignores: ['dist/', 'coverage/'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        // Node globals for JS/CJS/MJS config files (e.g. vitest.config.mjs), which
        // are not TypeScript and so keep core `no-undef` active.
        files: ['**/*.{js,cjs,mjs}'],
        languageOptions: {
            globals: {
                process: 'readonly',
                console: 'readonly',
                __dirname: 'readonly',
                module: 'readonly',
                require: 'readonly',
            },
        },
    },
    {
        plugins: { 'anti-trojan-source': antiTrojanSource },
        rules: { 'anti-trojan-source/no-bidi': 'error' },
    },
    {
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { ignoreRestSiblings: true, varsIgnorePattern: '_+', argsIgnorePattern: '^_' },
            ],
            semi: ['error', 'never'],
        },
    },
)
