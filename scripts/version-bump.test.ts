import { mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { spawnSync } from 'child_process';
import { test, expect } from 'vitest';

test('syncs manifest and versions to package version', () => {
	const dir = mkdtempSync(join(tmpdir(), 'version-bump-'));
	const script = resolve('scripts/version-bump.ts');

	writeFileSync(
		join(dir, 'package.json'),
		JSON.stringify({ name: 'obsidian-center-on-reveal', version: '0.0.2' }, null, '\t'),
	);
	writeFileSync(
		join(dir, 'manifest.json'),
		JSON.stringify({ version: '0.0.1', minAppVersion: '0.15.0' }, null, '\t'),
	);
	writeFileSync(join(dir, 'versions.json'), JSON.stringify({ '1.0.0': '0.15.0' }, null, '\t'));

	const result = spawnSync('bun', [script], {
		cwd: dir,
		env: process.env,
		encoding: 'utf8',
	});

	expect(result.stderr).toBe('');
	expect(result.status).toBe(0);
	expect(JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')).version).toBe('0.0.2');

	const versions = JSON.parse(readFileSync(join(dir, 'versions.json'), 'utf8'));
	expect(versions['0.0.2']).toBe('0.15.0');
});
