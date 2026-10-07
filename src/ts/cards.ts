import { reachedTotals, type FlowTable } from "./parse-csv";

export type Card = {
	id: number;
	state: number;
};

/** Card 1 is the oldest. It sits in the rightmost state whose reached total includes it. */
export function cardsAtDay(table: FlowTable, day: number): Card[] {
	const row = table.rows[day - 1];
	if (day <= 0 || row === undefined) {
		return [];
	}
	const reached = reachedTotals(row.counts);
	const arrived = reached[0] ?? 0;
	const cards: Card[] = [];
	for (let id = 1; id <= arrived; id += 1) {
		let state = 0;
		for (let index = 0; index < reached.length; index += 1) {
			if ((reached[index] ?? 0) >= id) {
				state = index;
			}
		}
		cards.push({ id, state });
	}
	return cards;
}
