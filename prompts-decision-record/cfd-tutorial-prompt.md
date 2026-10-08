# Grok Build prompt: single-page CFD teaching tool

Build a single-page teaching tool that animates a Cumulative Flow Diagram (CFD) alongside a Kanban board and the data table behind them. Trainers use it to show students how flow, WIP, and cycle time relate.

## Rules (follow verbatim)

1. Framework-agnostic JS bundle, unstyled but themeable via CSS vars/classes, embeddable anywhere — no Nuxt layer, no framework runtime.
2. White-label: brand slot + copyright line via config object.
3. Empty CFD and empty board on load; play advances one day per frame; cards animate (not draggable). Controls: play, step fwd/back, reset, speed — footer, audio-player style, above fold.
4. CSV data: one row per day, state columns, integer counts; row order is timeline; last row = today relative to load. Four embedded samples: balanced flow; growing WIP; recovery; arrival spike. Student upload deferred.
5. Layout: top title/brand; left 2/3 stacks CFD over Kanban board; right 1/3 spreadsheet table; no legend.
6. Toggles: hide done band on chart only; overlay Little's Law arrival/departure lines (vertical gap=WIP, horizontal=cycle time).
7. Click-drag on CFD recomputes Little's Law for that window only.
8. Bidirectional glow: board/table click highlights CFD; CFD click highlights table/board.

## Deliverable

- One HTML file containing the bundle, the four embedded sample CSVs, and minimal default theming through CSS variables. Structure the JS so it can also be lifted out as a standalone `cfd-tutorial.js` for the script-tag embed below.
- A brief embed README, following the Embed contract section below.

## Embed contract

- **DOM injection, no iframe.** The bundle renders straight into the host page's DOM. It is self-contained and adds nothing to the global namespace except one root object (for example `window.CFD`). Scope all CSS under the tool's root class so it can't leak into the host page.
- **One container.** The embedder provides one empty container `div`. The bundle fills it, takes the container's width, and sets its height to 100% of the container.
- **No forced minimum size.** If the container is too small, the tool still renders but may clip, and it logs a `console.warn` saying so.
- **Height reporting.** Whenever its content height changes (on load, on data load, on a toggle, on a drag-select), the bundle dispatches a `CustomEvent` named `cfd-resize` with `detail: { height }` in pixels. Dispatch it on the container element with `bubbles: true` so the host can listen on the container or on `document` and set the container height dynamically.
- **Configuration.** Use one script tag for the bundle and one container `div`. Optional config goes in a second script that sets `window.CFD_CONFIG` before the bundle loads. The bundle reads it once at startup. `window.CFD_CONFIG` belongs to the host page, so it doesn't count against the one-root-object rule.

### Embed README must document

- The single script tag, the single container `div`, and the optional `window.CFD_CONFIG`, including its fields (brand slot, copyright line, default sample, and anything else you add).
- The `cfd-resize` event: its name, `detail.height`, when it fires, and where it's dispatched.
- The CSS variables and classes available for theming, including a **token mapping table** that lists each CSS variable, the Tailwind theme token it corresponds to, its default value, and what it styles, so the embedder can override it in their Tailwind config or by redefining the variable.
- The CSV format.
- The minimal embed example below.

### Minimal embed example (put this in the README)

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

## Styling conventions

- **Follow Nuxt + Tailwind design patterns** so the tool's styles take on the look of the host's existing Nuxt/Tailwind project. This is a naming and token convention only. Rule 1 still holds: no Tailwind build step, no Nuxt layer, and no framework runtime in the bundle.
- **Class names.** Use common Nuxt/Tailwind token and class naming. Prefer names that read like Tailwind utilities and are semantic but Tailwind-compatible, such as `bg-surface`, `text-muted`, and `border-border`, over bespoke prefixed names like `cfd-panel-bg`.
- **CSS custom properties.** Map them to typical Tailwind theme tokens for colors, spacing, radii, and font sizes, using standard names where possible (for example `--color-surface`, `--color-muted`, `--color-border`, `--color-primary`, `--spacing-*`, `--radius-*`, `--text-*`). The embedder can override them through their Tailwind config or by redefining the variables.
- **Zero hard-coded visual values.** Every color, size, spacing value, radius, and font size comes from those tokens. Each token has a sensible default declared once on the root class.
- **No global styles.** Don't use resets, element selectors, or `:root` rules that could clash with a host Tailwind build. Scope every rule under the container's root class.

## Ambiguity

Where these rules leave something open, pick the simplest choice and note every such choice in one comment at the top of the HTML file.

## How to work (David's standing workflow)

- Start with an incremental plan of small steps, from nothing to the finished deliverable. Show the plan before writing code.
- Each increment changes only as much code as David can read in one sitting.
- David runs it and reviews the code before anything is committed. A separate branch is fine, but don't commit or push without his explicit go-ahead.
