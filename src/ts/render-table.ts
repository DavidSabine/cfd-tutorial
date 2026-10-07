import type { FlowTable } from "./parse-csv";

function el<T extends keyof HTMLElementTagNameMap>(
	tag: T,
	className: string,
): HTMLElementTagNameMap[T] {
	const node = document.createElement(tag);
	node.className = `box-border ${className}`;
	return node;
}

export function renderTable(host: HTMLElement, table: FlowTable): void {
	const grid = el("table", "w-full grid-table");
	const head = el("thead", "");
	const headRow = el("tr", "");
	const dayHead = el("th", "cell text-left sticky-top nowrap");
	dayHead.textContent = "Day";
	headRow.append(dayHead);
	for (const state of table.states) {
		const cell = el("th", "cell sticky-top nowrap");
		cell.textContent = state;
		headRow.append(cell);
	}
	head.append(headRow);

	const body = el("tbody", "");
	for (const row of table.rows) {
		const tr = el("tr", "");
		const day = el("td", "cell text-left");
		day.textContent = row.day;
		tr.append(day);
		for (const count of row.counts) {
			const cell = el("td", "cell");
			cell.textContent = String(count);
			tr.append(cell);
		}
		body.append(tr);
	}
	grid.append(head, body);
	host.replaceChildren(grid);
}
