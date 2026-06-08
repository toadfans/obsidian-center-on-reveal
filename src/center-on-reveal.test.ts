import { describe, expect, test } from 'vitest';
import {
	CenterRow,
	CenterScroller,
	FlashController,
	FlashRow,
	TimerApi,
	centerRow,
} from './center-on-reveal';

class FakeScroller implements CenterScroller {
	scrollTop = 500;
	clientHeight = 400;

	constructor(private top: number) {}

	getBoundingClientRect(): { top: number } {
		return { top: this.top };
	}
}

class FakeCenterRow implements CenterRow {
	offsetHeight = 20;

	constructor(private top: number) {}

	getBoundingClientRect(): { top: number } {
		return { top: this.top };
	}
}

class FakeFlashRow implements FlashRow {
	classes = new Set<string>();
	reflows = 0;
	offsetHeight = 20;

	get offsetWidth(): number {
		this.reflows++;
		return 100;
	}

	addClass(cls: string): void {
		this.classes.add(cls);
	}

	removeClass(cls: string): void {
		this.classes.delete(cls);
	}
}

function expectCentered(rowTop: number): void {
	const scroller = new FakeScroller(100);
	const row = new FakeCenterRow(rowTop);

	centerRow(scroller, row);

	expect(scroller.scrollTop).toBe(500 + rowTop - 100 - 190);
}

type PendingTimer = {
	callback: () => void;
	due: number;
};

function fakeTimer(): { api: TimerApi; activeCount: () => number; advance: (ms: number) => void } {
	let next = 1;
	let now = 0;
	const handles = new Map<number, PendingTimer>();

	return {
		activeCount: () => handles.size,
		advance(ms) {
			now += ms;
			const due = [...handles.entries()]
				.filter(([, timer]) => timer.due <= now)
				.sort((a, b) => a[1].due - b[1].due);
			for (const [id, timer] of due) {
				if (!handles.delete(id)) continue;
				timer.callback();
			}
		},
		api: {
			setTimeout(callback, delay) {
				const id = next++;
				handles.set(id, { callback, due: now + delay });
				return id;
			},
			clearTimeout(handle) {
				handles.delete(handle);
			},
		},
	};
}

describe('centerRow', () => {
	test('centers a row above the viewport', () => {
		expectCentered(40);
	});

	test('centers a row below the viewport', () => {
		expectCentered(650);
	});

	test('centers a visible row', () => {
		expectCentered(220);
	});
});

describe('FlashController', () => {
	test('moves the flash class from the previous row to the current row', () => {
		const timers = fakeTimer();
		const flash = new FlashController(timers.api);
		const first = new FakeFlashRow();
		const second = new FakeFlashRow();

		flash.flash(first);
		flash.flash(second);

		expect(first.classes.has('is-flashing')).toBe(false);
		expect(second.classes.has('is-flashing')).toBe(true);

		timers.advance(750);

		expect(second.classes.has('is-flashing')).toBe(false);
	});

	test('replays the animation when flashing the same row again', () => {
		const flash = new FlashController(fakeTimer().api);
		const row = new FakeFlashRow();

		flash.flash(row);
		flash.flash(row);

		expect(row.reflows).toBe(1);
		expect(row.classes.has('is-flashing')).toBe(true);
	});

	test('keeps only one active timeout while rows change quickly', () => {
		const timers = fakeTimer();
		const flash = new FlashController(timers.api);
		const first = new FakeFlashRow();
		const second = new FakeFlashRow();

		flash.flash(first);
		expect(timers.activeCount()).toBe(1);

		flash.flash(second);
		expect(timers.activeCount()).toBe(1);

		timers.advance(750);

		expect(timers.activeCount()).toBe(0);
		expect(second.classes.has('is-flashing')).toBe(false);
	});
});
