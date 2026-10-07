import { expect, test } from "@playwright/test";

test("moves FIFO cards onto the board and glows a clicked card", async ({ page }) => {
	await page.goto("/");
	const board = page.getByRole("region", { name: "Kanban board" });
	await expect(board.getByRole("group", { name: "Backlog" })).toBeVisible();
	await expect(board.getByRole("button")).toHaveCount(0);

	await page.getByRole("button", { name: "Forward" }).click();
	await expect(board.getByRole("group", { name: "Backlog" }).getByRole("button")).toHaveCount(2);

	for (let step = 0; step < 3; step += 1) {
		await page.getByRole("button", { name: "Forward" }).click();
	}
	const card = board.getByRole("button", { name: "Card 1" });
	await expect(board.getByRole("group", { name: "Done" }).getByRole("button", { name: "Card 1" })).toBeVisible();
	await card.click();
	await expect(card).toHaveClass(/is-selected/);

	await board.getByRole("heading", { name: "Review" }).click();
	await expect(board.getByRole("group", { name: "Review" })).toHaveClass(/is-selected/);
	await expect(card).not.toHaveClass(/is-selected/);
});
