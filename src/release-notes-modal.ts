import { App, Component, MarkdownRenderer, Modal } from 'obsidian';
import type ObpluginPlugin from './main';
import { formatChangelogEntries, getChangelogEntries, selectChangelogVersions } from './changelog';

const MAX_ENTRIES = 10;

export interface ReleaseNotesOptions {
	title?: string;
	persistVersion?: boolean;
	message?: string;
}

export class ReleaseNotesModal extends Modal {
	private plugin: ObpluginPlugin;
	private options: ReleaseNotesOptions;
	private version: string;
	private renderHost: Component;

	constructor(
		app: App,
		plugin: ObpluginPlugin,
		version: string,
		options: ReleaseNotesOptions = {},
	) {
		super(app);
		this.plugin = plugin;
		this.version = version;
		this.options = options;
		this.renderHost = new Component();
	}

	onOpen(): void {
		this.titleEl.setText(
			this.options.title ?? `${this.plugin.manifest.name} - What's new ${this.version}`,
		);
		this.renderHost.load();
		void this.renderBody();
	}

	onClose(): void {
		this.contentEl.empty();
		this.renderHost.unload();
		if (this.options.persistVersion === false) return;
		void this.persistVersion();
	}

	private async persistVersion(): Promise<void> {
		await this.plugin.loadSettings();
		if (this.plugin.settings.previousRelease !== this.version) {
			this.plugin.settings.previousRelease = this.version;
			await this.plugin.saveSettings();
		}
	}

	private async renderBody(): Promise<void> {
		const markdown = this.options.message ?? this.buildMarkdown();
		await MarkdownRenderer.render(this.app, markdown, this.contentEl, '', this.renderHost);

		const footer = this.contentEl.createEl('p', { cls: 'obplugin-release-notes-footer' });
		const close = footer.createEl('button', { text: 'Close' });
		close.addEventListener('click', () => this.close());
	}

	private buildMarkdown(): string {
		const { versions, bodies } = getChangelogEntries();
		const selected = selectChangelogVersions(
			versions,
			this.plugin.settings.previousRelease,
			this.version,
		).slice(0, MAX_ENTRIES);

		return formatChangelogEntries(selected, bodies);
	}
}
