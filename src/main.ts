import { App, Editor, MarkdownFileInfo, MarkdownView, Modal, Notice, Plugin } from 'obsidian';
import { isVersionNewerThanOther } from './changelog';
import { ReleaseNotesModal } from './release-notes-modal';
import { DEFAULT_SETTINGS, ObpluginPluginSettings, ObpluginSettingTab } from './settings';

export default class ObpluginPlugin extends Plugin {
	settings!: ObpluginPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('dice', 'Obplugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is an obplugin notice!');
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status bar text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-modal-simple',
			name: 'Open modal (simple)',
			callback: () => {
				new ObpluginModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'replace-selected',
			name: 'Replace selected content',
			editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
				editor.replaceSelection('Obplugin editor command');
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-modal-complex',
			name: 'Open modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new ObpluginModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
				return false;
			},
		});

		this.addCommand({
			id: 'show-release-notes',
			name: 'Show release notes',
			callback: () => {
				new ReleaseNotesModal(this.app, this, this.manifest.version).open();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ObpluginSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(activeDocument, 'click', (evt: MouseEvent) => {
		// 	new Notice('Click');
		// });

		this.app.workspace.onLayoutReady(() => this.maybeShowReleaseNotes());
	}

	private maybeShowReleaseNotes(): void {
		if (!this.settings.showReleaseNotes) return;
		const current = this.manifest.version;
		const previous = this.settings.previousRelease;
		if (!previous) {
			this.settings.previousRelease = current;
			void this.saveSettings();
			return;
		}
		if (!isVersionNewerThanOther(current, previous)) return;
		new ReleaseNotesModal(this.app, this, current).open();
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<ObpluginPluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ObpluginModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
