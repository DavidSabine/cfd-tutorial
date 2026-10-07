import { parseFlowCsv, type FlowTable } from "./parse-csv";

export type LoadedSample = {
	id: string;
	label: string;
	table: FlowTable;
};

const RAW_SAMPLES = [
	{
		id: "balanced-flow",
		label: "Balanced flow",
		csv: `day,Backlog,Doing,Review,Done
1,2,0,0,0
2,2,1,0,0
3,2,1,1,0
4,2,1,1,1
5,2,2,1,2
6,2,1,2,3
7,2,2,1,4
8,2,1,2,5
9,2,2,1,6
10,2,1,2,7
11,2,2,1,8
12,2,1,2,9
13,2,2,1,10
14,2,1,2,11
15,2,2,1,12
16,2,1,2,13`,
	},
	{
		id: "growing-wip",
		label: "Growing WIP",
		csv: `day,Backlog,Doing,Review,Done
1,3,0,0,0
2,4,1,0,0
3,5,2,1,0
4,6,2,1,1
5,7,3,2,1
6,8,3,2,2
7,9,4,2,2
8,10,4,3,3
9,11,5,3,3
10,12,5,4,4
11,13,6,4,4
12,14,6,5,5
13,16,7,5,5
14,18,8,6,6`,
	},
	{
		id: "recovery",
		label: "Recovery",
		csv: `day,Backlog,Doing,Review,Done
1,2,1,0,0
2,3,2,1,0
3,4,2,2,0
4,5,3,2,1
5,6,3,3,2
6,6,4,3,3
7,5,4,3,5
8,4,3,3,7
9,3,3,2,9
10,2,2,2,11
11,2,2,1,13
12,1,2,1,15
13,1,1,1,16
14,1,1,1,17`,
	},
	{
		id: "arrival-spike",
		label: "Arrival spike",
		csv: `day,Backlog,Doing,Review,Done
1,2,1,0,0
2,2,1,1,0
3,2,1,1,1
4,2,2,1,2
5,2,1,2,3
6,8,2,2,3
7,6,3,2,4
8,4,3,3,5
9,3,2,3,7
10,2,2,2,9
11,2,1,2,10
12,2,2,1,11
13,2,1,2,12
14,2,1,1,13`,
	},
] as const;

export const SAMPLES: LoadedSample[] = RAW_SAMPLES.map((sample) => ({
	id: sample.id,
	label: sample.label,
	table: parseFlowCsv(sample.csv),
}));

export function findSample(id: string): { sample: LoadedSample; usedFallback: boolean } {
	const found = SAMPLES.find((sample) => sample.id === id);
	const fallback = SAMPLES[0];
	if (found) {
		return { sample: found, usedFallback: false };
	}
	if (fallback === undefined) {
		throw new Error("CFD has no embedded samples.");
	}
	return { sample: fallback, usedFallback: true };
}
