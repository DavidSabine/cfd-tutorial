import { expect, test } from "vitest";
import { formatLaw, lawWindow, littleLaw } from "./little-law";
import type { FlowTable } from "./parse-csv";
import { SAMPLES } from "./samples";

const table: FlowTable = {
	states: ["Backlog", "Doing", "Done"],
	rows: [
		{ day: "1", counts: [2, 0, 0] },
		{ day: "2", counts: [2, 1, 0] },
		{ day: "3", counts: [2, 1, 1] },
		{ day: "4", counts: [1, 1, 2] },
	],
};

test("uses day 1 through the playhead until a drag", () => {
	expect(lawWindow(0, null)).toBeNull();
	expect(lawWindow(4, null)).toEqual({ start: 1, end: 4 });
	expect(lawWindow(5, { start: 8, end: 3 })).toEqual({ start: 3, end: 5 });
	expect(lawWindow(5, { start: 8, end: 10 })).toEqual({ start: 5, end: 5 });
});

test("computes mean WIP, throughput, and the horizontal start day", () => {
	const figures = littleLaw(table, { start: 1, end: 4 });
	expect(figures.meanWip).toBe(2.5);
	expect(figures.throughput).toBe(0.5);
	expect(figures.cycleTime).toBe(5);
	expect(figures.wipEnd).toBe(2);
	expect(figures.doneEnd).toBe(2);
	expect(figures.cycleStartDay).toBe(1);
	expect(formatLaw(figures)).toBe(
		"Mean WIP 2.5 · Throughput 0.5/day · Cycle time 5 days",
	);
});

test("a later window subtracts the Done count from the day before it", () => {
	const figures = littleLaw(table, { start: 3, end: 4 });
	expect(figures.meanWip).toBe(2.5);
	expect(figures.throughput).toBe(1);
	expect(figures.cycleTime).toBe(2.5);
	expect(figures.cycleStartDay).toBe(3);
});

test("cycle time is blank when the window finished nothing", () => {
	const figures = littleLaw(table, { start: 1, end: 2 });
	expect(figures.throughput).toBe(0);
	expect(figures.cycleTime).toBeNull();
	expect(figures.cycleStartDay).toBeNull();
	expect(formatLaw(figures)).toContain("Cycle time — days");
});

test("balanced flow through day 4 matches the cumulative arrivals", () => {
	const balanced = SAMPLES.find((sample) => sample.id === "balanced-flow");
	expect(balanced).toBeDefined();
	const figures = littleLaw(balanced?.table ?? table, { start: 1, end: 4 });
	expect(figures).toMatchObject({
		meanWip: 3.25,
		throughput: 0.25,
		cycleTime: 13,
		wipEnd: 4,
		doneEnd: 1,
		cycleStartDay: 1,
	});
});
