import { expect, test } from "@playwright/test";

test("input lab receives canvas pointer events", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("canvas");
  await canvas.click({ position: { x: 400, y: 540 } });
  await expect(page.locator("#status")).toContainText("hotbar:");
});
