import { expect, test } from "vitest";
import { parseFlowCsv, reachedTotals } from "./parse-csv";
import { SAMPLES, findSample } from "./samples";

test("parses a day column and integer state counts", () => {
	const table = parseFlowCsv("day,Backlog,Done\n1,2,0\n2,1,1\n");
	expect(table.states).toEqual(["Backlog", "Done"]);
	expect(table.rows).toEqual([
		{ day: "1", counts: [2, 0] },
		{ day: "2", counts: [1, 1] },
	]);
});

test("numbers rows when the day column is absent", () => {
	const table = parseFlowCsv("Backlog,Done\n4,1\n");
	expect(table.rows[0]).toEqual({ day: "1", counts: [4, 1] });
});

test("rejects a cell that is not a whole number", () => {
	expect(() => parseFlowCsv("day,Backlog\n1,x\n")).toThrow(/whole number/);
});

test("keeps each sample's cumulative flow from moving backwards", () => {
	for (const sample of SAMPLES) {
		let previous: number[] | undefined;
		for (const row of sample.table.rows) {
			const reached = reachedTotals(row.counts);
			if (previous) {
				for (let index = 0; index < reached.length; index += 1) {
					expect(reached[index], `${sample.id} day ${row.day}`).toBeGreaterThanOrEqual(
						previous[index] ?? 0,
					);
				}
			}
			previous = reached;
		}
	}
});

test("falls back when the sample id is unknown", () => {
	expect(findSample("balanced-flow").usedFallback).toBe(false);
	const missing = findSample("missing");
	expect(missing.usedFallback).toBe(true);
	expect(missing.sample.id).toBe("balanced-flow");
});
