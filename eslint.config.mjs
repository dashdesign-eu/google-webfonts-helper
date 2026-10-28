import js from '@eslint/js';
import parser from '@typescript-eslint/parser';
import typescript from '@typescript-eslint/eslint-plugin';

const globals = Object.fromEntries(['document', 'window', 'location', 'history', 'fetch', 'URL', 'URLSearchParams', 'FontFace', 'AbortController', 'setTimeout', 'clearTimeout', 'console', 'process', 'Buffer', 'require', '__dirname', 'module', 'describe', 'it', 'before', 'after', 'beforeEach', 'afterEach'].map(name => [name, 'readonly']));
export default [
  { ignores: ['dist/**', 'node_modules/**', 'client/static/**'] },
  { ...js.configs.recommended, files: ['client/native/**/*.js', 'scripts/**/*.mjs'], languageOptions: { globals } },
  { files: ['server/**/*.ts'], languageOptions: { parser, globals }, plugins: { '@typescript-eslint': typescript },
    rules: { ...typescript.configs.recommended.rules } }
];
