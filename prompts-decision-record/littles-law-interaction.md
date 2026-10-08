Goal: add a Little's Law interaction.

Concept: show arrival rate, departure rate, WIP, and approximate cycle time directly on the CFD. Use Little's Law terms in code naming (e.g., arrivalRate, departureRate, wip, approximateCycleTime, littlesLawSelection). 

Interaction:
- Possible only when more than two days are visible.
- User presses on one day and drags to another. The day where the drag starts is startDay; the day where it ends is endDay. Dragging leftward should work too (normalize so startDay is the earlier day).
- Show a lightweight preview while dragging; commit on release. Clicking elsewhere or pressing Escape clears the selection.
- Support mouse, touch, and pen (pointer events). Draw four lines (measure at the top edge of each band):
	1. arrivalRate line: from the top of the topmost band (to-do) on startDay to the top of the topmost band on endDay.
	2. departureRate line: from the top of the done band (lowest band) on startDay to the top of the done band on endDay. Draw only if both startDay and endDay have a non-zero done band.
	3. wip line: on startDay only, a vertical line from the top of the topmost band down to the top of the done band (or the baseline if there is no done band yet).
	4. approximateCycleTime line: a horizontal line starting at the top of startDay's topmost band, traveling right across subsequent days until it meets the top of the done band on the first later day where done reaches that height. If it never meets done within the visible range, stop at the last visible day and style it as open-ended (dashed end). Lines must re-render correctly on resize and when the visible date range changes, and must not block existing hover or tooltip behavior.

Give me an incremental plan first, with one-sitting-readable diffs.


## Plan
# Little's Law lines on the chart

Four lines on the cumulative flow diagram, drawn from a drag. No checkbox and no numeric readout. Each increment is one review sitting. I stop after each one so you can run it and read the diff. Nothing is committed unless you ask.

## What the lines mean

The chart reserves a column for every day in the sample. Columns for days after the playhead are empty. The visible days are the ones with bands: day 1 through the playhead. The drag is enabled only when that count is greater than 2.

A drag records the day under the pointer down as the press day and the day under the pointer up as the release day. `littlesLawSelection` stores them normalized, so `startDay` is the earlier day and `endDay` is the later day. A leftward drag works the same way. A drag that stays on one day does not commit.

Heights come from the top edge of the bands you can see, in the same viewBox as the bands (`0 0 100 100`, inset 8,6–98,92). A point for day D sits on the horizontal center of that day's column. The done band is the lowest band. Its top is the Done count. The topmost band's top is the sum of the visible state counts. With Hide done off, that sum is arrivals.

1. `arrivalRate` connects the top of the topmost band on `startDay` to the top of the topmost band on `endDay`. The rate is that rise divided by `endDay - startDay`.
2. `departureRate` connects the top of the done band on `startDay` to the top of the done band on `endDay`, with the same divisor. It is drawn only when both days have a non-zero done band (Done count greater than 0). Otherwise it is absent.
3. `wip` is a vertical line on `startDay` only, from the top of the topmost band down to the top of the done band. If that day has no done band, it ends on the baseline. Its length is the item count.
4. `approximateCycleTime` starts at the top of `startDay`'s topmost band and runs horizontally to the right. It stops on the first later visible day whose Done top has reached that height. The day count is `meetingDay - startDay`. If no visible day qualifies, it stops on the last visible day, `days` is null, and the line is open-ended.

Hide done removes the done band. The departure line is then absent, WIP drops to the baseline, and the cycle-time line is open-ended, because those rules follow the visible edges. The selection itself stays.

Balanced flow, drag from day 4 to day 6, playhead at least 8: arrival tops are 5 and 8, so `arrivalRate` is 1.5 per day. Done tops are 1 and 3, so `departureRate` is 1 per day. WIP on day 4 is 4. Done first reaches 5 on day 8, so `approximateCycleTime` is 4 days.

## Interaction

- Pointer events on the chart host, so mouse, touch, and pen share one path. The plot gets `touch-action: none` so a touch drag is not stolen by scrolling. Board and table still scroll.
- Movement under 4px is a click, not a drag. The band, card, and table glow behave as they do now.
- Past 4px, a preview is drawn: all four lines (or fewer, when departure is absent) use a light dashed stroke. Releasing on a different day commits. Committed lines are solid ink (`--color-foreground`), 1px, with `vector-effect: non-scaling-stroke`.
- An open-ended cycle-time line stays dashed after commit. A preview is lighter than that, so the two dashes are not the same style.
- Every line has `pointer-events: none` and no `<title>`, so it cannot take clicks or hover from the bands. The only tooltip today is the chart's own title plus the band button names.
- The click that ends a drag does not also glow a band. A later plain click on the chart clears `littlesLawSelection` and still glows the band.
- Escape clears the selection. Play, Back, Forward, Reset, Hide done, the board, and the table do not. Changing the sample does.
- A drag does not dispatch `cfd-resize`. The lines do not change the tool's height.

