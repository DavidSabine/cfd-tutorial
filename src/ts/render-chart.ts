import { bandsFor, chartMax } from "./chart";
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

export function renderChart(
	host: HTMLElement,
	colorRoot: HTMLElement,
	table: FlowTable,
	playhead: number,
	hideDone: boolean,
	selection: { day: number | null; state: number | null },
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
	const primary = token(colorRoot, "--color-primary");

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

	host.replaceChildren(svg);
}
