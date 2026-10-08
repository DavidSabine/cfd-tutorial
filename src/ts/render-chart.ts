import { bandsFor, chartMax } from "./chart";
import type { LawFigures, LawWindow } from "./little-law";
import type { FlowTable } from "./parse-csv";

const SVG_NS = "http://www.w3.org/2000/svg";
/** ViewBox percent. Shared inset so a later overlay can use the same plot box. */
const LEFT = 8;
const TOP = 6;
const RIGHT = 98;
const BOTTOM = 92;

export type ChartPick = {
	day: number;
	state: number;
};

export type ChartLaw = {
	figures: LawFigures;
	window: LawWindow;
};

type DragApi = {
	svg: SVGSVGElement;
	overlay: boolean;
	playhead: number;
	length: number;
	onWindow: ((window: LawWindow, committed: boolean) => void) | null;
};

const dragApis = new WeakMap<HTMLElement, DragApi>();
const dragBound = new WeakSet<HTMLElement>();

function svgEl<T extends keyof SVGElementTagNameMap>(tag: T): SVGElementTagNameMap[T] {
	return document.createElementNS(SVG_NS, tag);
}

function token(root: HTMLElement, name: string): string {
	const value = getComputedStyle(root).getPropertyValue(name).trim();
	return value.length > 0 ? value : `var(${name})`;
}

function num(value: number): string {
	return value.toFixed(2);
}

function yOf(value: number, max: number): number {
	if (max <= 0) {
		return BOTTOM;
	}
	return BOTTOM - (value / max) * (BOTTOM - TOP);
}

export function renderChart(
	host: HTMLElement,
	colorRoot: HTMLElement,
	table: FlowTable,
	playhead: number,
	hideDone: boolean,
	selection: { day: number | null; state: number | null },
	law: ChartLaw | null,
	onSelect: (pick: ChartPick) => void,
	onWindow: ((window: LawWindow, committed: boolean) => void) | null,
): void {
	const svg = svgEl("svg");
	svg.setAttribute("class", "plot");
	svg.setAttribute("viewBox", "0 0 100 100");
	svg.setAttribute("preserveAspectRatio", "none");
	svg.setAttribute("role", "group");
	svg.setAttribute("aria-label", "Flow bands");
	const title = svgEl("title");
	title.textContent = "Cumulative flow diagram";
	svg.append(title);

	const max = chartMax(table, hideDone);
	const length = Math.max(table.rows.length, 1);
	const slot = (RIGHT - LEFT) / length;
	const primary = token(colorRoot, "--color-primary");
	const ink = token(colorRoot, "--color-foreground");
	if (law !== null) {
		const wash = svgEl("rect");
		wash.setAttribute("data-law", "window");
		wash.setAttribute("x", num(LEFT + (law.window.start - 1) * slot));
		wash.setAttribute("y", num(TOP));
		wash.setAttribute("width", num((law.window.end - law.window.start + 1) * slot));
		wash.setAttribute("height", num(BOTTOM - TOP));
		wash.setAttribute("fill", `color-mix(in srgb, ${ink} 8%, transparent)`);
		wash.setAttribute("pointer-events", "none");
		svg.append(wash);
	}

	for (const band of bandsFor(table, playhead, hideDone)) {
		const stateName = table.states[band.state] ?? "State";
		const fill = token(colorRoot, `--color-chart-${(band.state % 4) + 1}`);
		for (const slice of band.days) {
			if (slice.y1 === slice.y0) {
				continue;
			}
			const y = yOf(slice.y1, max);
			const height = yOf(slice.y0, max) - y;
			const rect = svgEl("rect");
			rect.setAttribute("class", "band");
			rect.setAttribute("x", num(LEFT + (slice.day - 1) * slot));
			rect.setAttribute("y", num(y));
			rect.setAttribute("width", num(slot));
			rect.setAttribute("height", num(height));
			const selected = selection.state === band.state && selection.day === slice.day;
			rect.setAttribute("fill", selected ? `color-mix(in srgb, ${fill} 68%, black)` : fill);
			rect.dataset.day = String(slice.day);
			rect.dataset.state = String(band.state);
			rect.setAttribute("role", "button");
			rect.setAttribute("tabindex", "0");
			rect.setAttribute("aria-label", `${stateName} day ${slice.day}`);
			const pick = (): void => {
				onSelect({ day: slice.day, state: band.state });
			};
			rect.addEventListener("click", pick);
			rect.addEventListener("keydown", (event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					pick();
				}
			});
			svg.append(rect);
		}
	}

	if (playhead >= 1) {
		const x = LEFT + (playhead - 0.5) * slot;
		const line = svgEl("line");
		line.setAttribute("x1", num(x));
		line.setAttribute("x2", num(x));
		line.setAttribute("y1", num(TOP));
		line.setAttribute("y2", num(BOTTOM));
		line.setAttribute("stroke", primary);
		line.setAttribute("stroke-width", "1");
		line.setAttribute("vector-effect", "non-scaling-stroke");
		line.setAttribute("pointer-events", "none");
		svg.append(line);
	}
	if (law !== null) {
		drawLaw(svg, law, hideDone, max, slot, ink);
	}

	host.replaceChildren(svg);
	dragApis.set(host, {
		svg,
		overlay: law !== null,
		playhead,
		length: table.rows.length,
		onWindow,
	});
	bindDrag(host);
}

