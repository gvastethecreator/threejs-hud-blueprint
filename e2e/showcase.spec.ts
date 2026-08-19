import { expect, test } from "@playwright/test";

test("showcase paints HUD widgets over the game canvas", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#status")).toContainText("health + ammo + inventory + hotbar");
  await expect(page.locator("canvas")).toBeVisible();
  const pixels = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (!(canvas instanceof HTMLCanvasElement)) return null;
    return { width: canvas.width, height: canvas.height };
  });
  expect(pixels?.width).toBeGreaterThan(0);
});
