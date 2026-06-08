import { readFileSync } from 'node:fs';
import { test, expect } from 'vitest';

test('settings tab supports declarative definitions without requiring newer Obsidian', () => {
	const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
	const source = readFileSync('src/settings.ts', 'utf8');

	expect(manifest.minAppVersion).toBe('0.15.0');
	expect(source).toMatch(/getSettingDefinitions\s*\(/);
	expect(source).toContain('display(): void');
	expect(source).toContain("key: 'mySetting'");
	expect(source).toContain("key: 'showReleaseNotes'");
});
