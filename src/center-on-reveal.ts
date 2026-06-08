import type { App } from 'obsidian';

const FILE_EXPLORER = 'file-explorer';
const FLASH_CLASS = 'is-flashing';
const FLASH_DURATION_MS = 750;
const MAX_FRAME_RETRIES = 10;
const SCROLLER_SELECTOR = ".workspace-leaf-content[data-type='file-explorer'] .nav-files-container";
const ACTIVE_ROW_SELECTOR = '.nav-file-title.is-active, .tree-item-self.is-active';

type FileExplorerView = {
	setAutoReveal?: (value: boolean) => void;
	revealActiveFile?: () => void;
};

export interface CenterScroller {
	scrollTop: number;
	clientHeight: number;
	getBoundingClientRect(): { top: number };
}

export interface CenterRow {
	offsetHeight: number;
	getBoundingClientRect(): { top: number };
}

export interface FlashRow {
	readonly offsetWidth: number;
	addClass(cls: string): void;
	removeClass(cls: string): void;
}

export interface TimerApi {
	setTimeout(callback: () => void, delay: number): number;
	clearTimeout(handle: number): void;
}

export function centerRow(scroller: CenterScroller, row: CenterRow): void {
	const sRect = scroller.getBoundingClientRect();
	const rRect = row.getBoundingClientRect();
	scroller.scrollTop += rRect.top - sRect.top - (scroller.clientHeight - row.offsetHeight) / 2;
}

export class FlashController {
	private flashEl: FlashRow | null = null;
	private flashTimer: number | null = null;

	constructor(
		private timer: TimerApi,
		private durationMs = FLASH_DURATION_MS,
	) {}

	flash(row: FlashRow): void {
		if (this.flashTimer !== null) this.timer.clearTimeout(this.flashTimer);
		if (this.flashEl && this.flashEl !== row) this.flashEl.removeClass(FLASH_CLASS);
		if (this.flashEl === row) {
			row.removeClass(FLASH_CLASS);
			void row.offsetWidth;
		}

		row.addClass(FLASH_CLASS);
		this.flashEl = row;
		this.flashTimer = this.timer.setTimeout(() => {
			row.removeClass(FLASH_CLASS);
			if (this.flashEl === row) this.flashEl = null;
			this.flashTimer = null;
		}, this.durationMs);
	}

	clear(): void {
		if (this.flashTimer !== null) this.timer.clearTimeout(this.flashTimer);
		this.flashEl?.removeClass(FLASH_CLASS);
		this.flashEl = null;
		this.flashTimer = null;
	}
}

export class CenterOnRevealController {
	constructor(
		private app: App,
		private flashController = new FlashController(browserTimer()),
	) {}

	async start(): Promise<void> {
		await this.enableBuiltinAutoReveal();
		this.centerSoon();
	}

	centerSoon(): void {
		if (this.centerAndFlash()) return;

		let frames = 0;
		const tick = () => {
			if (this.centerAndFlash() || ++frames > MAX_FRAME_RETRIES) return;
			window.requestAnimationFrame(tick);
		};
		window.requestAnimationFrame(tick);
	}

	clear(): void {
		this.flashController.clear();
	}

	private async enableBuiltinAutoReveal(): Promise<void> {
		const leaf = this.app.workspace.getLeavesOfType(FILE_EXPLORER)[0];
		if (!leaf) return;
		if (leaf.isDeferred) await leaf.loadIfDeferred();

		const view = leaf.view as unknown as FileExplorerView;
		if (typeof view.setAutoReveal !== 'function') {
			console.error(
				'[center-on-reveal] file-explorer view has no setAutoReveal(); internal API may have changed',
			);
			return;
		}

		view.setAutoReveal(true);
		view.revealActiveFile?.();
		void this.app.workspace.requestSaveLayout();
	}

	private centerAndFlash(): boolean {
		const scroller = this.getExplorerScroller();
		if (!scroller || scroller.clientHeight === 0) return false;

		const row = scroller.querySelector<HTMLElement>(ACTIVE_ROW_SELECTOR);
		if (!row) return false;

		centerRow(scroller, row);
		this.flashController.flash(row);
		return true;
	}

	private getExplorerScroller(): HTMLElement | null {
		return activeDocument.querySelector<HTMLElement>(SCROLLER_SELECTOR);
	}
}

function browserTimer(): TimerApi {
	return {
		setTimeout: (callback, delay) => window.setTimeout(callback, delay),
		clearTimeout: (handle) => window.clearTimeout(handle),
	};
}
