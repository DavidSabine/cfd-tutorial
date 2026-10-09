import { expect, type Page, test } from "@playwright/test";

/** ViewBox percent. Matches the plot inset in render-chart.ts. */
const LEFT = 8;
const RIGHT = 98;
const DAYS = 16;

async function stepTo(page: Page, day: number): Promise<void> {
	for (let step = 0; step < day; step += 1) {
		await page.getByRole("button", { name: "Forward" }).click();
	}
	await expect(page.getByText(`Day ${day} of ${DAYS}`, { exact: true })).toBeVisible();
}

async function columnPoint(page: Page, day: number): Promise<{ x: number; y: number }> {
	const box = await page.locator("#cfd-tutorial .plot").boundingBox();
	if (box === null) {
		throw new Error("CFD plot has no box");
	}
	const slot = (RIGHT - LEFT) / DAYS;
	const viewX = LEFT + (day - 0.5) * slot;
	return { x: box.x + (viewX / 100) * box.width, y: box.y + box.height * 0.5 };
}

async function back(page: Page): Promise<void> {
	await page.getByRole("button", { name: "Back", exact: true }).click();
}

async function mouseDrag(page: Page, fromDay: number, toDay: number): Promise<void> {
	const from = await columnPoint(page, fromDay);
	const to = await columnPoint(page, toDay);
	await page.mouse.move(from.x, from.y);
	await page.mouse.down();
	await page.mouse.move(to.x, to.y, { steps: 8 });
	await page.mouse.up();
}

test("commits four lines with WIP on the earlier day", async ({ page }) => {
	await page.goto("/");
	await stepTo(page, 9);
	const chart = page.getByRole("region", { name: "Cumulative flow diagram" });
	await mouseDrag(page, 4, 6);
	for (const name of ["arrivalRate", "departureRate", "wip", "approximateCycleTime"]) {
		await expect(chart.locator(`[data-littles="${name}"]`)).toHaveCount(1);
	}
	await expect(chart.locator('[data-littles="wip"]')).toHaveAttribute("data-day", "4");
	await expect(chart.locator("[data-preview]")).toHaveCount(0);
	await expect(chart.locator('[data-littles="approximateCycleTime"]')).not.toHaveAttribute(
		"data-open",
		"true",
	);
});

test("a leftward drag keeps the earlier day as the WIP day", async ({ page }) => {
	await page.goto("/");
	await stepTo(page, 9);
	const chart = page.getByRole("region", { name: "Cumulative flow diagram" });
	await mouseDrag(page, 6, 4);
	await expect(chart.locator('[data-littles="wip"]')).toHaveAttribute("data-day", "4");
});

test("draws nothing when only two days are visible", async ({ page }) => {
	await page.goto("/");
	await stepTo(page, 2);
	const chart = page.getByRole("region", { name: "Cumulative flow diagram" });
	await mouseDrag(page, 1, 2);
	await expect(chart.locator("[data-littles]")).toHaveCount(0);
});

test("a chart click clears the lines and still glows the band", async ({ page }) => {
	await page.goto("/");
	await stepTo(page, 9);
	const chart = page.getByRole("region", { name: "Cumulative flow diagram" });
	await mouseDrag(page, 4, 6);
	await chart.getByRole("button", { name: "Backlog day 4" }).click();
	await expect(chart.locator("[data-littles]")).toHaveCount(0);
	await expect(
		page.getByRole("region", { name: "Kanban board" }).getByRole("group", { name: "Backlog" }),
	).toHaveClass(/is-selected/);
});

test("Escape clears the lines", async ({ page }) => {
	await page.goto("/");
	await stepTo(page, 9);
	const chart = page.getByRole("region", { name: "Cumulative flow diagram" });
	await mouseDrag(page, 4, 6);
	await page.keyboard.press("Escape");
	await expect(chart.locator("[data-littles]")).toHaveCount(0);
});

