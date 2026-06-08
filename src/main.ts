import { Plugin } from 'obsidian';
import { CenterOnRevealController } from './center-on-reveal';

export default class CenterOnRevealPlugin extends Plugin {
	private controller!: CenterOnRevealController;
	private unloaded = false;

	onload(): void {
		this.controller = new CenterOnRevealController(this.app);

		this.app.workspace.onLayoutReady(() => {
			if (this.unloaded) return;
			void this.controller.start();
		});

		this.registerEvent(this.app.workspace.on('file-open', () => this.controller.centerSoon()));
	}

	onunload(): void {
		this.unloaded = true;
		this.controller.clear();
	}
}
