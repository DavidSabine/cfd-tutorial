import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const bundle = `cfd-tutorial-${pkg.version}.js`;
const needle = 'src="cfd-tutorial.js"';

await mkdir("dist", { recursive: true });
const html = await readFile("embed.html", "utf8");
if (!html.includes(needle)) {
	console.error(`embed.html is missing ${needle}.`);
	process.exit(1);
}
await writeFile("dist/index.html", html.replaceAll(needle, `src="${bundle}"`));
