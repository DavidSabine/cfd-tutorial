import {
	canStepBack,
	canStepForward,
	createPlayback,
	frameMs,
	parseSpeed,
	replaceLength,
	replaceSpeed,
	resetPlayback,
	stepBack,
	stepForward,
	tick,
	togglePlay,
	type Playback,
} from "./playback";
import type { FlowTable } from "./parse-csv";
import { formatLaw, lawWindow, littleLaw, type LawWindow } from "./little-law";
import { renderBoard } from "./render-board";
import { renderChart } from "./render-chart";
import type { CfdConfig } from "./resolve-config";
import { renderTable } from "./render-table";
import { findSample, SAMPLES } from "./samples";

type Glow = {
	day: number | null;
	state: number | null;
	cardId: number | null;
};

const SPEEDS = [
	["0.5", "0.5×"],
	["1", "1×"],
	["2", "2×"],
	["4", "4×"],
] as const;

function el<T extends keyof HTMLElementTagNameMap>(
	tag: T,
	className: string,
): HTMLElementTagNameMap[T] {
	const node = document.createElement(tag);
	node.className = `box-border ${className}`;
	return node;
}

function button(label: string, extra = ""): HTMLButtonElement {
	const node = el("button", extra ? `btn ${extra}` : "btn");
	node.type = "button";
	node.textContent = label;
	return node;
}

function sampleControl(selectedId: string, onChange: (id: string) => void): HTMLLabelElement {
	const label = el("label", "flex items-center gap-2 m-0 text-xs text-muted");
	label.append("Sample");
	const select = el("select", "btn");
	for (const sample of SAMPLES) {
		const option = document.createElement("option");
		option.value = sample.id;
		option.textContent = sample.label;
		option.selected = sample.id === selectedId;
		select.append(option);
	}
	select.addEventListener("change", () => {
		onChange(select.value);
	});
	label.append(select);
	return label;
}

function checkControl(text: string, onChange: (checked: boolean) => void): HTMLLabelElement {
	const label = el("label", "flex items-center gap-2 m-0 text-xs text-muted");
	const input = el("input", "m-0");
	input.type = "checkbox";
	input.addEventListener("change", () => {
		onChange(input.checked);
	});
	label.append(input, text);
	return label;
}

function speedControl(onChange: (value: string) => void): HTMLLabelElement {
	const label = el("label", "flex items-center gap-2 m-0 text-xs text-muted");
	label.append("Speed");
	const select = el("select", "btn");
	for (const [value, text] of SPEEDS) {
		const option = document.createElement("option");
		option.value = value;
		option.textContent = text;
		option.selected = value === "1";
		select.append(option);
	}
	select.addEventListener("change", () => {
		onChange(select.value);
	});
	label.append(select);
	return label;
}

