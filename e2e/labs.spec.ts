import { expect, test } from "@playwright/test";

test("playground labs load the public package", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#status")).toContainText("package:");
  await expect(page.locator("canvas")).toBeVisible();
});
