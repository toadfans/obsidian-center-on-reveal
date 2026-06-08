import changelogSource from '../CHANGELOG.md';

export interface ChangelogEntries {
	versions: string[];
	bodies: Record<string, string>;
}

let cached: ChangelogEntries | null = null;

export function getChangelogEntries(): ChangelogEntries {
	if (cached) return cached;
	cached = parseChangelog(changelogSource);
	return cached;
}

function parseChangelog(source: string): ChangelogEntries {
	const versions: string[] = [];
	const bodies: Record<string, string> = {};

	const headingRegex = /^##\s+\[([^\]]+)\][^\n]*$/gm;
	const matches: { version: string; start: number; end: number }[] = [];
	let m: RegExpExecArray | null;
	while ((m = headingRegex.exec(source)) !== null) {
		const label = m[1];
		if (!label) continue;
		matches.push({ version: label.trim(), start: m.index, end: m.index + m[0].length });
	}

	for (let i = 0; i < matches.length; i++) {
		const current = matches[i];
		if (!current) continue;
		if (!isReleasedVersion(current.version)) continue;
		const next = matches[i + 1];
		const body = source.slice(current.end, next ? next.start : source.length).trim();
		versions.push(current.version);
		bodies[current.version] = body;
	}

	return { versions, bodies };
}

function isReleasedVersion(label: string): boolean {
	return /^\d+\.\d+\.\d+/.test(label);
}

function parseSemver(value: string): [number, number, number] | null {
	const m = value.match(/(\d+)\.(\d+)\.(\d+)/);
	if (!m) return null;
	const [, a, b, c] = m;
	return [parseInt(a ?? '0', 10), parseInt(b ?? '0', 10), parseInt(c ?? '0', 10)];
}

export function isVersionNewerThanOther(version: string, other: string): boolean {
	if (!version || !other) return Boolean(version);
	const v = parseSemver(version);
	const o = parseSemver(other);
	if (!v || !o) return false;
	for (let i = 0; i < 3; i++) {
		const a = v[i] ?? 0;
		const b = o[i] ?? 0;
		if (a !== b) return a > b;
	}
	return false;
}

function compareSemverDesc(a: string, b: string): number {
	const av = parseSemver(a);
	const bv = parseSemver(b);
	if (!av || !bv) return 0;
	for (let i = 0; i < 3; i++) {
		const diff = (bv[i] ?? 0) - (av[i] ?? 0);
		if (diff !== 0) return diff;
	}
	return 0;
}

export function selectChangelogVersions(
	versions: string[],
	oldVersion: string,
	newVersion: string,
): string[] {
	return versions
		.filter((v) => {
			if (!oldVersion) return false;
			if (!isVersionNewerThanOther(v, oldVersion)) return false;
			if (isVersionNewerThanOther(v, newVersion)) return false;
			return true;
		})
		.sort(compareSemverDesc);
}

export function formatChangelogEntries(versions: string[], bodies: Record<string, string>): string {
	if (versions.length === 0) return 'No release notes available.';
	if (versions.length === 1) return bodies[versions[0] ?? ''] ?? '';
	return versions.map((v) => `# ${v}\n\n${bodies[v] ?? ''}`).join('\n\n---\n\n');
}

if (import.meta.vitest) {
	const { describe, expect, it } = import.meta.vitest;

	describe('isVersionNewerThanOther', () => {
		it('detects when a semantic version is newer', () => {
			expect(isVersionNewerThanOther('1.2.4', '1.2.3')).toBe(true);
			expect(isVersionNewerThanOther('1.2.3', '1.2.3')).toBe(false);
			expect(isVersionNewerThanOther('1.2.2', '1.2.3')).toBe(false);
		});
	});

	describe('selectChangelogVersions', () => {
		it('returns no entries when old version is empty', () => {
			expect(selectChangelogVersions(['0.0.3', '0.0.2'], '', '0.0.3')).toEqual([]);
		});

		it('returns only entries newer than old version and not newer than new version', () => {
			expect(
				selectChangelogVersions(['0.0.4', '0.0.3', '0.0.2', '0.0.1'], '0.0.1', '0.0.3'),
			).toEqual(['0.0.3', '0.0.2']);
		});
	});

	describe('formatChangelogEntries', () => {
		it('omits the version heading when there is only one entry', () => {
			expect(formatChangelogEntries(['0.0.3'], { '0.0.3': '### Fix\n\n- one' })).toBe(
				'### Fix\n\n- one',
			);
		});
	});
}
