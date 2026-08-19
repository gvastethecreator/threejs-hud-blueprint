import { expect, test } from "@playwright/test";

test("disposing the playground HUD does not throw on unload", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event("beforeunload")));
  await expect(page.locator("#status")).toBeVisible();
});
