import { expect, test } from "@playwright/test";

test("mounts the shell and reports height", async ({ page }) => {
	await page.addInitScript(() => {
		const target = window as Window & { __cfdHeights?: number[] };
		target.__cfdHeights = [];
		document.addEventListener("cfd-resize", (event) => {
			const height = (event as CustomEvent<{ height: number }>).detail.height;
			target.__cfdHeights?.push(height);
		});
	});

	await page.goto("/");

	await expect(page.locator("#cfd-tutorial > .cfd")).toHaveCount(1);
	await expect
		.poll(() =>
			page.evaluate(() => (window as Window & { __cfdHeights?: number[] }).__cfdHeights?.length ?? 0),
		)
		.toBeGreaterThan(0);

	const height = await page.evaluate(
		() => (window as Window & { __cfdHeights?: number[] }).__cfdHeights?.[0],
	);
	expect(height).toBeGreaterThan(400);

	await expect(page.getByRole("heading", { name: "Cumulative Flow" })).toBeVisible();
	await expect(page.getByText("Your Brand")).toBeVisible();
	await expect(page.getByText("© 2026 Your Company")).toBeVisible();
	await expect(page.getByRole("region", { name: "Cumulative flow diagram" })).toBeVisible();
	await expect(page.getByRole("region", { name: "Kanban board" })).toBeVisible();
	await expect(page.getByRole("region", { name: "Data table" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Play" })).toBeEnabled();
	await expect(page.getByRole("button", { name: "Back" })).toBeDisabled();
	await expect(page.getByRole("button", { name: "Forward" })).toBeEnabled();
	await expect(page.getByRole("button", { name: "Reset" })).toBeDisabled();
	await expect(page.getByRole("combobox", { name: "Speed" })).toBeEnabled();
	await expect(page.getByText("Day 0 of 16", { exact: true })).toBeVisible();
	await expect(page.getByRole("combobox", { name: "Sample" })).toHaveValue("balanced-flow");
	await expect(page.getByRole("columnheader", { name: "Done" })).toBeVisible();
	await expect(page.locator("#cfd-tutorial .sheet tbody tr")).toHaveCount(16);

	const mountType = await page.evaluate(() => typeof window.CFD?.mount);
	expect(mountType).toBe("function");
});

test("switching sample reloads the table and reports height", async ({ page }) => {
	await page.addInitScript(() => {
		const target = window as Window & { __cfdHeights?: number[] };
		target.__cfdHeights = [];
		document.addEventListener("cfd-resize", (event) => {
			const height = (event as CustomEvent<{ height: number }>).detail.height;
			target.__cfdHeights?.push(height);
		});
	});
	await page.goto("/");
	const readCount = () =>
		page.evaluate(() => (window as Window & { __cfdHeights?: number[] }).__cfdHeights?.length ?? 0);
	await expect.poll(readCount).toBeGreaterThan(0);
	const before = await readCount();

	await page.getByRole("combobox", { name: "Sample" }).selectOption("recovery");

	await expect(page.locator("#cfd-tutorial .sheet tbody tr")).toHaveCount(14);
	await expect.poll(readCount).toBeGreaterThan(before);
});