test("a touch drag commits the same lines", async ({ page }) => {
	await page.goto("/");
	await stepTo(page, 9);
	const from = await columnPoint(page, 4);
	const to = await columnPoint(page, 6);
	await page.evaluate(({ from, to }) => {
		const downTarget = document.elementFromPoint(from.x, from.y);
		const chart = document.querySelector("[aria-label='Cumulative flow diagram']");
		if (downTarget === null || chart === null) {
			throw new Error("no chart point");
		}
		const base = {
			bubbles: true,
			cancelable: true,
			pointerId: 1,
			pointerType: "touch",
			isPrimary: true,
		};
		downTarget.dispatchEvent(
			new PointerEvent("pointerdown", {
				...base,
				clientX: from.x,
				clientY: from.y,
				button: 0,
				buttons: 1,
			}),
		);
		downTarget.dispatchEvent(
			new PointerEvent("pointermove", {
				...base,
				clientX: to.x,
				clientY: to.y,
				button: 0,
				buttons: 1,
			}),
		);
		// The preview replaces the SVG that received the move, so the release
		// arrives on the chart section that captured the pointer.
		chart.dispatchEvent(
			new PointerEvent("pointerup", {
				...base,
				clientX: to.x,
				clientY: to.y,
				button: 0,
				buttons: 0,
			}),
		);
	}, { from, to });
	const chart = page.getByRole("region", { name: "Cumulative flow diagram" });
	await expect(chart.locator('[data-littles="arrivalRate"]')).toHaveCount(1);
	await expect(chart.locator('[data-littles="wip"]')).toHaveAttribute("data-day", "4");
	await expect(chart.locator("[data-preview]")).toHaveCount(0);
});

test("playback and hide done keep the dragged days", async ({ page }) => {
	await page.goto("/");
	await stepTo(page, 8);
	const chart = page.getByRole("region", { name: "Cumulative flow diagram" });
	await mouseDrag(page, 4, 6);
	const cycle = chart.locator('[data-littles="approximateCycleTime"]');
	await expect(cycle).not.toHaveAttribute("data-open", "true");
	await expect(cycle).toHaveAttribute("data-through-day", "8");

	await back(page);
	await back(page);
	await expect(page.getByText("Day 6 of 16", { exact: true })).toBeVisible();
	await expect(cycle).toHaveAttribute("data-open", "true");
	await expect(cycle).toHaveAttribute("data-through-day", "6");
	await page.getByRole("button", { name: "Forward" }).click();
	await page.getByRole("button", { name: "Forward" }).click();
	await expect(cycle).not.toHaveAttribute("data-open", "true");
	await expect(cycle).toHaveAttribute("data-through-day", "8");

	await back(page);
	await back(page);
	await back(page);
	await expect(page.getByText("Day 5 of 16", { exact: true })).toBeVisible();
	await expect(chart.locator('[data-littles="arrivalRate"]')).toHaveCount(0);
	await expect(chart.locator('[data-littles="departureRate"]')).toHaveCount(0);
	await expect(chart.locator('[data-littles="wip"]')).toHaveCount(1);
	await page.getByRole("button", { name: "Forward" }).click();
	await expect(chart.locator('[data-littles="arrivalRate"]')).toHaveCount(1);
	await expect(chart.locator('[data-littles="departureRate"]')).toHaveCount(1);

	await page.getByRole("button", { name: "Reset" }).click();
	await expect(chart.locator("[data-littles]")).toHaveCount(0);
	await stepTo(page, 6);
	await expect(chart.locator('[data-littles="arrivalRate"]')).toHaveCount(1);
	await expect(chart.locator('[data-littles="departureRate"]')).toHaveCount(1);
	await expect(chart.locator('[data-littles="wip"]')).toHaveCount(1);
	await page.getByRole("button", { name: "Forward" }).click();
	await page.getByRole("button", { name: "Forward" }).click();
	await expect(cycle).toHaveAttribute("data-through-day", "8");
	await page.getByRole("checkbox", { name: "Hide done" }).check();
	await expect(chart.locator("[data-littles]")).toHaveCount(0);
	await page.getByRole("checkbox", { name: "Hide done" }).uncheck();
	await expect(chart.locator('[data-littles="departureRate"]')).toHaveCount(1);
	await expect(cycle).not.toHaveAttribute("data-open", "true");
	await expect(cycle).toHaveAttribute("data-through-day", "8");
});
