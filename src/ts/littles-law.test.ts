import { expect, test } from 'vitest'
import {
	LITTLES_LAW_LABELS,
	type LittlesLawSelection,
	littlesLawEnabled,
	littlesLawLines,
} from './littles-law'
import { findSample } from './samples'

const table = findSample('balanced-flow').sample.table

function selection(startDay: number, endDay: number): LittlesLawSelection {
	return {
		startDay: Math.min(startDay, endDay),
		endDay: Math.max(startDay, endDay),
	}
}

test('names arrival, throughput, WIP, and cycle time', () => {
	expect(LITTLES_LAW_LABELS).toEqual({
		arrivalRate: 'Approx. Avg. Arrival Rate',
		departureRate: 'Approx. Avg. Throughput',
		wip: 'WIP',
		approximateCycleTime: 'Approx. Avg. Cycle Time',
	})
})

test('enables the drag only after two visible days', () => {
	expect(littlesLawEnabled(0)).toBe(false)
	expect(littlesLawEnabled(2)).toBe(false)
	expect(littlesLawEnabled(3)).toBe(true)
})

test('measures balanced flow from day 4 to day 6', () => {
	const lines = littlesLawLines(table, 8, false, selection(4, 6))
	expect(lines.arrivalRate).toEqual({
		startDay: 4,
		endDay: 6,
		startHeight: 5,
		endHeight: 8,
		perDay: 1.5,
	})
	expect(lines.departureRate).toEqual({
		startDay: 4,
		endDay: 6,
		startHeight: 1,
		endHeight: 3,
		perDay: 1,
	})
	expect(lines.wip).toEqual({ day: 4, top: 5, bottom: 1, items: 4 })
	expect(lines.approximateCycleTime).toEqual({
		startDay: 4,
		height: 5,
		throughDay: 8,
		days: 4,
		openEnded: false,
	})
})

test('uses the earlier day when the drag ran leftward', () => {
	const forward = littlesLawLines(table, 8, false, selection(4, 6))
	const backward = littlesLawLines(table, 8, false, selection(6, 4))
	expect(backward).toEqual(forward)
	expect(backward.wip?.day).toBe(4)
})

test('omits departure and drops WIP to the baseline when start has no done band', () => {
	const lines = littlesLawLines(table, 16, false, selection(2, 4))
	expect(lines.arrivalRate).toEqual({
		startDay: 2,
		endDay: 4,
		startHeight: 3,
		endHeight: 5,
		perDay: 1,
	})
	expect(lines.departureRate).toBeNull()
	expect(lines.wip).toEqual({ day: 2, top: 3, bottom: 0, items: 3 })
	expect(lines.approximateCycleTime).toMatchObject({
		throughDay: 6,
		days: 4,
		openEnded: false,
	})
})

test('leaves cycle time open when the playhead ends before Done catches up', () => {
	const lines = littlesLawLines(table, 6, false, selection(4, 6))
	expect(lines.arrivalRate).not.toBeNull()
	expect(lines.departureRate).not.toBeNull()
	expect(lines.approximateCycleTime).toEqual({
		startDay: 4,
		height: 5,
		throughDay: 6,
		days: null,
		openEnded: true,
	})
})

test('hides the rate lines when the later day is not visible', () => {
	const lines = littlesLawLines(table, 5, false, selection(4, 6))
	expect(lines.arrivalRate).toBeNull()
	expect(lines.departureRate).toBeNull()
	expect(lines.wip).toEqual({ day: 4, top: 5, bottom: 1, items: 4 })
	expect(lines.approximateCycleTime).toMatchObject({
		throughDay: 5,
		openEnded: true,
	})
})

test('draws nothing when the start day is not visible', () => {
	expect(littlesLawLines(table, 3, false, selection(4, 6))).toEqual({
		arrivalRate: null,
		departureRate: null,
		wip: null,
		approximateCycleTime: null,
	})
})

test('hides every line while Done is hidden', () => {
	expect(littlesLawLines(table, 8, true, selection(4, 6))).toEqual({
		arrivalRate: null,
		departureRate: null,
		wip: null,
		approximateCycleTime: null,
	})
})