function dayAt(api: DragApi, clientX: number): number {
	const bounds = api.svg.getBoundingClientRect();
	const slot = (RIGHT - LEFT) / Math.max(api.length, 1);
	if (bounds.width <= 0) {
		return 1;
	}
	const viewX = ((clientX - bounds.left) / bounds.width) * 100;
	const day = Math.floor((viewX - LEFT) / slot) + 1;
	return Math.min(api.playhead, Math.max(1, day));
}

function bindDrag(host: HTMLElement): void {
	if (dragBound.has(host)) {
		return;
	}
	dragBound.add(host);
	let suppressClick = false;
	host.addEventListener(
		"click",
		(event) => {
			if (!suppressClick) {
				return;
			}
			suppressClick = false;
			event.preventDefault();
			event.stopPropagation();
		},
		true,
	);
	host.addEventListener("pointerdown", (event) => {
		const api = dragApis.get(host);
		if (!api?.overlay || api.onWindow === null || api.playhead < 1 || event.button !== 0) {
			return;
		}
		const pointerId = event.pointerId;
		const startX = event.clientX;
		const origin = dayAt(api, event.clientX);
		let moved = false;
		const move = (ev: PointerEvent): void => {
			const live = dragApis.get(host);
			if (live === undefined || live.onWindow === null) {
				return;
			}
			if (!moved && Math.abs(ev.clientX - startX) < 4) {
				return;
			}
			if (!moved) {
				moved = true;
				host.setPointerCapture(pointerId);
			}
			const day = dayAt(live, ev.clientX);
			live.onWindow({ start: Math.min(origin, day), end: Math.max(origin, day) }, false);
		};
		const up = (ev: PointerEvent): void => {
			host.removeEventListener("pointermove", move);
			host.removeEventListener("pointerup", up);
			const live = dragApis.get(host);
			if (!moved || live === undefined || live.onWindow === null) {
				return;
			}
			suppressClick = true;
			const day = dayAt(live, ev.clientX);
			live.onWindow({ start: Math.min(origin, day), end: Math.max(origin, day) }, true);
		};
		host.addEventListener("pointermove", move);
		host.addEventListener("pointerup", up);
	});
}

function lawLine(
	svg: SVGSVGElement,
	name: string,
	label: string,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	color: string,
	dashed: boolean,
): void {
	const line = svgEl("line");
	line.setAttribute("data-law", name);
	line.setAttribute("x1", num(x1));
	line.setAttribute("y1", num(y1));
	line.setAttribute("x2", num(x2));
	line.setAttribute("y2", num(y2));
	line.setAttribute("stroke", color);
	line.setAttribute("stroke-width", "1.5");
	if (dashed) {
		line.setAttribute("stroke-dasharray", "4 3");
	}
	line.setAttribute("vector-effect", "non-scaling-stroke");
	line.setAttribute("pointer-events", "none");
	const title = svgEl("title");
	title.textContent = label;
	line.append(title);
	svg.append(line);
}

function drawLaw(
	svg: SVGSVGElement,
	law: ChartLaw,
	hideDone: boolean,
	max: number,
	slot: number,
	color: string,
): void {
	const { figures, window } = law;
	const xNow = LEFT + (window.end - 0.5) * slot;
	const doneLevel = hideDone ? 0 : figures.doneEnd;
	const topLevel = hideDone ? figures.wipEnd : figures.doneEnd + figures.wipEnd;
	if (topLevel === doneLevel) {
		return;
	}
	const yTop = yOf(topLevel, max);
	const yBottom = yOf(doneLevel, max);
	lawLine(svg, "wip", "WIP", xNow, yTop, xNow, yBottom, color, true);
	if (figures.cycleTime === null || figures.cycleTime <= 0) {
		return;
	}
	const xFuture = xNow + figures.cycleTime * slot;
	lawLine(svg, "cycle", "Cycle time", xNow, yTop, xFuture, yTop, color, true);
	lawLine(svg, "throughput", "Throughput", xNow, yBottom, xFuture, yTop, color, false);
}
