import { test, expect } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`historical date ordering and clear attribution at ${width}px`, async ({
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
      page.locator("#posts .post").last().locator(".meta"),
    ).toContainText("2026-03-01 · LinkedIn");
    await page.goto("/history-fixture/article");
    const meta = page.locator(".article-meta");
    await expect(
      meta.getByRole("link", { name: "Originally published on LinkedIn" }),
    ).toHaveAttribute(
      "href",
      "https://www.linkedin.com/posts/example_activity-1234567890123456789-example",
    );
    await expect(meta).toContainText("Published on HaveSomeCode: 2026-10-01");
    await expect(meta.locator("time")).toHaveText(["2026-03-01", "2026-10-01"]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto("/history-fixture/preview");
    await expect(page.locator(".article-meta time")).toHaveText(["2026-03-01"]);
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
