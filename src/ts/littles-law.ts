import type { FlowTable } from "./parse-csv";

export type LittlesLawSelection = {
	startDay: number;
	endDay: number;
};

export type RateLine = {
	startDay: number;
	endDay: number;
	startHeight: number;
	endHeight: number;
	perDay: number;
};

export type WipLine = {
	day: number;
	top: number;
	bottom: number;
	items: number;
};

export type CycleTimeLine = {
	startDay: number;
	height: number;
	throughDay: number;
	days: number | null;
	openEnded: boolean;
};

export type LittlesLawLines = {
	arrivalRate: RateLine | null;
	departureRate: RateLine | null;
	wip: WipLine | null;
	approximateCycleTime: CycleTimeLine | null;
};

/** A drag needs more than two visible days. Visible days are day 1 through the playhead. */
export function littlesLawEnabled(visibleDays: number): boolean {
	return visibleDays > 2;
}

function visibleStates(table: FlowTable, hideDone: boolean): number {
	if (!hideDone) {
		return table.states.length;
	}
	return Math.max(0, table.states.length - 1);
}

function countsAt(table: FlowTable, day: number): number[] | null {
	if (day < 1) {
		return null;
	}
	return table.rows[day - 1]?.counts ?? null;
}

function stackTop(counts: number[], visible: number): number {
	let sum = 0;
	for (let index = 0; index < visible; index += 1) {
		sum += counts[index] ?? 0;
	}
	return sum;
}

/** Done count when that day has a drawn done band. Null when Done is hidden or empty. */
function doneBand(table: FlowTable, counts: number[], hideDone: boolean): number | null {
	if (hideDone || table.states.length === 0) {
		return null;
	}
	const done = counts[table.states.length - 1] ?? 0;
	return done > 0 ? done : null;
}

function rate(startDay: number, endDay: number, startHeight: number, endHeight: number): RateLine {
	return {
		startDay,
		endDay,
		startHeight,
		endHeight,
		perDay: (endHeight - startHeight) / (endDay - startDay),
	};
}

/**
 * Item heights for the four lines. Rate lines are omitted unless both selected
 * days are visible, so a shorter playhead does not change their slope.
 * Hide done returns no lines. The caller keeps the selection and draws it
 * again when Done is shown.
 */
export function littlesLawLines(
	table: FlowTable,
	playhead: number,
	hideDone: boolean,
	littlesLawSelection: LittlesLawSelection,
): LittlesLawLines {
	const startDay = Math.min(littlesLawSelection.startDay, littlesLawSelection.endDay);
	const endDay = Math.max(littlesLawSelection.startDay, littlesLawSelection.endDay);
	const lastVisible = Math.min(table.rows.length, Math.max(0, playhead));
	const visible = visibleStates(table, hideDone);
	const none: LittlesLawLines = {
		arrivalRate: null,
		departureRate: null,
		wip: null,
		approximateCycleTime: null,
	};
	if (hideDone) {
		return none;
	}
	if (startDay < 1 || endDay <= startDay || lastVisible < startDay) {
		return none;
	}
	const startCounts = countsAt(table, startDay);
	if (startCounts === null) {
		return none;
	}
	const top = stackTop(startCounts, visible);
	const startDone = doneBand(table, startCounts, hideDone);
	const wip: WipLine = {
		day: startDay,
		top,
		bottom: startDone ?? 0,
		items: top - (startDone ?? 0),
	};

	let throughDay = lastVisible;
	let cycleDays: number | null = null;
	if (!hideDone) {
		for (let day = startDay + 1; day <= lastVisible; day += 1) {
			const counts = countsAt(table, day);
			const done = counts === null ? null : doneBand(table, counts, false);
			if (done !== null && done >= top) {
				throughDay = day;
				cycleDays = day - startDay;
				break;
			}
		}
	}

	let arrivalRate: RateLine | null = null;
	let departureRate: RateLine | null = null;
	if (lastVisible >= endDay) {
		const endCounts = countsAt(table, endDay);
		if (endCounts !== null) {
			arrivalRate = rate(startDay, endDay, top, stackTop(endCounts, visible));
			const endDone = doneBand(table, endCounts, hideDone);
			if (startDone !== null && endDone !== null) {
				departureRate = rate(startDay, endDay, startDone, endDone);
			}
		}
	}

	return {
		arrivalRate,
		departureRate,
		wip,
		approximateCycleTime: {
			startDay,
			height: top,
			throughDay,
			days: cycleDays,
			openEnded: cycleDays === null,
		},
	};
}
