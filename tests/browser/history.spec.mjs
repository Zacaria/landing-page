import { test, expect } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`historical dates without attribution at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/history-fixture");
    await expect(page.locator("#posts .post > a")).toHaveText([
      "Ordinary note",
      "Newer import",
      "Older import",
    ]);
    await expect(
      page.locator("#posts .post").last().locator(".meta time"),
    ).toHaveText("2026-03-01");
    await expect(page.locator("#posts")).not.toContainText("LinkedIn");
    await page.goto("/history-fixture/article");
    const meta = page.locator(".article-meta");
    await expect(meta.locator("a")).toHaveCount(0);
    await expect(meta).toHaveText("2026-03-01 · Rust, Safety");
    await expect(meta.locator("time")).toHaveText(["2026-03-01"]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto("/history-fixture/preview");
    await expect(page.locator(".article-meta time")).toHaveText(["2026-03-01"]);
    await expect(page.locator(".article-meta a")).toHaveCount(0);
    await expect(page.locator(".article-meta")).not.toContainText(
      "HaveSomeCode",
    );
    await expect(page.locator(".preview-banner")).toHaveText(
      "PRIVATE PREVIEW · Not published",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.locator("footer .theme-control")).toHaveCount(1);
    await expect(page.locator("header .theme-control")).toHaveCount(0);
    await page.screenshot({
      path: `.local/captures/history-preview-${width}.png`,
      fullPage: true,
    });
  });
}
