import { type CfdConfig, type CfdConfigInput, resolveConfig } from "./resolve-config";
import { ROOT_CSS } from "./root-css";

const NARROW_PX = 640;
const SHORT_PX = 480;

const startupConfig = resolveConfig(window.CFD_CONFIG);
const cancelPending = new WeakMap<HTMLElement, () => void>();

function scheduleReport(container: HTMLElement, report: () => void): void {
	cancelPending.get(container)?.();
	const abort = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	cancelPending.set(container, () => {
		abort.abort();
		if (timer !== undefined) {
			clearTimeout(timer);
		}
	});
	if (document.readyState === "complete") {
		timer = setTimeout(report, 0);
		return;
	}
	window.addEventListener("load", report, { once: true, signal: abort.signal });
}

function render(config: CfdConfig): void {
	let match: Element | null;
	try {
		match = document.querySelector(config.container);
	} catch {
		console.warn(`CFD: container selector is invalid (${config.container}).`);
		return;
	}
	if (!(match instanceof HTMLElement)) {
		console.warn(`CFD: no container matched ${config.container}.`);
		return;
	}
	const container = match;
	container.querySelector("[data-cfd-style]")?.remove();
	container.querySelector(":scope > .cfd")?.remove();

	const style = document.createElement("style");
	style.dataset.cfdStyle = "";
	style.textContent = ROOT_CSS;
	container.append(style);

	const root = document.createElement("div");
	root.className = "cfd";
	container.append(root);

	let warned = false;
	scheduleReport(container, () => {
		const height = root.scrollHeight;
		container.dispatchEvent(
			new CustomEvent("cfd-resize", { bubbles: true, detail: { height } }),
		);
		const width = container.clientWidth;
		const boxHeight = container.clientHeight;
		if (!warned && (width < NARROW_PX || boxHeight < SHORT_PX)) {
			warned = true;
			console.warn(
				`CFD: container is ${width}×${boxHeight}, which is below ${NARROW_PX}×${SHORT_PX}. The tool may clip.`,
			);
		}
	});
}

function mount(override?: CfdConfigInput): void {
	const config = override ? resolveConfig({ ...startupConfig, ...override }) : startupConfig;
	render(config);
}

window.CFD = { mount };
mount();
