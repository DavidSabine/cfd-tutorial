import { expect, test } from "@playwright/test";

test("mounts a root and reports height", async ({ page }) => {
	await page.addInitScript(() => {
		const target = window as Window & { __cfdHeights?: number[] };
		target.__cfdHeights = [];
		document.addEventListener("cfd-resize", (event) => {
			const height = (event as CustomEvent<{ height: number }>).detail.height;
			target.__cfdHeights?.push(height);
		});
	});

	await page.goto("/");

	await expect(page.locator("#cfd-tool > .cfd")).toHaveCount(1);
	await expect
		.poll(() =>
			page.evaluate(() => (window as Window & { __cfdHeights?: number[] }).__cfdHeights?.length ?? 0),
		)
		.toBeGreaterThan(0);

	const height = await page.evaluate(
		() => (window as Window & { __cfdHeights?: number[] }).__cfdHeights?.[0],
	);
	expect(height).toEqual(expect.any(Number));

	const mountType = await page.evaluate(() => typeof window.CFD?.mount);
	expect(mountType).toBe("function");
});
