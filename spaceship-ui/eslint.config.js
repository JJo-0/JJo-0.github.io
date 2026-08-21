import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import svelteParser from 'svelte-eslint-parser';
import tsParser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  ...astro.configs.recommended,
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: ts.configs.base.languageOptions.parser,
        extraFileExtensions: ['.svelte'],
      },
    },
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astro.parser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.astro'],
      },
    },
  },
  {
    files: ['**/*.svelte.ts'],
    languageOptions: {
      parser: tsParser,
    },
  },
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'svelte/no-at-html-tags': 'off',
    },
  },
  {
    // Browser audits intentionally wrap polling failures with URL/hit-test
    // diagnostics, and teardown may race an already-closed CDP target. Keep
    // both exceptions scoped to test infrastructure rather than production.
    files: ['scripts/browser-*.mjs'],
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      'preserve-caught-error': 'off',
    },
  },
  {
    ignores: ['dist/', '.astro/', 'src/env.d.ts', 'tmp/'],
  },
];
