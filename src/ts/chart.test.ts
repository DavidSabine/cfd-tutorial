import { expect, test } from "vitest";
import { bandsFor, chartMax } from "./chart";
import type { FlowTable } from "./parse-csv";

const table: FlowTable = {
	states: ["Backlog", "Doing", "Done"],
	rows: [
		{ day: "1", counts: [2, 0, 1] },
		{ day: "2", counts: [1, 1, 2] },
	],
};

test("stacks Done on the axis and Backlog on top", () => {
	const bands = bandsFor(table, 1, false);
	expect(bands.map((band) => band.state)).toEqual([2, 1, 0]);
	expect(bands.find((band) => band.state === 2)?.days).toEqual([{ day: 1, y0: 0, y1: 1 }]);
	expect(bands.find((band) => band.state === 1)?.days).toEqual([{ day: 1, y0: 1, y1: 1 }]);
	expect(bands.find((band) => band.state === 0)?.days).toEqual([{ day: 1, y0: 1, y1: 3 }]);
});

test("hide done drops the last state onto the axis", () => {
	const bands = bandsFor(table, 1, true);
	expect(bands.map((band) => band.state)).toEqual([1, 0]);
	expect(bands.find((band) => band.state === 1)?.days).toEqual([{ day: 1, y0: 0, y1: 0 }]);
	expect(bands.find((band) => band.state === 0)?.days).toEqual([{ day: 1, y0: 0, y1: 2 }]);
});

test("draws only through the playhead", () => {
	expect(bandsFor(table, 0, false)[0]?.days).toEqual([]);
	expect(bandsFor(table, 2, false).find((band) => band.state === 2)?.days).toEqual([
		{ day: 1, y0: 0, y1: 1 },
		{ day: 2, y0: 0, y1: 2 },
	]);
});

test("scales to the tallest visible total in the whole sample", () => {
	expect(chartMax(table, false)).toBe(4);
	expect(chartMax(table, true)).toBe(2);
});
