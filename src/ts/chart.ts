import type { FlowTable } from "./parse-csv";

export type BandDay = {
	day: number;
	y0: number;
	y1: number;
};

export type Band = {
	state: number;
	days: BandDay[];
};

function visibleStates(table: FlowTable, hideDone: boolean): number {
	if (!hideDone) {
		return table.states.length;
	}
	return Math.max(0, table.states.length - 1);
}

/** Tallest visible stack in the whole sample, so the scale stays put as the playhead moves. */
export function chartMax(table: FlowTable, hideDone: boolean): number {
	const visible = visibleStates(table, hideDone);
	let max = 0;
	for (const row of table.rows) {
		let sum = 0;
		for (let index = 0; index < visible; index += 1) {
			sum += row.counts[index] ?? 0;
		}
		if (sum > max) {
			max = sum;
		}
	}
	return max;
}

/** Bottom band is the last visible state and sits on the axis. Days after the playhead are omitted. */
export function bandsFor(table: FlowTable, playhead: number, hideDone: boolean): Band[] {
	const visible = visibleStates(table, hideDone);
	const limit = Math.min(table.rows.length, Math.max(0, playhead));
	const bands: Band[] = [];
	for (let state = visible - 1; state >= 0; state -= 1) {
		const days: BandDay[] = [];
		for (let index = 0; index < limit; index += 1) {
			const counts = table.rows[index]?.counts ?? [];
			let bottom = 0;
			for (let lower = state + 1; lower < visible; lower += 1) {
				bottom += counts[lower] ?? 0;
			}
			days.push({ day: index + 1, y0: bottom, y1: bottom + (counts[state] ?? 0) });
		}
		bands.push({ state, days });
	}
	return bands;
}
