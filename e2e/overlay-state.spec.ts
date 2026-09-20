import { expect, test } from "@playwright/test";

test("overlay-state webgl keeps the game scene and draws HUD quads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#status")).toContainText("package:@scope/three-hud");
  await expect(page.locator("#status")).toContainText("webgl");
  await expect(page.locator("canvas")).toBeVisible();
  const sample = await sampleCanvas(page);
  expect(sample.nonBlackRatio).toBeGreaterThan(0.08);
  expect(sample.hasHudPaint).toBe(true);
  expect(sample.chromaticSamples).toBe(0);
  expect(sample.titleColors).toBe(2); // Bitmap ink and backdrop; no antialiased edge shades.
  expect(sample.wholeTexels).toBe(true); // The 14px title scales each 5x7 atlas texel by 2.
});

test("overlay-state webgpu lab boots the overlay path", async ({ page }) => {
  await page.goto("/?webgpu=1");
  await expect(page.locator("#status")).toContainText("package:@scope/three-hud");
  await expect(page.locator("#status")).toContainText("webgpu overlay-limited");
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
    let chromaticSamples = 0;
    const step = 16 * 4;
    for (let i = 0; i < pixels.length; i += step) {
      const r = pixels[i] ?? 0;
      const g = pixels[i + 1] ?? 0;
      const b = pixels[i + 2] ?? 0;
      if (r > 24 || g > 24 || b > 24) nonBlack += 1;
      if (Math.max(r, g, b) - Math.min(r, g, b) > 2) chromaticSamples++;
      const titleWhite = r > 200 && g > 200 && b > 200;
      if (titleWhite) hudHits += 1;
    }
    const title = (
      globalThis as unknown as {
        __PLAYGROUND__: { boxes(): { title: { x: number; y: number; w: number; h: number } } };
      }
    ).__PLAYGROUND__.boxes().title;
    const colors = new Set<number>();
    for (let y = Math.ceil(title.y); y < Math.floor(title.y + title.h); y++) {
      for (let x = Math.ceil(title.x); x < Math.floor(title.x + title.w); x++) {
        colors.add(pixels[(y * copy.width + x) * 4]!);
      }
    }
    const ink = Math.max(...colors);
    const runs: number[] = [];
    for (let y = Math.ceil(title.y); y < Math.floor(title.y + title.h); y++) {
      let run = 0;
      for (let x = Math.ceil(title.x); x <= Math.floor(title.x + title.w); x++) {
        if (x < Math.floor(title.x + title.w) && pixels[(y * copy.width + x) * 4] === ink) run++;
        else if (run) {
          runs.push(run);
          run = 0;
        }
      }
    }
    const samples = Math.floor(pixels.length / step);
    return {
      nonBlackRatio: samples === 0 ? 0 : nonBlack / samples,
      hasHudPaint: hudHits > 4,
      chromaticSamples,
      titleColors: colors.size,
      wholeTexels: runs.length > 0 && runs.every((run) => run % 2 === 0),
    };
  }, dataUrl);
}
