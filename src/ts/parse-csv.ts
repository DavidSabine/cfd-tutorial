export type FlowRow = {
	day: string;
	counts: number[];
};

export type FlowTable = {
	states: string[];
	rows: FlowRow[];
};

function cells(line: string): string[] {
	return line.split(",").map((cell) => cell.trim());
}

function integerCount(raw: string, rowNumber: number, column: string): number {
	if (!/^\d+$/.test(raw)) {
		throw new Error(`CFD CSV row ${rowNumber} column ${column} is not a whole number.`);
	}
	return Number(raw);
}

export function parseFlowCsv(csv: string): FlowTable {
	const lines = csv
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
	const headerLine = lines[0];
	if (headerLine === undefined || lines.length < 2) {
		throw new Error("CFD CSV needs a header and at least one day.");
	}
	const header = cells(headerLine);
	const dayIndex = header.findIndex((name) => {
		const key = name.toLowerCase();
		return key === "day" || key === "date";
	});
	const stateIndexes = header.map((_, index) => index).filter((index) => index !== dayIndex);
	if (stateIndexes.length === 0) {
		throw new Error("CFD CSV needs a state column.");
	}
	const states = stateIndexes.map((index) => header[index] ?? "");
	const rows = lines.slice(1).map((line, index) => {
		const rowNumber = index + 1;
		const values = cells(line);
		const day = dayIndex >= 0 ? (values[dayIndex] ?? "") : String(rowNumber);
		const counts = stateIndexes.map((column) =>
			integerCount(values[column] ?? "", rowNumber, header[column] ?? "state"),
		);
		return { day, counts };
	});
	return { states, rows };
}

/** Items in this state or any state to its right. Index 0 is arrivals. The last index is Done. */
export function reachedTotals(counts: number[]): number[] {
	const totals = new Array<number>(counts.length);
	let sum = 0;
	for (let index = counts.length - 1; index >= 0; index -= 1) {
		sum += counts[index] ?? 0;
		totals[index] = sum;
	}
	return totals;
}
