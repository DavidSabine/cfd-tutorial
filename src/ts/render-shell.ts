import type { CfdConfig } from "./resolve-config";
import { renderTable } from "./render-table";
import { findSample, SAMPLES } from "./samples";

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
	node.disabled = true;
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

function speedControl(): HTMLLabelElement {
	const label = el("label", "flex items-center gap-2 m-0 text-xs text-muted");
	label.append("Speed");
	const select = el("select", "btn");
	select.disabled = true;
	for (const [value, text] of SPEEDS) {
		const option = document.createElement("option");
		option.value = value;
		option.textContent = text;
		option.selected = value === "1";
		select.append(option);
	}
	label.append(select);
	return label;
}

export function renderShell(root: HTMLElement, config: CfdConfig, onResize: () => void): void {
	const header = el(
		"header",
		"flex items-center justify-between gap-4 border-b px-4 py-3",
	);
	const title = el("h1", "m-0 text-lg");
	title.textContent = config.title;
	const brand = el("div", "text-sm");
	brand.innerHTML = config.brand;
	header.append(title, brand);

	const chart = el("section", "chart flex-1 min-h-chart rounded-md border border-border");
	chart.setAttribute("aria-label", "Cumulative flow diagram");
	const board = el("section", "board flex-1 min-h-board rounded-md border border-border");
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
	renderTable(table, loaded.sample.table);
	const main = el("div", "flex flex-1 gap-4 p-4");
	main.append(stack, table);

	const player = el("div", "flex flex-wrap items-center gap-2");
	player.setAttribute("role", "group");
	player.setAttribute("aria-label", "Playback");
	player.append(
		button("Back"),
		button("Play", "btn-primary"),
		button("Forward"),
		button("Reset"),
		speedControl(),
	);
	const controls = el("div", "flex flex-wrap items-center gap-4");
	controls.append(
		sampleControl(loaded.sample.id, (id) => {
			renderTable(table, findSample(id).sample.table);
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
}
