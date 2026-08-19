import { expect, test } from "@playwright/test";

test("playground consumes the public package", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#status")).toContainText("v0.1.0");
  await expect(page.locator("canvas")).toBeVisible();
});
