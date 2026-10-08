import { expect, test } from "@playwright/test";

test("overlays Little's law through the playhead", async ({ page }) => {
	await page.goto("/");
	const chart = page.getByRole("region", { name: "Cumulative flow diagram" });
	await expect(chart.getByText(/Mean WIP/)).toHaveCount(0);

	for (let step = 0; step < 4; step += 1) {
		await page.getByRole("button", { name: "Forward" }).click();
	}
	await page.getByRole("checkbox", { name: "Little's law" }).check();
	await expect(chart.getByText("Mean WIP 3.25 · Throughput 0.25/day · Cycle time 13 days")).toBeVisible();
	await expect(chart.locator('[data-law="wip"]')).toHaveCount(1);
	await expect(chart.locator('[data-law="cycle"]')).toHaveCount(1);

	await page.getByRole("checkbox", { name: "Little's law" }).uncheck();
	await expect(chart.locator('[data-law="wip"]')).toHaveCount(0);
	await expect(chart.getByText(/Mean WIP/)).toHaveCount(0);
});
