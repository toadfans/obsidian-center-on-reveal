import { readFile } from 'node:fs/promises';
import { defineConfig } from 'vitest/config';

function markdownText() {
	return {
		name: 'markdown-text',
		enforce: 'pre' as const,
		async load(id: string) {
			if (!id.endsWith('.md')) return null;
			const source = await readFile(id, 'utf8');
			return `export default ${JSON.stringify(source)};`;
		},
	};
}

export default defineConfig({
	plugins: [markdownText()],
	test: {
		includeSource: ['src/**/*.ts'],
	},
});
