import { defineConfig, globalIgnores } from 'eslint/config';
import obsidianmd from 'eslint-plugin-obsidianmd';
import { parser as tsparser } from 'typescript-eslint';

export default defineConfig([
	globalIgnores(['node_modules', 'main.js', 'esbuild.config.ts', 'scripts', '*.json']),
	...obsidianmd.configs.recommended,
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: tsparser,
			parserOptions: { project: './tsconfig.json' },
		},
		rules: {
			'obsidianmd/sample-names': 'off',
			'obsidianmd/prefer-file-manager-trash-file': 'error',
		},
	},
]);
