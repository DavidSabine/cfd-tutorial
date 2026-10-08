import { bandsFor, chartMax } from "./chart";
import { littlesLawLines, type LittlesLawLines, type LittlesLawSelection } from "./littles-law";
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
	littlesLawSelection: LittlesLawSelection | null,
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

	if (littlesLawSelection !== null) {
		drawLittlesLaw(
			svg,
			littlesLawLines(table, playhead, hideDone, littlesLawSelection),
			max,
			slot,
			token(colorRoot, "--color-foreground"),
		);
	}

	host.replaceChildren(svg);
}

function drawLittlesLaw(
	svg: SVGSVGElement,
	lines: LittlesLawLines,
	max: number,
	slot: number,
	color: string,
): void {
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
		);
	}
	const wip = lines.wip;
	if (wip !== null) {
		const x = xOf(wip.day, slot);
		lawLine(svg, "wip", x, yOf(wip.top, max), x, yOf(wip.bottom, max), color, false);
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
		);
	}
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
): void {
	const line = svgEl("line");
	line.setAttribute("data-littles", name);
	line.setAttribute("x1", num(x1));
	line.setAttribute("y1", num(y1));
	line.setAttribute("x2", num(x2));
	line.setAttribute("y2", num(y2));
	line.setAttribute("stroke", color);
	line.setAttribute("stroke-width", "1");
	line.setAttribute("vector-effect", "non-scaling-stroke");
	line.setAttribute("pointer-events", "none");
	if (openEnded) {
		line.setAttribute("data-open", "true");
		line.setAttribute("stroke-dasharray", "4 3");
	}
	svg.append(line);
}
