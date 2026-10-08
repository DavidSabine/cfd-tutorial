import { cardsAtDay } from "./cards";
import type { FlowTable } from "./parse-csv";

export type BoardSelection = {
	state: number | null;
	cardId: number | null;
};

function el<T extends keyof HTMLElementTagNameMap>(
	tag: T,
	className: string,
): HTMLElementTagNameMap[T] {
	const node = document.createElement(tag);
	node.className = className === "" ? "box-border" : `box-border ${className}`;
	return node;
}

function toneNumber(state: number): number {
	return (state % 4) + 1;
}

export function renderBoard(
	host: HTMLElement,
	table: FlowTable,
	day: number,
	selection: BoardSelection,
	onSelect: (selection: BoardSelection) => void,
): void {
	const previous = new Map<number, DOMRect>();
	for (const node of host.querySelectorAll<HTMLElement>("[data-card]")) {
		const id = Number(node.dataset.card);
		if (Number.isInteger(id)) {
			previous.set(id, node.getBoundingClientRect());
		}
	}

	const cards = cardsAtDay(table, day);
	const row = el("div", "flex h-full gap-2 p-2");
	table.states.forEach((state, index) => {
		const tone = toneNumber(index);
		const column = el("div", `column lane-${tone} flex flex-col grow-1 gap-2 min-w-0 p-2`);
		column.setAttribute("role", "group");
		column.setAttribute("aria-label", state);
		if (selection.state === index) {
			column.classList.add("is-selected");
		}
		const title = el("h2", "m-0 text-xs text-muted");
		title.textContent = state;
		const stack = el("div", "flex flex-col gap-2");
		for (const card of cards) {
			if (card.state !== index) {
				continue;
			}
			const button = el("button", `card tone-${tone}`);
			button.type = "button";
			button.dataset.card = String(card.id);
			button.textContent = `Card ${card.id}`;
			button.setAttribute("aria-label", `Card ${card.id}`);
			if (selection.cardId === card.id) {
				button.classList.add("is-selected");
			}
			button.addEventListener("click", (event) => {
				event.stopPropagation();
				onSelect({ state: index, cardId: card.id });
			});
			stack.append(button);
		}
		column.addEventListener("click", () => {
			onSelect({ state: index, cardId: null });
		});
		column.append(title, stack);
		row.append(column);
	});
	host.replaceChildren(row);

	const moves: HTMLElement[] = [];
	for (const node of host.querySelectorAll<HTMLElement>("[data-card]")) {
		const id = Number(node.dataset.card);
		const before = previous.get(id);
		if (before === undefined) {
			continue;
		}
		const after = node.getBoundingClientRect();
		const dx = before.left - after.left;
		const dy = before.top - after.top;
		if (dx === 0 && dy === 0) {
			continue;
		}
		node.style.transform = `translate(${dx}px, ${dy}px)`;
		moves.push(node);
	}
	if (moves.length === 0) {
		return;
	}
	host.getBoundingClientRect();
	for (const node of moves) {
		node.classList.add("card-move");
		node.style.transform = "";
		node.addEventListener(
			"transitionend",
			() => {
				node.classList.remove("card-move");
			},
			{ once: true },
		);
	}
}
