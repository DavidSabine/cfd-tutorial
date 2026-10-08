import { expect, test } from "@playwright/test";

test("steps, pauses, and resets the playhead", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Forward" }).click();
	await page.getByRole("button", { name: "Forward" }).click();
	await expect(page.getByText("Day 2 of 16", { exact: true })).toBeVisible();
	await expect(page.locator("#cfd-tutorial tbody tr[aria-current='true'] td").first()).toHaveText("2");

	await page.getByRole("button", { name: "Back", exact: true }).click();
	await expect(page.getByText("Day 1 of 16", { exact: true })).toBeVisible();
	await expect(page.getByRole("button", { name: "Play" })).toBeVisible();

	await page.getByRole("button", { name: "Reset" }).click();
	await expect(page.getByText("Day 0 of 16", { exact: true })).toBeVisible();
	await expect(page.locator("#cfd-tutorial tbody tr[aria-current='true']")).toHaveCount(0);
	await expect(page.getByRole("button", { name: "Back" })).toBeDisabled();
});

test("play advances one day per second and pause holds the day", async ({ page }) => {
	await page.clock.install();
	await page.goto("/");
	await page.getByRole("button", { name: "Play" }).click();
	await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
	await page.clock.fastForward(1000);
	await expect(page.getByText("Day 1 of 16", { exact: true })).toBeVisible();
	await page.getByRole("button", { name: "Pause" }).click();
	await page.clock.fastForward(3000);
	await expect(page.getByText("Day 1 of 16", { exact: true })).toBeVisible();
});

test("switching sample returns to day 0", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Forward" }).click();
	await page.getByRole("combobox", { name: "Sample" }).selectOption("recovery");
	await expect(page.getByText("Day 0 of 14", { exact: true })).toBeVisible();
	await expect(page.locator("#cfd-tutorial .sheet tbody tr")).toHaveCount(14);
});
