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
        projectService: true,
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
    name: 'prettier/compat',
    rules: eslintConfigPrettier.rules,
  },
];
