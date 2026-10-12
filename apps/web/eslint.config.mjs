import parser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import a11y from 'eslint-plugin-jsx-a11y';
export default [
 { ignores: ['.next/**', 'node_modules/**'] },
 { files: ['**/*.{js,jsx,ts,tsx}'], languageOptions: { parser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } } },
   plugins: { react, 'react-hooks': hooks, 'jsx-a11y': a11y }, settings: { react: { version: 'detect' } },
   rules: { 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'warn', 'react/jsx-key': 'error', 'jsx-a11y/alt-text': 'error', 'jsx-a11y/label-has-associated-control': ['error', { depth: 5 }] } },
 { files: ['app/components/ui/label.tsx'], rules: { 'jsx-a11y/label-has-associated-control': 'off' } },
];
