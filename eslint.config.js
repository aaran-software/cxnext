import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    '**/dist/**',
    '**/node_modules/**',
    '**/.turbo/**',
    'package-lock.json',
    'apps/ecommerce/web/src/components/forms/ProtectedRoute.tsx',
    'apps/ecommerce/web/src/state/**',
    'apps/ui/**',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      ecmaVersion: 2023,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error'
    },
  },
  {
    files: ['apps/ecommerce/web/**/*.{ts,tsx}', 'apps/billing/web/**/*.{ts,tsx}', 'apps/ui/**/*.{ts,tsx}'],
    extends: [reactRefresh.configs.vite],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
