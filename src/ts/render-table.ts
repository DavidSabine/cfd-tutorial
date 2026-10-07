import type { FlowTable } from "./parse-csv";

function el<T extends keyof HTMLElementTagNameMap>(
	tag: T,
	className: string,
): HTMLElementTagNameMap[T] {
	const node = document.createElement(tag);
	node.className = `box-border ${className}`;
	return node;
}

export type TablePick = {
	day: number;
	state: number | null;
};

function bindCell(cell: HTMLTableCellElement, onSelect: () => void): void {
	cell.tabIndex = 0;
	cell.classList.add("hit");
	cell.addEventListener("click", (event) => {
		event.stopPropagation();
		onSelect();
	});
	cell.addEventListener("keydown", (event) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onSelect();
		}
	});
}

export function renderTable(
	host: HTMLElement,
	table: FlowTable,
	activeDay: number,
	selection: { day: number | null; state: number | null },
	onSelect: (pick: TablePick) => void,
): void {
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
	for (const [index, row] of table.rows.entries()) {
		const current = activeDay === index + 1;
		const tr = el("tr", current ? "row-current" : "");
		if (current) {
			tr.setAttribute("aria-current", "true");
		}
		const dayCell = el("td", "cell text-left");
		dayCell.textContent = row.day;
		const dayNumber = index + 1;
		bindCell(dayCell, () => {
			onSelect({ day: dayNumber, state: null });
		});
		tr.append(dayCell);
		row.counts.forEach((count, state) => {
			const selected = selection.day === dayNumber && selection.state === state;
			const cell = el("td", selected ? "cell cell-selected" : "cell");
			cell.textContent = String(count);
			bindCell(cell, () => {
				onSelect({ day: dayNumber, state });
			});
			tr.append(cell);
		});
		body.append(tr);
	}
	grid.append(head, body);
	host.replaceChildren(grid);
}
