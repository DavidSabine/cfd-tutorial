Here is the incremental plan. Each step is one sitting's worth of cfd-tutorial.js, and I will stop after each step so you can run it and read it.

Decisions I will lock in (also written in one comment at the top of index.html)

• One JS source. cfd-tutorial.js is the bundle. index.html loads it with a script tag, sets window.CFD_CONFIG, and listens for cfd-resize. Samples and default CSS live in the bundle so the embed and the page cannot drift.
• Snapshots, not pre-cumulative CSV. A header row, then one integer row per day. A day column is the label. Every other column is a workflow state, left to right on the board. The last column is Done (departure line, and the band the hide toggle removes).
• Synthetic FIFO cards. The CSV has counts only. Card n (1 = oldest) on day d sits in the rightmost state s whose count, plus every state to its right, is at least n. Play moves the card when that state changes. Cards are not draggable.
• Playhead starts at day 0. The configured sample is loaded, the table shows every row, and the chart and board are empty until play or step. The table row for the current day is highlighted.
• Sample switcher in the footer. Four built-in samples. Switching sample resets to day 0. No student upload.
• Little's Law. Arrival A(d) is the sum of all states. Departure D(d) is the Done count. With the overlay on, a vertical segment at the end of the window is WIP = A − D, and a horizontal segment back to where arrivals first reached that Done count is approximate cycle time. The readout also shows mean WIP, throughput, and Little's Law cycle time (mean WIP / throughput) for the window. Dragging on the chart sets that window. With no drag, the window is day 1 through the playhead.
• Hide Done affects the chart only. The Done band is omitted and the other bands sit on the axis, so the chart height is WIP.
• Clicking a day jumps the playhead so the board, table, and chart show the same day. Glow keys off { day, state }.
• Layout height. The root fills the container (height: 100%, overflow clips). It reports the intrinsic content height (header + chart min + board min + footer). The host's cfd-resize listener can grow the container. If the container is below that height, or narrower than 640px, it still renders and logs console.warn.
• Brand is inserted as HTML. Copyright is plain text in the footer. Optional config field title defaults to "Cumulative Flow".

Files

┌─────────────┬─────────────────────────────────────────────────────────────────────────────────┐
│ File        │ Role                                                                            │
├─────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ cfd-tutorial.js │ Bundle: mount, styles, samples, chart, board, table, controls. Sets window.CFD. │
├─────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ index.html  │ Runner page + the ambiguity comment.                                            │
├─────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ README.md   │ Embed contract (replaces the one-line readme).                                  │
└─────────────┴─────────────────────────────────────────────────────────────────────────────────┘

window.CFD_CONFIG fields: container, brand, copyright, sample, title. Sample ids: balanced-flow, growing-wip, recovery, arrival-spike.

Steps

1. Shell. Mount into the container, scoped class cfd, token defaults on that class only (no :root, no element selectors). Header, empty left stack, empty table, inert footer. Dispatch cfd-resize. Warn when the container is too small. index.html wired to the embed example.

2. Data and table. Parser plus the four CSVs (about 14–16 days each: stable WIP, rising WIP, rise-then-catch-up, one-day arrival burst). Sample <select> renders the spreadsheet. Chart and board stay empty.

3. Transport. Day 0 through last row. Play, pause, step back, step forward, reset, speed (0.5×, 1×, 2×, 4×; 1× = 1 day/second). Stepping pauses playback. Current row glows. Footer is one audio-player bar.

4. Board. Build the FIFO card list up to the playhead. Three or four columns come from the CSV (the samples use Backlog, Doing, Review, Done). Cards slide with a short FLIP when the day changes. Column and card clicks set the highlight.

5. CFD. SVG stacked bands through the playhead, colors from --color-chart-1 … --color-chart-4, read back from computed style. Hide-Done toggle. Click a band to set { day, state } and jump the playhead. Glow connects chart, board, and table.

6. Little's Law. Overlay toggle, geometric WIP and cycle-time segments, numeric readout, click-drag window that recomputes those figures for the dragged days only. Resize event fires on toggle and on drag end.

7. README. Script tag, container, config fields, cfd-resize, CSS variable table (variable, Tailwind token, default, what it styles), CSV format, and the minimal embed example from the prompt.

8. webpack.config.js


Tokens (defaults set once on .cfd, every visual rule uses var(--…)): --color-surface, --color-foreground, --color-muted, --color-border, --color-primary, --color-chart-1–4, --spacing-1–6, --radius-md, --text-xs/sm/base/lg, --font-sans, --font-mono, --size-chart, --size-board, --shadow-glow. Classes on the markup read like Tailwind utilities (bg-surface, text-muted, border-border, rounded-md).