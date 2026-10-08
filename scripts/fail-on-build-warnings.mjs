import { existsSync, readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const bundle = `dist/cfd-tutorial-${pkg.version}.js`;
const entry = `./${bundle}`;

if (!existsSync(bundle)) {
	console.error(`Build did not produce ${bundle}.`);
	process.exit(1);
}

const pointed = [pkg.main, pkg.browser, pkg.exports?.["."]];
for (const value of pointed) {
	if (value !== entry) {
		console.error(`Package entry must be ${entry}. Found ${value}.`);
		process.exit(1);
	}
}

const warningsPath = "dist/build-warnings.json";
if (!existsSync(warningsPath)) {
	console.error(`Missing ${warningsPath}. Run the build first.`);
	process.exit(1);
}

const warnings = JSON.parse(readFileSync(warningsPath, "utf8"));
if (!Array.isArray(warnings)) {
	console.error("Build warnings file is not a list.");
	process.exit(1);
}

if (warnings.length > 0) {
	for (const warning of warnings) {
		const loc = warning.location;
		const where = loc?.file ? `${loc.file}:${loc.line}:${loc.column}` : "unknown";
		console.error(`Build warning (${where}): ${warning.text}`);
		for (const note of warning.notes ?? []) {
			console.error(`  ${note.text}`);
		}
	}
	console.error(`Build produced ${warnings.length} warning(s).`);
	process.exit(1);
}
