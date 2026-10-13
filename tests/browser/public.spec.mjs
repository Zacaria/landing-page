import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const captures = ".local/captures";
test.beforeAll(async () => {
  await mkdir(captures, { recursive: true });
});
for (const width of [1440, 768, 390, 320]) {
  test(`published empty site, all navigation and no overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const requests = [];
    page.on("request", (r) => requests.push(r.url()));
    await page.goto("/");
    await expect(page.locator("#no-articles")).toBeVisible();
    await expect(page.locator(".post[data-search]")).toHaveCount(0);
    await expect(page.locator("header .theme-control")).toHaveCount(0);
    await expect(page.locator("footer .theme-control")).toHaveCount(1);
    const choices = await page.locator(".theme-choice").evaluateAll((buttons) =>
      buttons.map((button) => {
        const style = getComputedStyle(button);
        const rect = button.getBoundingClientRect();
        return {
          transparent: style.backgroundColor === "rgba(0, 0, 0, 0)",
          borderless: style.borderTopWidth === "0px",
          touchTarget: rect.width >= 44 && rect.height >= 44,
        };
      }),
    );
    expect(choices).toEqual(
      Array(3).fill({ transparent: true, borderless: true, touchTarget: true }),
    );
    const before = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
      font: getComputedStyle(document.body).fontFamily,
    }));
    expect(before.sw).toBeLessThanOrEqual(before.cw);
    expect(before.font).toContain("Geist Mono");
    for (const label of [
      "Blog",
      "Projects",
      "Search",
      "Topics",
      "About",
      "Contact",
    ]) {
      const link = page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: `[ ${label.toUpperCase()} ]`, exact: true });
      await link.click();
      await expect(page).toHaveURL(
        new RegExp(`#${label === "Blog" ? "posts" : label.toLowerCase()}$`),
      );
    }
    await page.goto("/");
    await page.getByRole("button", { name: "Dark", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.screenshot({
      path: `${captures}/home-dark-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Light", exact: true }).click();
    await page.screenshot({
      path: `${captures}/home-light-${width}.png`,
      fullPage: true,
    });
    expect(errors).toEqual([]);
    expect(
      requests.every((url) => url.startsWith("http://127.0.0.1:8793")),
    ).toBeTruthy();
  });
}
test("Light/Dark persistence, Auto preference changes and keyboard controls", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("button", { name: "Auto: follow device theme" }),
  ).toHaveAttribute("aria-pressed", "true");
  const light = page.getByRole("button", { name: "Light", exact: true });
  await light.focus();
  await page.keyboard.press("Enter");
  await expect(light).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Auto: follow device theme" }).click();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
});
test("theme still works when browser storage is denied", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage denied");
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
test("synthetic published fixtures: search, topics, reset, article route and SEO", async ({
  page,
}) => {
  await page.goto("/fixture/");
  const rows = page.locator(".post[data-search]:visible");
  await expect(rows).toHaveCount(2);
  await page
    .getByRole("searchbox", { name: "Search published notes" })
    .fill("renderer");
  await expect(rows).toHaveCount(1);
  await expect(page.locator("#result-count")).toHaveText("1 matching note");
  await page.getByRole("searchbox").fill("no-match-fixture");
  await expect(rows).toHaveCount(0);
  await expect(page.locator("#no-results")).toBeVisible();
  await page.getByRole("searchbox").fill("");
  await page.locator('[data-topic-link="Rust"]').click();
  await expect(rows).toHaveCount(1);
  await expect(page.locator('[data-topic-link="Rust"]')).toHaveAttribute(
    "aria-current",
    "true",
  );
  // Reset does not fetch drafts; stays on local index with unchanged public rows.
  await page.locator("[data-all]").first().click();
  await expect(rows).toHaveCount(2);
  await expect(page.locator("#no-results")).toBeHidden();
  await page
    .locator(".post[data-search] a")
    .filter({ hasText: "Synthetic renderer fixture" })
    .click();
  await expect(page).toHaveURL(/\/blog\/test-renderer$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Synthetic renderer fixture",
  );
  await expect(page).toHaveTitle("Renderer fixture SEO");
  await expect(page.locator(".article-body script")).toHaveCount(0);
  await expect(page.locator(".article-body ul li")).toHaveCount(2);
  await expect(page.locator(".article-body pre")).toContainText(
    '<script>alert("test")</script>',
  );
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await page.screenshot({
    path: `${captures}/article-dark-desktop.png`,
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: `${captures}/article-dark-mobile.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBeTruthy();
  await page.locator('[data-topic-link="Rust"]').click();
  await expect(page).toHaveURL(/topic=Rust#posts/);
});
test("private fixture preview uses exact public body, with noindex and no publication date", async ({
  page,
}) => {
  await page.goto("/blog/test-renderer");
  const html = await page.locator(".article-body").innerHTML();
  await page.goto("/private-fixture-preview");
  await expect(page.locator("header .theme-control")).toHaveCount(0);
  await expect(page.locator("footer .theme-control")).toHaveCount(1);
  expect(await page.locator(".article-body").innerHTML()).toBe(html);
  await expect(page.locator(".preview-banner")).toHaveText(
    "PRIVATE PREVIEW · Not published",
  );
  await expect(page.locator("meta[name=robots]")).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
  await expect(page.locator(".article-meta")).toHaveCount(0);
});
test("JavaScript disabled: all useful destinations and auto-dark content remain readable", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: "dark",
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:8793/");
  await expect(page.locator("#no-articles")).toBeVisible();
  expect(
    await page
      .locator("html")
      .evaluate((el) => getComputedStyle(el).colorScheme),
  ).toBe("dark");
  await expect(
    page.locator('a[href="https://cv.havesomecode.io/"]').first(),
  ).toBeVisible();
  await context.close();
});
