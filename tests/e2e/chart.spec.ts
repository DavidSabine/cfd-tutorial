import { expect, test } from "@playwright/test";

test("glows a chart band across the board and table", async ({ page }) => {
	await page.goto("/");
	const chart = page.getByRole("region", { name: "Cumulative flow diagram" });
	await page.getByRole("button", { name: "Forward" }).click();
	await page.getByRole("button", { name: "Forward" }).click();

	await chart.getByRole("button", { name: "Backlog day 2" }).click();
	await expect(page.getByText("Day 2 of 16", { exact: true })).toBeVisible();
	await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
	const board = page.getByRole("region", { name: "Kanban board" });
	await expect(board.getByRole("group", { name: "Backlog" })).toHaveClass(/is-selected/);
	await expect(page.locator("#cfd-tool tbody tr").nth(1).locator("td").nth(1)).toHaveClass(
		/cell-selected/,
	);
});

test("hide done removes the chart band and keeps the column", async ({ page }) => {
	await page.goto("/");
	const chart = page.getByRole("region", { name: "Cumulative flow diagram" });
	for (let step = 0; step < 4; step += 1) {
		await page.getByRole("button", { name: "Forward" }).click();
	}
	await expect(chart.locator('[data-state="3"]')).not.toHaveCount(0);
	await page.getByRole("checkbox", { name: "Hide done" }).check();
	await expect(chart.locator('[data-state="3"]')).toHaveCount(0);
	await expect(
		page.getByRole("region", { name: "Kanban board" }).getByRole("group", { name: "Done" }),
	).toBeVisible();
	await expect(page.getByRole("columnheader", { name: "Done" })).toBeVisible();
});
