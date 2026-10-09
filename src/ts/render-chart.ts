import { bandsFor, chartMax } from "./chart";
import {
	LITTLES_LAW_LABELS,
	littlesLawEnabled,
	littlesLawLines,
	type LittlesLawLines,
	type LittlesLawSelection,
} from "./littles-law";
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

export type LittlesLawGesture = {
	selection: LittlesLawSelection | null;
	preview: boolean;
	disposeSignal: AbortSignal;
	onPreview: (selection: LittlesLawSelection) => void;
	onCommit: (selection: LittlesLawSelection) => void;
	onCancel: () => void;
	onClear: () => void;
};

const DRAG_PX = 4;

type DragApi = {
	svg: SVGSVGElement;
	playhead: number;
	length: number;
	enabled: boolean;
	onPreview: (selection: LittlesLawSelection) => void;
	onCommit: (selection: LittlesLawSelection) => void;
	onCancel: () => void;
	onClear: () => void;
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

function xOf(day: number, slot: number): number {
	return LEFT + (day - 0.5) * slot;
}

export function renderChart(
	host: HTMLElement,
	colorRoot: HTMLElement,
	table: FlowTable,
	playhead: number,
	hideDone: boolean,
	selection: { day: number | null; state: number | null },
	littlesLaw: LittlesLawGesture,
	onSelect: (pick: ChartPick) => void,
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

	const labels =
		littlesLaw.selection === null
			? null
			: drawLittlesLaw(
					svg,
					littlesLawLines(table, playhead, hideDone, littlesLaw.selection),
					max,
					slot,
					token(colorRoot, "--color-foreground"),
					littlesLaw.preview,
				);

	const visibleDays = Math.min(table.rows.length, Math.max(0, playhead));
	dragApis.set(host, {
		svg,
		playhead,
		length,
		enabled: littlesLawEnabled(visibleDays),
		onPreview: littlesLaw.onPreview,
		onCommit: littlesLaw.onCommit,
		onCancel: littlesLaw.onCancel,
		onClear: littlesLaw.onClear,
	});
	bindDrag(host, littlesLaw.disposeSignal);
	host.replaceChildren(svg);
	if (labels !== null && labels.childElementCount > 0) {
		host.append(labels);
	}
}

function drawLittlesLaw(
	svg: SVGSVGElement,
	lines: LittlesLawLines,
	max: number,
	slot: number,
	color: string,
	preview: boolean,
): HTMLDivElement {
	const labels = document.createElement("div");
	labels.className = "law-labels";
	const arrival = lines.arrivalRate;
	if (arrival !== null) {
		lawLine(
			svg,
			"arrivalRate",
			xOf(arrival.startDay, slot),
			yOf(arrival.startHeight, max),
			xOf(arrival.endDay, slot),
			yOf(arrival.endHeight, max),
			color,
			false,
			preview,
			null,
		);
		labels.append(
			lawLabel("arrivalRate", xOf(arrival.endDay, slot), yOf(arrival.endHeight, max)),
		);
	}
	const departure = lines.departureRate;
	if (departure !== null) {
		lawLine(
			svg,
			"departureRate",
			xOf(departure.startDay, slot),
			yOf(departure.startHeight, max),
			xOf(departure.endDay, slot),
			yOf(departure.endHeight, max),
			color,
			false,
			preview,
			null,
		);
		labels.append(
			lawLabel(
				"departureRate",
				xOf(departure.endDay, slot),
				yOf(departure.endHeight, max),
			),
		);
	}
	const wip = lines.wip;
	if (wip !== null) {
		const x = xOf(wip.day, slot);
		lawLine(
			svg,
			"wip",
			x,
			yOf(wip.top, max),
			x,
			yOf(wip.bottom, max),
			color,
			false,
			preview,
			wip.day,
		);
		const mid = (yOf(wip.top, max) + yOf(wip.bottom, max)) / 2;
		labels.append(lawLabel("wip", x, mid));
	}
	const cycle = lines.approximateCycleTime;
	if (cycle !== null) {
		const y = yOf(cycle.height, max);
		lawLine(
			svg,
			"approximateCycleTime",
			xOf(cycle.startDay, slot),
			y,
			xOf(cycle.throughDay, slot),
			y,
			color,
			cycle.openEnded,
			preview,
			null,
			cycle.throughDay,
		);
		labels.append(lawLabel("approximateCycleTime", xOf(cycle.throughDay, slot), y));
	}
	return labels;
}

function lawLabel(name: keyof typeof LITTLES_LAW_LABELS, x: number, y: number): HTMLParagraphElement {
	const node = document.createElement("p");
	const end = x > 72;
	const below = y < 18;
	node.className = `law-label${end ? " is-end" : ""}${below ? " is-below" : ""}`;
	node.dataset.littlesLabel = name;
	node.textContent = LITTLES_LAW_LABELS[name];
	node.style.left = `${x}%`;
	node.style.top = `${y}%`;
	return node;
}

function lawLine(
	svg: SVGSVGElement,
	name: string,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	color: string,
	openEnded: boolean,
	preview: boolean,
	day: number | null,
	throughDay: number | null = null,
): void {
	const line = svgEl("line");
	line.setAttribute("data-littles", name);
	if (day !== null) {
		line.setAttribute("data-day", String(day));
	}
	if (throughDay !== null) {
		line.setAttribute("data-through-day", String(throughDay));
	}
	line.setAttribute("x1", num(x1));
	line.setAttribute("y1", num(y1));
	line.setAttribute("x2", num(x2));
	line.setAttribute("y2", num(y2));
	line.setAttribute("stroke", color);
	line.setAttribute("stroke-width", "1");
	line.setAttribute("vector-effect", "non-scaling-stroke");
	line.setAttribute("pointer-events", "none");
	if (preview) {
		line.setAttribute("data-preview", "true");
		line.setAttribute("stroke-opacity", "0.45");
		line.setAttribute("stroke-dasharray", "2 3");
	} else if (openEnded) {
		line.setAttribute("stroke-dasharray", "4 3");
	}
	if (openEnded) {
		line.setAttribute("data-open", "true");
	}
	svg.append(line);
}

function dayAt(api: DragApi, clientX: number): number {
	const bounds = api.svg.getBoundingClientRect();
	const slot = (RIGHT - LEFT) / Math.max(api.length, 1);
	const last = Math.min(api.length, Math.max(0, api.playhead));
	if (bounds.width <= 0 || slot <= 0 || last < 1) {
		return 1;
	}
	const viewX = ((clientX - bounds.left) / bounds.width) * 100;
	const day = Math.floor((viewX - LEFT) / slot) + 1;
	return Math.min(last, Math.max(1, day));
}

function bindDrag(host: HTMLElement, disposeSignal: AbortSignal): void {
	if (dragBound.has(host)) {
		return;
	}
	dragBound.add(host);
	let originX = 0;
	let originY = 0;
	let originDay = 1;
	let pointerId = -1;
	let moved = false;
	let tracking = false;
	let suppressClick = false;

	function selectionBetween(clientX: number): LittlesLawSelection | null {
		const api = dragApis.get(host);
		if (api === undefined) {
			return null;
		}
		const day = dayAt(api, clientX);
		if (day === originDay) {
			return null;
		}
		return { startDay: Math.min(originDay, day), endDay: Math.max(originDay, day) };
	}

	function releaseCapture(): void {
		if (host.hasPointerCapture(pointerId)) {
			host.releasePointerCapture(pointerId);
		}
	}

	function finish(event: PointerEvent): void {
		if (!tracking || event.pointerId !== pointerId) {
			return;
		}
		tracking = false;
		releaseCapture();
		if (!moved) {
			return;
		}
		suppressClick = true;
		setTimeout(() => {
			suppressClick = false;
		}, 0);
		const api = dragApis.get(host);
		if (api === undefined) {
			return;
		}
		const next = selectionBetween(event.clientX);
		if (next === null) {
			api.onCancel();
			return;
		}
		api.onCommit(next);
	}

	host.addEventListener("pointerdown", (event) => {
		if (!event.isPrimary || event.button !== 0) {
			return;
		}
		const api = dragApis.get(host);
		if (api === undefined || !api.enabled) {
			return;
		}
		tracking = true;
		moved = false;
		pointerId = event.pointerId;
		originX = event.clientX;
		originY = event.clientY;
		originDay = dayAt(api, event.clientX);
	});
	document.addEventListener(
		"pointermove",
		(event) => {
			if (!tracking || event.pointerId !== pointerId) {
				return;
			}
			if (event.buttons === 0) {
				finish(event);
				return;
			}
			if (!moved) {
				const distance = Math.hypot(event.clientX - originX, event.clientY - originY);
				if (distance < DRAG_PX) {
					return;
				}
				moved = true;
				// Touch keeps sending events to the pointerdown target. The preview
				// replaces that SVG, so the chart section has to own the rest of the drag.
				try {
					host.setPointerCapture(pointerId);
				} catch {
					// A synthetic event has no active pointer to capture.
				}
			}
			const api = dragApis.get(host);
			if (api === undefined) {
				return;
			}
			const next = selectionBetween(event.clientX);
			if (next === null) {
				api.onCancel();
				return;
			}
			api.onPreview(next);
		},
		{ signal: disposeSignal },
	);
	document.addEventListener("pointerup", finish, { signal: disposeSignal });
	document.addEventListener(
		"pointercancel",
		(event) => {
			if (!tracking || event.pointerId !== pointerId) {
				return;
			}
			tracking = false;
			moved = false;
			releaseCapture();
			dragApis.get(host)?.onCancel();
		},
		{ signal: disposeSignal },
	);
	document.addEventListener(
		"click",
		(event) => {
			if (!suppressClick) {
				return;
			}
			suppressClick = false;
			event.preventDefault();
			event.stopPropagation();
		},
		{ capture: true, signal: disposeSignal },
	);
	host.addEventListener("click", () => {
		dragApis.get(host)?.onClear();
	});
	document.addEventListener(
		"keydown",
		(event) => {
			if (event.key !== "Escape") {
				return;
			}
			if (tracking) {
				tracking = false;
				moved = false;
				releaseCapture();
				suppressClick = true;
				setTimeout(() => {
					suppressClick = false;
				}, 0);
			}
			const api = dragApis.get(host);
			api?.onCancel();
			api?.onClear();
		},
		{ signal: disposeSignal },
	);
}
