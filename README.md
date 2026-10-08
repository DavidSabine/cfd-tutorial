# cfd-tutorial

Copyright © 2026 David Sabine. All rights reserved. No license is granted to use, copy, modify, or distribute this package except with prior written permission. See [LICENSE](LICENSE).

One browser script. The host sets `window.CFD_CONFIG`, loads the bundle, and listens for `cfd-resize`. The script adds `window.CFD.mount` and reads the config once.

```
npm install @davidsabine/cfd-tutorial
```

The built file is `dist/cfd-tutorial-1.0.0.js`. Copy it onto your own server, or point a script tag at `node_modules/@davidsabine/cfd-tutorial/dist/cfd-tutorial-1.0.0.js`. It is an IIFE. A static `import` runs before the config assignment, so load it with a script tag, or set the config and then `await import("@davidsabine/cfd-tutorial")`.

Online demo: https://davesabine.com/cfd-tutorial/demo

## Embed

```html
<div id="cfd-tutorial"></div>

<script>
	window.CFD_CONFIG = {
		container: "#cfd-tutorial",
		brand: "<strong>Your Brand</strong>",
		copyright: "© 2026 Your Company",
		sample: "balanced-flow"
	};
</script>
<script src="cfd-tutorial-1.0.0.js"></script>

<script>
	document.getElementById("cfd-tutorial").addEventListener("cfd-resize", (e) => {
		e.currentTarget.style.height = e.detail.height + "px";
	});
</script>
```

Place the resize listener after the bundle. The first event is dispatched on `window` `load`, or on a timeout when the document is already complete, so that listener still receives it.

`window.CFD.mount(override)` draws again. The override is merged onto the config captured at startup. Passing a new object later does not change a mount that already ran.

## Config

| Field | Default | Use |
| --- | --- | --- |
| `container` | `#cfd-tutorial` | CSS selector for the empty host element. A blank value uses the default. An invalid selector or a miss logs a warning and draws nothing. |
| `brand` | empty | HTML for the header slot. A blank string stays blank. |
| `copyright` | empty | Plain text in the footer. Markup is shown as text. A blank string stays blank. |
| `sample` | `balanced-flow` | One of `balanced-flow`, `growing-wip`, `recovery`, `arrival-spike`. A blank value uses the default. Any other id logs a warning and loads Balanced flow. |
| `title` | `Cumulative Flow` | Header text. A blank value uses the default. |

## Resize

The bundle dispatches a bubbling `CustomEvent` named `cfd-resize` on the container. `detail.height` is the tool's content height in pixels (`scrollHeight` of the inner root).

It fires when the tool first reports its size, when a sample loads, when Hide done or Little's law is toggled, and when a drag on the chart ends. The root itself uses the container's height. The event is how the host can grow the container to fit the content.

A container narrower than 640px or shorter than 480px still renders. The tool logs one warning per mount: `CFD: container is ${width}×${height}, which is below 640×480. The tool may clip.`

## Theme tokens

Every color, size, radius, and font default is a custom property on `.cfd`. Rules are class selectors under `.cfd`. There is no `:root` rule and no element selector. To override a token, set it on `.cfd` in a stylesheet that follows the bundle, or with a more specific selector such as `#cfd-tutorial .cfd`. A variable on `:root` does not win over the declaration on `.cfd`.

| CSS variable | Tailwind token | Default | What it styles |
| --- | --- | --- | --- |
| `--color-surface` | `--color-surface` | `#ffffff` | Tool background, controls, and the table header |
| `--color-foreground` | `--color-foreground` | `#1c1917` | Text, and the Little's law lines |
| `--color-muted` | `--color-muted` | `#78716c` | Labels, playback status, readout, and copyright |
| `--color-border` | `--color-border` | `#e7e5e4` | Panel, header, footer, and control borders |
| `--color-primary` | `--color-primary` | `#292524` | Play button and the playhead line |
| `--color-on-primary` | `--color-primary-foreground` | `#ffffff` | Play button label |
| `--color-highlight` | `--color-highlight` | `#f5f5f4` | Current table row |
| `--color-chart-1` | `--color-chart-1` | `#8fbfb3` | First state. In the samples, Backlog: band, note, and lane |
| `--color-chart-2` | `--color-chart-2` | `#7ea0c4` | Second state. In the samples, Doing |
| `--color-chart-3` | `--color-chart-3` | `#d4a574` | Third state. In the samples, Review |
| `--color-chart-4` | `--color-chart-4` | `#a89bb5` | Last state. In the samples, Done |
| `--border-width` | `--border-width` | `1px` | Borders |
| `--spacing-1` | `--spacing-1` | `0.25rem` | Table cell padding |
| `--spacing-2` | `--spacing-2` | `0.5rem` | Gaps, and control and note padding |
| `--spacing-3` | `--spacing-3` | `0.75rem` | Header, footer, and button padding |
| `--spacing-4` | `--spacing-4` | `1rem` | Page padding and the gap between panels |
| `--spacing-5` | `--spacing-5` | `1.25rem` | Declared for the scale. No built-in rule uses it |
| `--spacing-6` | `--spacing-6` | `1.5rem` | Declared for the scale. No built-in rule uses it |
| `--radius-md` | `--radius-md` | `0.375rem` | Panels, buttons, columns, and notes |
| `--text-xs` | `--text-xs` | `0.75rem` | Labels, status, table header, and readout |
| `--text-sm` | `--text-sm` | `0.875rem` | Body text and controls |
| `--text-base` | `--text-base` | `1rem` | Declared for the scale. No built-in rule uses it |
| `--text-lg` | `--text-lg` | `1.125rem` | Title |
| `--font-sans` | `--font-sans` | `ui-sans-serif, system-ui, sans-serif` | UI text |
| `--font-mono` | `--font-mono` | `ui-monospace, monospace` | The data table |
| `--size-chart` | none | `16rem` | Minimum chart height |
| `--size-board` | none | `12rem` | Minimum board height |
| `--duration-move` | none | `400ms` | Card slide. `0s` when the user prefers reduced motion |
| `--shadow-glow` | none | `0 0 0 1px rgb(28 25 23 / 0.35), 0 0 0 4px rgb(28 25 23 / 0.08)` | Selected note and selected table count |

Chart band colors are read from the computed values of `--color-chart-1` through `--color-chart-4`. Lanes and notes use the same variables.

## CSV

The bundle embeds the four samples. It does not upload a CSV. Each sample is a snapshot table, not a pre-cumulative series.

A header row is required, then one row per day. A column named `day` or `date` is the row label and is not a workflow state. Without that column, rows are numbered from 1. Every other column is a state, left to right on the board and bottom to top on the chart. The last column is Done. Row order is the timeline. The last row is the latest day.

Counts are whole numbers (`0`, `1`, `2`, …). A header with no data rows, a missing state column, or any other cell throws. Arrival on a day is the sum of that row. Departure is the Done count.
