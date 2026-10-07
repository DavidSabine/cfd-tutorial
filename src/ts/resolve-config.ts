export type CfdConfig = {
	container: string;
	brand: string;
	copyright: string;
	sample: string;
	title: string;
};

export type CfdConfigInput = Partial<CfdConfig>;

export type CfdApi = {
	mount: (config?: CfdConfigInput) => void;
};

const DEFAULT_CONFIG: CfdConfig = {
	container: "#cfd-tool",
	brand: "",
	copyright: "",
	sample: "balanced-flow",
	title: "Cumulative Flow",
};

function filled(value: string | undefined, fallback: string): string {
	if (value === undefined || value.trim() === "") {
		return fallback;
	}
	return value;
}

export function resolveConfig(raw: CfdConfigInput | undefined): CfdConfig {
	return {
		container: filled(raw?.container, DEFAULT_CONFIG.container),
		brand: raw?.brand ?? DEFAULT_CONFIG.brand,
		copyright: raw?.copyright ?? DEFAULT_CONFIG.copyright,
		sample: filled(raw?.sample, DEFAULT_CONFIG.sample),
		title: filled(raw?.title, DEFAULT_CONFIG.title),
	};
}
