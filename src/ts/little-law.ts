import type { FlowTable } from "./parse-csv";

export type LawWindow = {
	start: number;
	end: number;
};

export type LawFigures = {
	meanWip: number;
	/** Items finished in the window, divided by the number of days. */
	throughput: number;
	/** Mean WIP ÷ throughput. Null when the window finished nothing. */
	cycleTime: number | null;
	wipEnd: number;
	doneEnd: number;
	/** First day in the window whose arrivals reached doneEnd. Null when nothing is done. */
	cycleStartDay: number | null;
};

function countsAt(table: FlowTable, day: number): number[] {
	return table.rows[day - 1]?.counts ?? [];
}

function arrival(counts: number[]): number {
	let sum = 0;
	for (const count of counts) {
		sum += count;
	}
	return sum;
}

function departure(counts: number[]): number {
	return counts[counts.length - 1] ?? 0;
}

/** Day 1 through the playhead, unless a drag has chosen a span. The span is clamped to the playhead. */
export function lawWindow(playhead: number, dragged: LawWindow | null): LawWindow | null {
	if (playhead < 1) {
		return null;
	}
	if (dragged === null) {
		return { start: 1, end: playhead };
	}
	const start = Math.min(dragged.start, dragged.end);
	const end = Math.max(dragged.start, dragged.end);
	const clampedEnd = Math.min(Math.max(end, 1), playhead);
	const clampedStart = Math.min(Math.max(start, 1), clampedEnd);
	return { start: clampedStart, end: clampedEnd };
}

export function littleLaw(table: FlowTable, window: LawWindow): LawFigures {
	let wipSum = 0;
	let days = 0;
	for (let day = window.start; day <= window.end; day += 1) {
		const counts = countsAt(table, day);
		wipSum += arrival(counts) - departure(counts);
		days += 1;
	}
	const meanWip = days === 0 ? 0 : wipSum / days;
	const doneEnd = departure(countsAt(table, window.end));
	const doneBefore = window.start <= 1 ? 0 : departure(countsAt(table, window.start - 1));
	const completed = Math.max(0, doneEnd - doneBefore);
	const throughput = days === 0 ? 0 : completed / days;
	const cycleTime = throughput > 0 ? meanWip / throughput : null;
	let cycleStartDay: number | null = null;
	if (doneEnd > 0) {
		for (let day = window.start; day <= window.end; day += 1) {
			if (arrival(countsAt(table, day)) >= doneEnd) {
				cycleStartDay = day;
				break;
			}
		}
	}
	return {
		meanWip,
		throughput,
		cycleTime,
		wipEnd: arrival(countsAt(table, window.end)) - doneEnd,
		doneEnd,
		cycleStartDay,
	};
}

function trim(value: number): string {
	return String(Math.round(value * 100) / 100);
}

export function formatLaw(figures: LawFigures): string {
	const cycle = figures.cycleTime === null ? "—" : trim(figures.cycleTime);
	return `Mean WIP ${trim(figures.meanWip)} · Throughput ${trim(figures.throughput)}/day · Cycle time ${cycle} days`;
}
