export const ROOT_CSS = `
.cfd {
	--color-surface: #ffffff;
	--color-foreground: #1c1917;
	--color-muted: #78716c;
	--color-border: #e7e5e4;
	--color-primary: #0f766e;
	--color-on-primary: #ffffff;
	--border-width: 1px;
	--color-chart-1: #0f766e;
	--color-chart-2: #0369a1;
	--color-chart-3: #b45309;
	--color-chart-4: #64748b;
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
	--shadow-glow: 0 0 0 2px var(--color-primary);
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
`;
