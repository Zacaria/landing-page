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
    await expect(
      page.locator("#no-articles, #posts, #search, #topics"),
    ).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Zacaria Chtatar",
    );
    await expect(
      page.locator("header a[href='https://cv.havesomecode.io/']"),
    ).toBeVisible();
    const sections = await page
      .locator("main > section")
      .evaluateAll((els) => els.map((el) => el.id));
    expect(sections).toEqual(["about", "projects", "speaking", "contact"]);
    await expect(page.locator("#speaking h2")).toHaveText("Talks & learning");
    await expect(page.locator("#speaking .post")).toHaveCount(3);
    await expect(page.locator("#speaking .section-label")).toHaveText(
      "HaveSome…",
    );
    for (const href of [
      "https://havesomecode.github.io/havesome-oidc/",
      "https://zacaria.github.io/havesome-worktrees/",
      "https://www.youtube.com/watch?v=eSo3e3ugn5g",
      "https://havesome-rust-apidays.surge.sh/",
      "https://github.com/Zacaria/zacaria#links",
    ])
      await expect(page.locator(`#speaking a[href="${href}"]`)).toHaveCount(1);
    for (const href of [
      "https://zacaria.github.io/float/",
      "https://pathfinding-client.vercel.app/",
      "https://havesomecode.github.io/kibana-mcp-server/",
    ])
      await expect(page.locator(`a[href="${href}"]`)).toHaveCount(1);
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
    expect(before.font).toContain("Geist");
    expect(before.font).not.toContain("Geist Mono");
    for (const label of ["Projects", "About", "Contact"]) {
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
    await page.locator("#speaking").screenshot({
      path: `${captures}/learning-dark-${width}.png`,
    });
    await page.getByRole("button", { name: "Light", exact: true }).click();
    await page.screenshot({
      path: `${captures}/home-light-${width}.png`,
      fullPage: true,
    });
    await page.locator("#speaking").screenshot({
      path: `${captures}/learning-light-${width}.png`,
    });
    expect(errors).toEqual([]);
    expect(
      requests.every((url) => url.startsWith("http://127.0.0.1:8793")),
    ).toBeTruthy();
  });
}
test("Uncommon identity uses editorial serif, below-hero navigation and local fonts", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.fonts.load('700 16px "Geist"'));
  for (const mode of ["light", "dark"]) {
    await page.locator(`.theme-choice[data-mode="${mode}"]`).click();
    const style = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        background: root.getPropertyValue("--background").trim(),
        accent: root.getPropertyValue("--accent").trim(),
        nameFont: getComputedStyle(document.querySelector("h1")).fontFamily,
        navFont: getComputedStyle(document.querySelector("nav")).fontFamily,
        navTop: document.querySelector(".topline").getBoundingClientRect().top,
        heroBottom: document.querySelector(".hero").getBoundingClientRect()
          .bottom,
        marker: getComputedStyle(document.querySelector("main h2"), "::before")
          .content,
        fonts: [
          document.fonts.check('16px "Geist"'),
          document.fonts.check('700 16px "Geist"'),
          document.fonts.check('16px "Instrument Serif"'),
          document.fonts.check('italic 16px "Instrument Serif"'),
        ],
      };
    });
    expect(style.background).toBe(mode === "light" ? "#f7f5ef" : "#0b0b0c");
    expect(style.accent).toBe(mode === "light" ? "#4b5e12" : "#d4ff4f");
    expect(style.nameFont).toContain("Instrument Serif");
    expect(style.nameFont).not.toContain("Mono");
    expect(style.navFont).toContain("Geist Mono");
    expect(style.marker).toContain("section");
    expect(style.fonts).toEqual([true, true, true, true]);
    expect(style.navTop).toBeGreaterThanOrEqual(style.heroBottom - 1);
  }
});
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
  await expect(page.locator("#about")).toBeVisible();
  await expect(page.locator("#posts, #search, #topics")).toHaveCount(0);
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
