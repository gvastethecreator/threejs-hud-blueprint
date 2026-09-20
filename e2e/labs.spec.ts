import { expect, test } from "@playwright/test";

test("review labs share the Three.js canvas and bind controls to live nodes", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#status")).toContainText("package:");
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator("#controls-panel")).toBeHidden();
  await page.getByRole("button", { name: "Controls", exact: true }).click();
  await expect(page.locator("#controls-panel")).toBeVisible();
  await page.getByRole("button", { name: "Receive damage" }).click();
  await page
    .locator("summary")
    .filter({ hasText: /^Preset$/ })
    .click();
  await expect(page.locator("#value-output")).toHaveText("63%");
  await page.locator("#import-preset").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"schema":"wrong"}'),
  });
  await expect(page.locator("#import-result")).toHaveText("Invalid preset schema.");
  await expect(page.locator("#value-output")).toHaveText("63%");
  await page.locator("#import-preset").setInputFiles({
    name: "preset.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        schema: "three-hud-playground/v1",
        theme: "mono-dark",
        health: { value: 72, x: 0, y: 0, width: 240 },
        inventory: false,
      }),
    ),
  });
  await expect(page.locator("#value-output")).toHaveText("72%");
  const presetDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "↓ Export preset", exact: true }).click();
  expect((await presetDownload).suggestedFilename()).toBe("three-hud-preset.json");
  const pngDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "↓ PNG", exact: true }).click();
  expect((await pngDownload).suggestedFilename()).toBe("three-hud.png");
  await page.getByRole("button", { name: "Components", exact: true }).click();
  await expect(page.locator("#component-count")).toHaveText("12 / 12");
  await page.getByRole("searchbox").fill("no-such-component");
  await expect(page.locator("#component-count")).toHaveText("0 / 12");
  await page.getByRole("searchbox").fill("radial");
  await expect(page.locator("#component-count")).toHaveText("1 / 12");
  await page.getByRole("button", { name: "Scale & type", exact: true }).click();
  await page.getByLabel("Scale mode", { exact: true }).selectOption("integer");
  await page.getByLabel("Renderer DPR", { exact: true }).selectOption("2");
  await expect(page.locator("#renderer-info")).toContainText("DPR 2");
  await page.getByRole("button", { name: "Render contracts", exact: true }).click();
  await page.getByLabel("Contract", { exact: true }).selectOption("texture");
  await expect(page.locator("#contract-result")).toContainText("TEXTURE / live fixture");
  await expect(page.locator("canvas")).toHaveCount(1);
  await page.getByRole("button", { name: "Close controls", exact: true }).click();
  await expect(page.locator("#controls-panel")).toBeHidden();
  await expect(page.getByRole("button", { name: "Controls", exact: true })).toBeFocused();
});
