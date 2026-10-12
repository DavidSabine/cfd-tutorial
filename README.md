# cfd-tutorial

Yes. You can try the chart [on this page](https://davesabine.com/cfd-tutorial/demo). The npm package, or the JavaScript bundle directly, can be used in your own web page.

I do not provide tech support.

Copyright © 2026 David Sabine. Released under the [MIT License](LICENSE).

This package is a lightweight JavaScript bundle that you can import like any npm package, or you can download the JS file and include it in your project's file system. Instructions are below to set `window.CFD_CONFIG` with your own branding.

## Add it to your page

Install it the usual way:

```
npm install @davidsabine/cfd-tutorial
```

The file you want is `node_modules/@davidsabine/cfd-tutorial/dist/cfd-tutorial.js`. You can leave it there and point a script tag at it, or copy that file into your own site and serve it yourself.

You can also skip the install and load the newest 1.x release from the jsdelivr CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@davidsabine/cfd-tutorial@1/dist/cfd-tutorial.js"></script>
```

To stay on one release, put that version in place of `@1`. The file name does not change between releases. A comment at the top of the file names the version.

The script runs as soon as the browser loads it. Put your `window.CFD_CONFIG` script before it. A normal `import` runs too early, before that config exists. Use a script tag, or set the config and then load it with `await import("@davidsabine/cfd-tutorial")`.

## Embed

Paste this into your page and change the brand, copyright, and sample. The `div` is where the tool draws. The first script is your settings. The second script is the bundle. The third script makes the box tall enough for the chart. The sample expects the bundle on your site as `cfd-tutorial.js`. You can put the CDN address above in that same script tag instead.

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
<script src="cfd-tutorial.js"></script>

<script>
	document.getElementById("cfd-tutorial").addEventListener("cfd-resize", (e) => {
		e.currentTarget.style.height = e.detail.height + "px";
	});
</script>
```

Keep the resize listener after the bundle. The tool sends the first `cfd-resize` on `window` `load`, or a moment later if the page has already finished loading, so a listener written below the bundle still receives it.

To draw the tool again, call `window.CFD.mount(override)`. The object you pass is merged onto the settings captured at startup. Changing `window.CFD_CONFIG` later has no effect on a mount that already ran.

## While the script loads

Until the bundle runs, your container has no height of its own. You can put a placeholder inside it so visitors see the shape of the chart, the board, and the table while the file downloads. Mark that element with `data-cfd-loading` and place it directly inside the container. On mount, the tool removes it. Style the placeholder in your page. The tool adds its own styles at the same moment it removes the placeholder. Make the chart area at least 16rem tall and the board at least 12rem, with the table beside them. One spinner sits in the chart. The other shapes have no labels or counts. The words "Loading Cumulative Flow" are for a screen reader, and `role="status"` asks the browser to announce them. When the visitor prefers reduced motion, the spinner stays still.

Put the `style` element in the page. Put the placeholder inside the container from the example above.

```html
<style>
	.cfd-loading {
		position: relative;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: #ffffff;
		color: #1c1917;
		font-family: ui-sans-serif, system-ui, sans-serif;
	}

	.cfd-loading * {
		box-sizing: border-box;
	}

	.cfd-loading-label {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.cfd-loading-header,
	.cfd-loading-footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1rem;
	}

	.cfd-loading-header {
		border-bottom: 1px solid #e7e5e4;
	}

	.cfd-loading-footer {
		border-top: 1px solid #e7e5e4;
	}

	.cfd-loading-main {
		display: flex;
		flex: 1 1 auto;
		gap: 1rem;
		min-height: 0;
		padding: 1rem;
	}

	.cfd-loading-stack {
		display: flex;
		flex: 2 1 0;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	.cfd-loading-chart,
	.cfd-loading-board,
	.cfd-loading-sheet {
		border: 1px solid #e7e5e4;
		border-radius: 0.375rem;
	}

	.cfd-loading-chart {
		display: flex;
		flex: 1 1 auto;
		align-items: center;
		justify-content: center;
		min-height: 16rem;
	}

	.cfd-loading-board {
		display: flex;
		flex: 1 1 auto;
		gap: 0.5rem;
		min-height: 12rem;
		padding: 0.5rem;
	}

	.cfd-loading-lane {
		flex: 1 1 0;
		min-width: 0;
		border-radius: 0.375rem;
		background: #f5f5f4;
	}

	.cfd-loading-sheet {
		display: flex;
		flex: 1 1 0;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 0;
		padding: 0.5rem;
	}

	.cfd-loading-bar {
		display: block;
		height: 0.75rem;
		border-radius: 0.375rem;
		background: #f5f5f4;
	}

	.cfd-loading-bar.title {
		width: 8rem;
		height: 1.125rem;
	}

	.cfd-loading-bar.brand {
		width: 5rem;
		height: 0.875rem;
	}

	.cfd-loading-bar.head {
		width: 70%;
	}

	.cfd-loading-bar.row {
		width: 100%;
	}

	.cfd-loading-bar.status {
		width: 6rem;
	}

	.cfd-loading-bar.copyright {
		width: 8rem;
	}

	.cfd-loading-pills {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.cfd-loading-pill {
		display: block;
		width: 4rem;
		height: 2.25rem;
		border: 1px solid #e7e5e4;
		border-radius: 0.375rem;
		background: #f5f5f4;
	}

	.cfd-loading-spinner {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid #e7e5e4;
		border-top-color: #1c1917;
		border-radius: 50%;
		animation: cfd-spin 0.8s linear infinite;
	}

	@keyframes cfd-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cfd-loading-spinner {
			animation: none;
		}
	}
</style>

<div class="cfd-loading" data-cfd-loading role="status">
	<span class="cfd-loading-label">Loading Cumulative Flow</span>
	<div class="cfd-loading-header" aria-hidden="true">
		<span class="cfd-loading-bar title"></span>
		<span class="cfd-loading-bar brand"></span>
	</div>
	<div class="cfd-loading-main">
		<div class="cfd-loading-stack">
			<div class="cfd-loading-chart" aria-hidden="true">
				<span class="cfd-loading-spinner"></span>
			</div>
			<div class="cfd-loading-board" aria-hidden="true">
				<span class="cfd-loading-lane"></span>
				<span class="cfd-loading-lane"></span>
				<span class="cfd-loading-lane"></span>
				<span class="cfd-loading-lane"></span>
			</div>
		</div>
		<div class="cfd-loading-sheet" aria-hidden="true">
			<span class="cfd-loading-bar head"></span>
			<span class="cfd-loading-bar row"></span>
			<span class="cfd-loading-bar row"></span>
			<span class="cfd-loading-bar row"></span>
			<span class="cfd-loading-bar row"></span>
			<span class="cfd-loading-bar row"></span>
			<span class="cfd-loading-bar row"></span>
		</div>
	</div>
	<div class="cfd-loading-footer" aria-hidden="true">
		<div class="cfd-loading-pills">
			<span class="cfd-loading-pill"></span>
			<span class="cfd-loading-pill"></span>
			<span class="cfd-loading-pill"></span>
			<span class="cfd-loading-pill"></span>
			<span class="cfd-loading-bar status"></span>
		</div>
		<span class="cfd-loading-bar copyright"></span>
	</div>
</div>
```

## Config

Set these fields on `window.CFD_CONFIG` before the bundle loads. The bundle reads them once.

| Field | Default | Use |
| --- | --- | --- |
| `container` | `#cfd-tutorial` | CSS selector for the element where the tool draws. A placeholder marked `data-cfd-loading` directly inside it is removed on mount. A blank value uses the default. An invalid selector, or a selector that matches nothing, logs a warning and draws nothing. |
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
