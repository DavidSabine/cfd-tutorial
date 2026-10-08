# cfd-tutorial

Copyright © 2026 David Sabine. All rights reserved. No license is granted to use, copy, modify, or distribute this package except with prior written permission. See [LICENSE](LICENSE).

This package is a lightweight JavaScript bundle that you can import like any npm package, or you can download the JS file and include it in your project's file system. Instructions are below to set `window.CFD_CONFIG` with your own branding.

You can try the tool here: https://davesabine.com/cfd-tutorial/demo

## Add it to your page

Install it the usual way:

```
npm install @davidsabine/cfd-tutorial
```

The file you want is `node_modules/@davidsabine/cfd-tutorial/dist/cfd-tutorial-1.x.x.js`. You can leave it there and point a script tag at it, or copy that file into your own site and serve it yourself.

The script runs as soon as the browser loads it. Put your `window.CFD_CONFIG` script before it. A normal `import` runs too early, before that config exists. Use a script tag, or set the config and then load it with `await import("@davidsabine/cfd-tutorial")`.

## Embed

Paste this into your page and change the brand, copyright, and sample. The empty `div` is where the tool draws. The first script is your settings. The second script is the bundle. The third script makes the box tall enough for the chart.

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

Keep the resize listener after the bundle. The tool sends the first `cfd-resize` on `window` `load`, or a moment later if the page has already finished loading, so a listener written below the bundle still receives it.

To draw the tool again, call `window.CFD.mount(override)`. The object you pass is merged onto the settings captured at startup. Changing `window.CFD_CONFIG` later has no effect on a mount that already ran.

## Config

Set these fields on `window.CFD_CONFIG` before the bundle loads. The bundle reads them once.

| Field | Default | Use |
| --- | --- | --- |
| `container` | `#cfd-tutorial` | CSS selector for the empty element where the tool should draw. A blank value uses the default. An invalid selector, or a selector that matches nothing, logs a warning and draws nothing. |
| `brand` | empty | HTML shown in the header. A blank string stays blank. |
| `copyright` | empty | Plain text in the footer. HTML is shown as text, not rendered. A blank string stays blank. |
| `sample` | `balanced-flow` | Which built-in story to show: `balanced-flow`, `growing-wip`, `recovery`, or `arrival-spike`. A blank value uses the default. Any other name logs a warning and loads Balanced flow. |
| `title` | `Cumulative Flow` | Header text. A blank value uses the default. |

## Resize

The tool sends a `cfd-resize` event from your container. It bubbles, so the listener in the example above receives it. `detail.height` is how many pixels tall the tool's content is.

The event fires when the tool first measures itself, when a sample loads, and when Hide done is toggled. Use the height to grow your container so the chart and board are not cut off.

A container narrower than 640px or shorter than 480px still draws. The tool logs one warning each time it mounts, for example: `CFD: container is 400×300, which is below 640×480. The tool may clip.`

## Colors and sizes

You can adjust the style the UI: colors, spacing, fonts, and corner radius are CSS variables on the `.cfd` element inside your container. To change one, set it on `.cfd` in a stylesheet that comes after the bundle:

```css
#cfd-tutorial .cfd {
	--color-primary: #1d4ed8;
}
```

Set the variable on `.cfd`. A variable on `:root` or `body` will not replace the value the bundle sets on `.cfd`.

| CSS variable | Tailwind name | Default | What it styles |
| --- | --- | --- | --- |
| `--color-surface` | `--color-surface` | `#ffffff` | Tool background, controls, and the table header |
| `--color-foreground` | `--color-foreground` | `#1c1917` | Text |
| `--color-muted` | `--color-muted` | `#78716c` | Labels, playback status, and copyright |
| `--color-border` | `--color-border` | `#e7e5e4` | Panel, header, footer, and control borders |
| `--color-primary` | `--color-primary` | `#292524` | Play button |
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
| `--spacing-5` | `--spacing-5` | `1.25rem` | Part of the spacing scale. The built-in layout does not use it |
| `--spacing-6` | `--spacing-6` | `1.5rem` | Part of the spacing scale. The built-in layout does not use it |
| `--radius-md` | `--radius-md` | `0.375rem` | Panels, buttons, columns, and notes |
| `--text-xs` | `--text-xs` | `0.75rem` | Labels, status, and table header |
| `--text-sm` | `--text-sm` | `0.875rem` | Body text and controls |
| `--text-base` | `--text-base` | `1rem` | Part of the type scale. The built-in layout does not use it |
| `--text-lg` | `--text-lg` | `1.125rem` | Title |
| `--font-sans` | `--font-sans` | `ui-sans-serif, system-ui, sans-serif` | UI text |
| `--font-mono` | `--font-mono` | `ui-monospace, monospace` | The data table |
| `--size-chart` | none | `16rem` | Minimum chart height |
| `--size-board` | none | `12rem` | Minimum board height |
| `--duration-move` | none | `400ms` | Card slide. `0s` when the visitor prefers reduced motion |
| `--shadow-glow` | none | `0 0 0 1px rgb(28 25 23 / 0.35), 0 0 0 4px rgb(28 25 23 / 0.08)` | Selected note and selected table count |

The chart reads the computed colors of `--color-chart-1` through `--color-chart-4`. The board lanes and notes use those same colors.

If you use Tailwind, the middle column is the theme token with the same role.

## Sample data

Four sample stories are built into the file. Visitors pick one in the footer. There is no CSV upload.

Each sample is a daily snapshot. A cell is how many items are in that column on that day. It is the count for the day, not a running total you add up yourself.

The table starts with a header row, then one row per day. A column named `day` or `date` is the label for that row, not a workflow state. Without that column, rows are numbered from 1. Every other column is a state: left to right on the board, and bottom to top on the chart. The last column is Done. The first data row is the earliest day, and the last row is the latest day.

Counts are whole numbers (`0`, `1`, `2`, and so on). A header with no data rows, a missing state column, or any other kind of cell stops the tool with an error. Arrival on a day is the sum of that row. Departure is the Done count.
