import baseConfig from '@nest-boot/eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: ['eslint.config.mjs', 'src/database/migrations/**'],
  },
  ...baseConfig,
  {
    rules: {
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowBoolean: true,
          allowNumber: true,
        },
      ],
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
    },
  },
  {
    files: ['**/*.spec.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'prefer-const': 'off',
    },
  },
];

export default config;
