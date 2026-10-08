import { expect, test } from "vitest";
import { resolveConfig } from "./resolve-config";

test("fills defaults when config is missing", () => {
	expect(resolveConfig(undefined)).toEqual({
		container: "#cfd-tutorial",
		brand: "",
		copyright: "",
		sample: "balanced-flow",
		title: "Cumulative Flow",
	});
});

test("keeps a provided config", () => {
	expect(
		resolveConfig({
			container: "#board",
			brand: "<strong>Academy</strong>",
			copyright: "© 2026 David Sabine",
			sample: "recovery",
			title: "Flow",
		}),
	).toEqual({
		container: "#board",
		brand: "<strong>Academy</strong>",
		copyright: "© 2026 David Sabine",
		sample: "recovery",
		title: "Flow",
	});
});

test("falls back when container, sample, or title is blank", () => {
	expect(
		resolveConfig({
			container: "   ",
			sample: "",
			title: " ",
			copyright: "",
		}),
	).toEqual({
		container: "#cfd-tutorial",
		brand: "",
		copyright: "",
		sample: "balanced-flow",
		title: "Cumulative Flow",
	});
});
