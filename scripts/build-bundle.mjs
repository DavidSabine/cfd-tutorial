import * as esbuild from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const outfile = `dist/cfd-tutorial-${pkg.version}.js`;

await import("./stage-embed.mjs");

const buildOptions = {
	entryPoints: ["src/ts/cfd-tutorial.ts"],
	bundle: true,
	outfile,
	minify: true,
	sourcemap: true,
	format: "iife",
	target: "es2022",
};

if (process.argv.includes("--watch")) {
	const ctx = await esbuild.context(buildOptions);
	await ctx.watch();
	console.log(`watching ${outfile}`);
} else {
	const result = await esbuild.build(buildOptions);
	const warnings = result.warnings.map((warning) => ({
		text: warning.text,
		location: warning.location,
		notes: warning.notes?.map((note) => ({ text: note.text })) ?? [],
	}));
	writeFileSync("dist/build-warnings.json", `${JSON.stringify(warnings, null, "\t")}\n`);
}
