import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const shouldInstall = process.argv.includes('--install');
const REQUIRED_ARTIFACTS = ['main.js', 'manifest.json'];
const OPTIONAL_ARTIFACTS = ['styles.css'];

function isCiEnvironment() {
	return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
}

function hasObsidianCli() {
	const result = spawnSync('obsidian', ['version'], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
	});

	if (result.error === undefined) {
		return true;
	}

	if (result.error.code === 'ENOENT') {
		return false;
	}

	throw result.error;
}

function runObsidianCommand(args) {
	return execFileSync('obsidian', args, {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
	}).trim();
}

function getInstalledPluginIds() {
	const result = runObsidianCommand(['plugins']);
	return result
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
}

if (isCiEnvironment()) {
	console.log('[obsidian-sync] Skipping local vault sync in CI.');
	process.exit(0);
}

if (!hasObsidianCli()) {
	console.log('[obsidian-sync] Skipping local vault sync because obsidian CLI is unavailable.');
	process.exit(0);
}

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const pluginId = manifest.id;

if (!pluginId) {
	throw new Error('[obsidian-sync] manifest.json is missing an id.');
}

if (!shouldInstall) {
	const installedPluginIds = getInstalledPluginIds();
	if (!installedPluginIds.includes(pluginId)) {
		console.log(
			`[obsidian-sync] Plugin ${pluginId} is not installed in the current vault; skipping sync.`,
		);
		process.exit(0);
	}
}

const vaultPath = runObsidianCommand(['vault', 'info=path']);

if (!vaultPath) {
	throw new Error('[obsidian-sync] Unable to resolve the current vault path.');
}

const pluginDir = path.join(vaultPath, '.obsidian', 'plugins', pluginId);
mkdirSync(pluginDir, { recursive: true });

for (const fileName of REQUIRED_ARTIFACTS) {
	if (!existsSync(fileName)) {
		throw new Error(`[obsidian-sync] Missing build artifact: ${fileName}.`);
	}

	cpSync(fileName, path.join(pluginDir, fileName));
}

for (const fileName of OPTIONAL_ARTIFACTS) {
	if (!existsSync(fileName)) {
		continue;
	}

	cpSync(fileName, path.join(pluginDir, fileName));
}

if (shouldInstall) {
	runObsidianCommand(['plugin:enable', `id=${pluginId}`]);
}

runObsidianCommand(['plugin:reload', `id=${pluginId}`]);

if (shouldInstall) {
	console.log(`[obsidian-sync] Installed plugin ${pluginId} into ${pluginDir} and reloaded it.`);
} else {
	console.log(`[obsidian-sync] Synced plugin ${pluginId} to ${pluginDir} and reloaded it.`);
}
