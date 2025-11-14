// @ts-check
import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
        ...globals.jest,
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'error',

      // General rules
      'no-console': ['error', { allow: ['log'] }],
      'no-underscore-dangle': 'off',
      'no-plusplus': 'off',
      'no-param-reassign': 'off',
      'no-restricted-syntax': 'off',
      'no-use-before-define': 'off',
      'max-len': 'off',
      'comma-dangle': 'off',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'indent': ['error', 2, { SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'object-curly-newline': 'off',
      'arrow-body-style': 'off',
      'consistent-return': 'off',
      'generator-star-spacing': 'off',
      'global-require': 'warn',
      'no-bitwise': 'off',
      'no-cond-assign': 'off',
      'no-else-return': 'off',
      'no-nested-ternary': 'off',
      'require-yield': 'warn',
      'class-methods-use-this': 'off',
      'no-confusing-arrow': 'off',
      'no-unused-expressions': 'off',

      // React rules
      'react/jsx-filename-extension': [
        'warn',
        {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
      'react/jsx-no-bind': 'off',
      'react/prop-types': 'off',
      'react/no-array-index-key': 'off',
      'react/forbid-prop-types': 'off',
      'react/prefer-stateless-function': 'off',
      'react/sort-comp': 'off',
      'react/no-did-mount-set-state': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import rules
      'import/extensions': 'off',
      'import/no-unresolved': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/prefer-default-export': 'off',

      // JSX A11y rules
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'build/**', 'doc/**'],
  },
]);
