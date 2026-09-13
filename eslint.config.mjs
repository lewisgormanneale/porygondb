import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import angularPlugin from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import eslintConfigPrettier from 'eslint-config-prettier';

const tsTypeChecked = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: ['**/*.ts'],
}));

export default [
  {
    ignores: ['dist', 'coverage', 'build', 'node_modules', 'tmp'],
  },
  {
    name: 'eslint/base',
    files: ['**/*.{js,mjs,cjs,ts}'],
    ...js.configs.recommended,
  },
  {
    name: 'typescript/parser-options',
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['tsconfig.app.json', 'tsconfig.spec.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...tsTypeChecked,
  {
    name: 'angular/typescript',
    files: ['**/*.ts'],
    plugins: {
      '@angular-eslint': angularPlugin,
    },
    rules: {
      ...angularPlugin.configs.recommended.rules,
    },
  },
  {
    name: 'angular/templates',
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,
    },
  },
  {
    name: 'typescript/spec-overrides',
    files: ['**/*.spec.ts'],
    rules: {
      // Angular's testing APIs (e.g. `ComponentFixture.nativeElement`) are typed
      // `any`, and test mocks intentionally use loose shapes for fixture data.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    name: 'prettier/compat',
    rules: eslintConfigPrettier.rules,
  },
];