## Playback after the lines are showing

The stored days stay `{startDay, endDay}` while you play. Each paint reads the sample again, so the lines are not cached in pixels. Column positions do not move, because every sample day already has a slot. Forward and Play add bands from left to right. Back and Reset remove bands from the right.

Arrival and departure are drawn only when both selected days are visible. Clipping them to an earlier playhead would show a different slope than the one you dragged. WIP is drawn whenever `startDay` is visible. The cycle-time line is drawn whenever `startDay` is visible: solid, and stopped, on the first later visible day where Done has reached that height; otherwise dashed and ended on the playhead.

Balanced flow, selection days 4 and 6, playhead on day 8. You see the arrival chord from day 4 to day 6, the departure chord under it, the WIP vertical on day 4, and a solid horizontal from day 4 that stops on day 8.

- **Forward or Play, already on day 8 or later.** The four lines stay where they are. New bands appear to their right. Play keeps doing that until the last day, then stops. The lines do not chase the playhead.
- **Forward or Play while the cycle-time line is open.** Same selection, playhead still on day 6: Done has not reached day 4's top, so the horizontal is dashed and ends on day 6. Each Forward lengthens that dashed line by one day. On day 8, Done catches the height, the line turns solid, and it stops on day 8. Further Forward presses leave it there.
- **Back, playhead still on day 6 or later.** Arrival, departure, and WIP stay. If Back moves earlier than day 8, the horizontal becomes dashed again and ends on the playhead. Forward to day 8 makes it solid on that same day again.
- **Back so the playhead is day 4 or day 5.** Day 6 is not drawn, so the arrival and departure chords disappear. WIP stays on day 4. The cycle-time line is dashed and ends on the playhead. Forward to day 6 brings the two chords back on the same days, at the same slope.
- **Back before day 4, including Reset to day 0.** No lines. The selection is still stored. A new drag does nothing until more than two days are visible. Forward to day 4 shows WIP and a dashed cycle-time line. Forward to day 6 shows the chords again. Forward to day 8 closes the cycle-time line.

## Increments

### 1. Geometry, no drawing

Add `src/ts/littles-law.ts` and `src/ts/littles-law.test.ts`.

Exports use the names above: `littlesLawEnabled(visibleDays)`, `littlesLawSelection` as a type `{ startDay, endDay }`, and one function that returns `arrivalRate`, `departureRate` (or null), `wip`, and `approximateCycleTime` in data units (day and item height), not pixels.

Tests cover the balanced-flow day 4–6 case, a leftward pair normalized before the call, a start day with Done 0 (no departure line, WIP to the baseline), an open-ended cycle time when the playhead ends too soon, and Hide done. No other file changes. After this sitting the chart looks the same.

### 2. Draw a committed selection

`render-chart.ts` gains an optional committed selection argument. `render-shell.ts` passes `null`. Given a selection, the chart maps the increment-1 result through the existing `yOf` and column centers and appends the lines after the bands.

Attributes: `data-littles="arrivalRate" | "departureRate" | "wip" | "approximateCycleTime"`, plus `data-open="true"` on an open-ended cycle-time line. No pointer handling yet, so there is still nothing to drag. The diff is the mapping from data units to the four SVG lines.

### 3. Drag, preview, commit, clear

`render-shell.ts` holds the selection and a preview flag, and passes them into the chart. The chart binds pointer listeners once on the stable chart section (the SVG is replaced on every paint). Document `keydown` for Escape is removed when the shell is disposed.

`root-css.ts` sets `touch-action: none` on `.cfd .plot`.

`tests/e2e/littles-law.spec.ts` checks, on balanced flow after stepping to a day past 8:

- a mouse drag from day 4's column to day 6's column shows the four committed lines, with WIP on the earlier day
- a leftward drag stores the earlier day as `startDay`
- a drag with the playhead still on day 2 draws nothing
- a plain click still glows the band and clears the lines
- Escape clears the lines
- a touch drag commits the same way

### 4. Playback, Hide done, and the comment

The shell keeps the stored days across Play, Back, Forward, and Reset. Drawing uses the visibility rules in "Playback after the lines are showing." One e2e, on the day 4–6 selection:

- at playhead 8 the cycle-time line is solid and ends on day 8
- Back to day 6 turns it dashed; Forward to day 8 turns it solid again
- Back to day 5 hides the arrival and departure lines and keeps WIP; Forward to day 6 restores both chords
- Reset hides every line; Forward back through day 6 restores them without a new drag
- Hide done drops the departure line and marks the cycle-time line open

Update the decision comment in `index.html` so it describes these four lines. Leave `prompts-decision-record/` as the record of the old overlay. The README embed contract does not change.

## Out of this pass

No readout, no toggle, and no change to the band glow except that a drag does not also count as a band click.
