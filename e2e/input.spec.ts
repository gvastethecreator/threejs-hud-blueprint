import { expect, test } from "@playwright/test";

test("canvas hotbar consumes clicks before game pointer lock", async ({ page }) => {
  await page.goto("/#field");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect(page.locator("#status")).toContainText("slot 1");
  const hotbar = await page.evaluate(() => {
    const app = (
      globalThis as {
        __PLAYGROUND__?: {
          boxes: () => Record<string, { x: number; y: number; w: number; h: number }>;
        };
      }
    ).__PLAYGROUND__;
    return app?.boxes()["hotbar"];
  });
  if (!hotbar) throw new Error("The live HUD has no hotbar bounds.");
  await canvas.click({ position: { x: hotbar.x + hotbar.w / 4, y: hotbar.y + hotbar.h / 2 } });
  await expect(page.locator("#status")).toContainText("slot 2");
  expect(await page.evaluate(() => document.pointerLockElement === null)).toBe(true);
  await canvas.press("b");
  const inventoryVisible = () =>
    page.evaluate(() => {
      const app = (
        globalThis as { __PLAYGROUND__?: { boxes: () => Record<string, { v: boolean }> } }
      ).__PLAYGROUND__;
      return app?.boxes()["inventory"]?.v;
    });
  await expect.poll(inventoryVisible).toBe(true);
  await canvas.press("b");
  await expect.poll(inventoryVisible).toBe(false);
});