export function renderShell(root: HTMLElement, config: CfdConfig, onResize: () => void): () => void {
	const header = el(
		"header",
		"flex items-center justify-between gap-4 border-b px-4 py-3",
	);
	const title = el("h1", "m-0 text-lg");
	title.textContent = config.title;
	const brand = el("div", "text-sm");
	brand.innerHTML = config.brand;
	header.append(title, brand);

	const chart = el("section", "chart flex flex-col flex-1 min-h-chart rounded-md border border-border");
	chart.setAttribute("aria-label", "Cumulative flow diagram");
	const readout = el("p", "readout m-0 px-2 pt-2 text-xs text-muted");
	readout.hidden = true;
	const plot = el("div", "flex flex-col flex-1 min-h-0");
	chart.append(readout, plot);
	const board = el(
		"section",
		"board flex-1 min-h-board overflow-auto rounded-md border border-border",
	);
	board.setAttribute("aria-label", "Kanban board");
	const stack = el("div", "flex flex-col grow-2 gap-4");
	stack.append(chart, board);

	const table = el(
		"section",
		"sheet grow-1 min-h-0 overflow-auto rounded-md border border-border font-mono",
	);
	table.setAttribute("aria-label", "Data table");
	const loaded = findSample(config.sample);
	if (loaded.usedFallback) {
		console.warn(`CFD: unknown sample "${config.sample}". Showing ${loaded.sample.label}.`);
	}
	let tableData: FlowTable = loaded.sample.table;
	let playback: Playback = createPlayback(tableData.rows.length);
	let hideDone = false;
	let showLaw = false;
	let draggedWindow: LawWindow | null = null;
	let selection: Glow = { day: null, state: null, cardId: null };
	const main = el("div", "flex flex-1 gap-4 p-4");
	main.append(stack, table);

	const back = button("Back");
	const play = button("Play", "btn-primary");
	const forward = button("Forward");
	const reset = button("Reset");
	const status = el("p", "playhead m-0 text-xs text-muted");
	status.setAttribute("aria-live", "polite");
	const player = el("div", "flex flex-wrap items-center gap-2");
	player.setAttribute("role", "group");
	player.setAttribute("aria-label", "Playback");

	let timer: ReturnType<typeof setInterval> | undefined;
	function clearTimer(): void {
		if (timer !== undefined) {
			clearInterval(timer);
			timer = undefined;
		}
	}
	function choose(next: Glow): void {
		selection = next;
		paint();
	}
	function paint(): void {
		const span = showLaw ? lawWindow(playback.day, draggedWindow) : null;
		const figures = span === null ? null : littleLaw(tableData, span);
		readout.hidden = figures === null;
		readout.textContent = figures === null ? "" : formatLaw(figures);
		renderChart(
			plot,
			root,
			tableData,
			playback.day,
			hideDone,
			selection,
			figures === null || span === null ? null : { figures, window: span },
			(pick) => {
				choose({ day: pick.day, state: pick.state, cardId: null });
			},
			(next, committed) => {
				draggedWindow = next;
				paint();
				if (committed) {
					onResize();
				}
			},
		);
		renderTable(table, tableData, playback.day, selection, (pick) => {
			choose({ day: pick.day, state: pick.state, cardId: null });
		});
		renderBoard(
			board,
			tableData,
			playback.day,
			{ state: selection.state, cardId: selection.cardId },
			(next) => {
				choose({
					day: playback.day > 0 ? playback.day : null,
					state: next.state,
					cardId: next.cardId,
				});
			},
		);
		back.disabled = !canStepBack(playback);
		forward.disabled = !canStepForward(playback);
		reset.disabled = playback.day === 0 && !playback.playing;
		play.disabled = !playback.playing && !canStepForward(playback);
		play.textContent = playback.playing ? "Pause" : "Play";
		status.textContent = `Day ${playback.day} of ${playback.length}`;
		const current = table.querySelector("tr[aria-current='true']");
		if (current instanceof HTMLElement) {
			current.scrollIntoView({ block: "nearest" });
		}
	}
	function syncTimer(): void {
		clearTimer();
		if (!playback.playing) {
			return;
		}
		const speed = playback.speed;
		timer = setInterval(() => {
			playback = tick(playback);
			paint();
			if (!playback.playing) {
				clearTimer();
			}
		}, frameMs(speed));
	}
	function apply(next: Playback): void {
		playback = next;
		syncTimer();
		paint();
	}
	function applySpeed(value: string): void {
		const speed = parseSpeed(value);
		if (speed === undefined) {
			return;
		}
		apply(replaceSpeed(playback, speed));
	}

	player.append(back, play, forward, reset, status, speedControl(applySpeed));
	back.addEventListener("click", () => {
		apply(stepBack(playback));
	});
	forward.addEventListener("click", () => {
		apply(stepForward(playback));
	});
	reset.addEventListener("click", () => {
		draggedWindow = null;
		apply(resetPlayback(playback));
	});
	play.addEventListener("click", () => {
		apply(togglePlay(playback));
	});
	paint();

	const controls = el("div", "flex flex-wrap items-center gap-4");
	controls.append(
		sampleControl(loaded.sample.id, (id) => {
			tableData = findSample(id).sample.table;
			selection = { day: null, state: null, cardId: null };
			draggedWindow = null;
			apply(replaceLength(playback, tableData.rows.length));
			onResize();
		}),
		checkControl("Hide done", (hidden) => {
			hideDone = hidden;
			paint();
			onResize();
		}),
		checkControl("Little's law", (on) => {
			showLaw = on;
			if (!on) {
				draggedWindow = null;
			}
			paint();
			onResize();
		}),
		player,
	);

	const copyright = el("p", "m-0 text-xs text-muted");
	copyright.textContent = config.copyright;
	const footer = el(
		"footer",
		"flex flex-wrap items-center justify-between gap-4 border-t px-4 py-3",
	);
	footer.append(controls, copyright);

	root.append(header, main, footer);
	return clearTimer;
}
