import { expect, test } from "@playwright/test";

test("overlay-state webgl keeps the game scene and draws HUD quads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#status")).toContainText("overlay: encodeOverlayQueue");
  await expect(page.locator("#status")).toContainText("WebGLRenderer");
  await expect(page.locator("canvas")).toBeVisible();
  const sample = await sampleCanvas(page);
  expect(sample.nonBlackRatio).toBeGreaterThan(0.08);
  expect(sample.hasHudPaint).toBe(true);
});

test("overlay-state webgpu lab boots the overlay path", async ({ page }) => {
  await page.goto("/?webgpu=1");
  await expect(page.locator("#status")).toContainText("overlay: encodeOverlayQueue");
  await expect(page.locator("#status")).toContainText("WebGPURenderer");
  await expect(page.locator("canvas")).toBeVisible();
});

async function sampleCanvas(page: import("@playwright/test").Page) {
  const png = await page.locator("canvas").screenshot();
  const dataUrl = `data:image/png;base64,${png.toString("base64")}`;
  return page.evaluate(async (url) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const copy = document.createElement("canvas");
    copy.width = img.width;
    copy.height = img.height;
    const ctx = copy.getContext("2d");
    if (ctx === null) throw new Error("2d context missing");
    ctx.drawImage(img, 0, 0);
    const pixels = ctx.getImageData(0, 0, copy.width, copy.height).data;
    let nonBlack = 0;
    let hudHits = 0;
    const step = 16 * 4;
    for (let i = 0; i < pixels.length; i += step) {
      const r = pixels[i] ?? 0;
      const g = pixels[i + 1] ?? 0;
      const b = pixels[i + 2] ?? 0;
      if (r > 24 || g > 24 || b > 24) nonBlack += 1;
      const healthGreen = r < 120 && g > 180 && b < 180;
      const titleWhite = r > 200 && g > 200 && b > 200;
      if (healthGreen || titleWhite) hudHits += 1;
    }
    const samples = Math.floor(pixels.length / step);
    return {
      nonBlackRatio: samples === 0 ? 0 : nonBlack / samples,
      hasHudPaint: hudHits > 4,
    };
  }, dataUrl);
}
