import { expect, test } from "vitest";
import { cardsAtDay } from "./cards";
import type { FlowTable } from "./parse-csv";
import { SAMPLES } from "./samples";

const table: FlowTable = {
	states: ["Backlog", "Doing", "Done"],
	rows: [
		{ day: "1", counts: [2, 0, 0] },
		{ day: "2", counts: [1, 1, 1] },
	],
};

test("day 0 has no cards", () => {
	expect(cardsAtDay(table, 0)).toEqual([]);
});

test("places the oldest card in the furthest state", () => {
	expect(cardsAtDay(table, 1)).toEqual([
		{ id: 1, state: 0 },
		{ id: 2, state: 0 },
	]);
	expect(cardsAtDay(table, 2)).toEqual([
		{ id: 1, state: 2 },
		{ id: 2, state: 1 },
		{ id: 3, state: 0 },
	]);
});

test("balanced flow on day 4 matches the column counts", () => {
	const balanced = SAMPLES.find((sample) => sample.id === "balanced-flow");
	expect(balanced).toBeDefined();
	expect(cardsAtDay(balanced?.table ?? table, 4).map((card) => card.state)).toEqual([
		3, 2, 1, 0, 0,
	]);
});
