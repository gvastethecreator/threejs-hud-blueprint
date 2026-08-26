import { expect, test } from "@playwright/test";

test("playground chrome names controls and has no favicon 404", async ({ page }) => {
  const missing: string[] = [];
  page.on("response", (response) => {
    if (response.url().endsWith("/favicon.ico") && response.status() === 404) {
      missing.push(response.url());
    }
  });
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  const status = page.locator("#status");
  await expect(status).toContainText("v0.1.0");
  await expect(status).toContainText("package:");
  await expect(status).toContainText("CLICK LOOK");
  await expect(status).toContainText("F");
  await expect(status).toContainText("1-6");
  await expect(status).toContainText("health + ammo + inventory + hotbar");
  expect(pageErrors).toEqual([]);
  expect(missing).toEqual([]);
});

test("webgpu playground does not submit ShaderMaterial", async ({ page }) => {
  const shaderErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("ShaderMaterial")) {
      shaderErrors.push(message.text());
    }
  });
  await page.goto("/?webgpu=1");
  await expect(page.locator("#status")).toContainText("webgpu");
  await expect(page.locator("canvas")).toBeVisible();
  expect(shaderErrors, shaderErrors.join("\n")).toEqual([]);
});

test("compact 390x844 keeps the compass inside the canvas", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  const box = await page.evaluate(() => {
    const host = (globalThis as { __PLAYGROUND__?: { boxes: () => Record<string, { x: number; y: number; w: number; h: number; v: boolean }> } }).__PLAYGROUND__;
    const compass = host?.boxes().compass;
    const width = Math.max(1, document.documentElement.clientWidth);
    const height = Math.max(1, document.documentElement.clientHeight);
    return { compass, width, height };
  });
  expect(box.compass).toBeTruthy();
  if (!box.compass || !box.compass.v) return;
  expect(box.compass.x).toBeGreaterThanOrEqual(0);
  expect(box.compass.y).toBeGreaterThanOrEqual(0);
  expect(box.compass.x + box.compass.w).toBeLessThanOrEqual(box.width + 1);
  expect(box.compass.y + box.compass.h).toBeLessThanOrEqual(box.height + 1);
});
