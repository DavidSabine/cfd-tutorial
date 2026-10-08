export const ROOT_CSS = `
.cfd {
	--color-surface: #ffffff;
	--color-foreground: #1c1917;
	--color-muted: #78716c;
	--color-border: #e7e5e4;
	--color-primary: #292524;
	--color-on-primary: #ffffff;
	--color-highlight: #f5f5f4;
	--border-width: 1px;
	--color-chart-1: #8fbfb3;
	--color-chart-2: #7ea0c4;
	--color-chart-3: #d4a574;
	--color-chart-4: #a89bb5;
	--spacing-1: 0.25rem;
	--spacing-2: 0.5rem;
	--spacing-3: 0.75rem;
	--spacing-4: 1rem;
	--spacing-5: 1.25rem;
	--spacing-6: 1.5rem;
	--radius-md: 0.375rem;
	--text-xs: 0.75rem;
	--text-sm: 0.875rem;
	--text-base: 1rem;
	--text-lg: 1.125rem;
	--font-sans: ui-sans-serif, system-ui, sans-serif;
	--font-mono: ui-monospace, monospace;
	--size-chart: 16rem;
	--size-board: 12rem;
	--duration-move: 200ms;
	--shadow-glow: 0 0 0 1px rgb(28 25 23 / 0.35), 0 0 0 4px rgb(28 25 23 / 0.08);
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: hidden;
	font-family: var(--font-sans);
	font-size: var(--text-sm);
	color: var(--color-foreground);
	background: var(--color-surface);
}

.cfd .box-border { box-sizing: border-box; }
.cfd .flex { display: flex; }
.cfd .flex-col { display: flex; flex-direction: column; }
.cfd .flex-wrap { flex-wrap: wrap; }
.cfd .flex-1 { flex: 1 1 auto; min-height: 0; }
.cfd .grow-2 { flex: 2 1 0; min-width: 0; }
.cfd .grow-1 { flex: 1 1 0; min-width: 0; }
.cfd .items-center { align-items: center; }
.cfd .justify-between { justify-content: space-between; }
.cfd .gap-2 { gap: var(--spacing-2); }
.cfd .p-2 { padding: var(--spacing-2); }
.cfd .h-full { height: 100%; }
.cfd .min-w-0 { min-width: 0; }
.cfd .gap-4 { gap: var(--spacing-4); }
.cfd .m-0 { margin: 0; }
.cfd .p-4 { padding: var(--spacing-4); }
.cfd .px-4 { padding-right: var(--spacing-4); padding-left: var(--spacing-4); }
.cfd .py-3 { padding-top: var(--spacing-3); padding-bottom: var(--spacing-3); }
.cfd .min-h-0 { min-height: 0; }
.cfd .min-h-chart { min-height: var(--size-chart); }
.cfd .min-h-board { min-height: var(--size-board); }
.cfd .rounded-md { border-radius: var(--radius-md); }
.cfd .border { border-style: solid; border-width: var(--border-width); }
.cfd .border-border { border-color: var(--color-border); }
.cfd .border-b {
	border-bottom-style: solid;
	border-bottom-width: var(--border-width);
	border-bottom-color: var(--color-border);
}
.cfd .border-t {
	border-top-style: solid;
	border-top-width: var(--border-width);
	border-top-color: var(--color-border);
}
.cfd .text-xs { font-size: var(--text-xs); }
.cfd .text-sm { font-size: var(--text-sm); }
.cfd .text-lg { font-size: var(--text-lg); }
.cfd .text-muted { color: var(--color-muted); }
.cfd .font-mono { font-family: var(--font-mono); }
.cfd .overflow-auto { overflow: auto; }
.cfd .w-full { width: 100%; }
.cfd .text-left { text-align: left; }
.cfd .nowrap { white-space: nowrap; }
.cfd .grid-table { width: 100%; border-collapse: collapse; }
.cfd .cell {
	padding: var(--spacing-1) var(--spacing-2);
	border-bottom-style: solid;
	border-bottom-width: var(--border-width);
	border-bottom-color: var(--color-border);
	font-size: var(--text-xs);
	text-align: right;
}
.cfd .sticky-top {
	position: sticky;
	top: 0;
	background: var(--color-surface);
	color: var(--color-muted);
}
.cfd .row-current .cell {
	background: var(--color-highlight);
}
.cfd .btn {
	margin: 0;
	padding: var(--spacing-2) var(--spacing-3);
	border-style: solid;
	border-width: var(--border-width);
	border-color: var(--color-border);
	border-radius: var(--radius-md);
	background: var(--color-surface);
	color: var(--color-foreground);
	font-family: inherit;
	font-size: var(--text-sm);
}
.cfd .btn-primary {
	border-color: var(--color-primary);
	background: var(--color-primary);
	color: var(--color-on-primary);
}
.cfd .btn:disabled {
	border-color: var(--color-border);
	background: var(--color-surface);
	color: var(--color-muted);
}
.cfd .column { border-radius: var(--radius-md); }
.cfd .card {
	align-self: center;
	width: 5.5rem;
	max-width: 100%;
	margin: 0;
	padding: var(--spacing-2);
	border-style: solid;
	border-width: var(--border-width);
	border-radius: var(--radius-md);
	color: var(--color-foreground);
	font-family: inherit;
	font-size: var(--text-sm);
	text-align: center;
	white-space: nowrap;
}
.cfd .tone-1 {
	background: var(--color-chart-1);
	border-color: color-mix(in srgb, var(--color-chart-1) 72%, var(--color-foreground));
}
.cfd .tone-2 {
	background: var(--color-chart-2);
	border-color: color-mix(in srgb, var(--color-chart-2) 72%, var(--color-foreground));
}
.cfd .tone-3 {
	background: var(--color-chart-3);
	border-color: color-mix(in srgb, var(--color-chart-3) 72%, var(--color-foreground));
}
.cfd .tone-4 {
	background: var(--color-chart-4);
	border-color: color-mix(in srgb, var(--color-chart-4) 72%, var(--color-foreground));
}
.cfd .lane-1 { background: color-mix(in srgb, var(--color-chart-1) 16%, var(--color-surface)); }
.cfd .lane-2 { background: color-mix(in srgb, var(--color-chart-2) 16%, var(--color-surface)); }
.cfd .lane-3 { background: color-mix(in srgb, var(--color-chart-3) 16%, var(--color-surface)); }
.cfd .lane-4 { background: color-mix(in srgb, var(--color-chart-4) 16%, var(--color-surface)); }
.cfd .lane-1.is-selected { background: color-mix(in srgb, var(--color-chart-1) 28%, var(--color-surface)); }
.cfd .lane-2.is-selected { background: color-mix(in srgb, var(--color-chart-2) 28%, var(--color-surface)); }
.cfd .lane-3.is-selected { background: color-mix(in srgb, var(--color-chart-3) 28%, var(--color-surface)); }
.cfd .lane-4.is-selected { background: color-mix(in srgb, var(--color-chart-4) 28%, var(--color-surface)); }
.cfd .is-selected { box-shadow: var(--shadow-glow); }
.cfd .column.is-selected { box-shadow: none; }
.cfd .cell-selected { box-shadow: var(--shadow-glow); }
.cfd .hit { cursor: pointer; }
.cfd .plot {
	display: block;
	flex: 1 1 auto;
	width: 100%;
	height: 100%;
	min-height: 0;
}
.cfd .band { cursor: pointer; }
.cfd .card-move {
	transition-property: transform;
	transition-duration: var(--duration-move);
}
@media (prefers-reduced-motion: reduce) {
	.cfd { --duration-move: 0s; }
}
`;
