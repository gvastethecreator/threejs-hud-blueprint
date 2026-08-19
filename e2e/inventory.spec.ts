import { expect, test } from "@playwright/test";

test("inventory and hotbar are listed in the playground HUD", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#status")).toContainText("inventory + hotbar");
});
