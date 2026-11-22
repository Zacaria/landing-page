import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const captures = ".local/captures";
test.beforeAll(async () => {
  await mkdir(captures, { recursive: true });
});
for (const width of [1440, 768, 390, 320]) {
  test(`published site, all navigation and no overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const requests = [];
    page.on("request", (r) => requests.push(r.url()));
    await page.goto("/");
    await expect(page.locator("#no-articles, #topics")).toHaveCount(0);
    await expect(page.locator("#posts .post[data-search]")).toHaveCount(3);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Six assistants.En marche, ici.",
    );
    await expect(
      page.locator(".hero a", { hasText: "Discutons de votre projet" }),
    ).toBeInViewport();
    await expect(page.locator(".card")).toHaveCount(6);
    await expect(page.locator('.hero a[href="#contact"]')).toBeVisible();
    await expect(page.locator('.demo-visual[role="img"]')).toHaveCount(6);
    const sections = await page
      .locator("main > section")
      .evaluateAll((els) => els.map((el) => el.id));
    expect(sections).toEqual([
      "assistants",
      "about",
      "contact",
      "suivre",
      "projects",
      "speaking",
      "posts",
    ]);
    await expect(page.locator("#speaking h2")).toHaveText(
      "Conférences & apprentissage",
    );
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
    for (const [label, id] of [
      ["Assistants", "assistants"],
      ["Projets", "projects"],
      ["À propos", "about"],
      ["Contact", "contact"],
    ]) {
      const link = page
        .getByRole("navigation", { name: "Navigation principale" })
        .getByRole("link", { name: `[ ${label.toUpperCase()} ]`, exact: true });
      await link.click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
    }
    await page
      .getByRole("navigation", { name: "Navigation principale" })
      .getByRole("link", { name: "[ BLOG ]", exact: true })
      .click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Blog");
    await expect(page.locator(".blog-index .post")).toHaveCount(3);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await page.screenshot({
      path: `${captures}/blog-${width}.png`,
      fullPage: true,
    });
    await page.locator(".blog-index .post a").first().click();
    await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+$/);
    await expect(page.locator(".article-body p").first()).toBeVisible();
    await page.screenshot({
      path: `${captures}/article-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("link", { name: "← Toutes les notes" }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await page.goto("/");
    await page.getByRole("button", { name: "Sombre", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.screenshot({
      path: `${captures}/home-dark-${width}.png`,
      fullPage: true,
    });
    await page.locator("#speaking").screenshot({
      path: `${captures}/learning-dark-${width}.png`,
    });
    await page.getByRole("button", { name: "Clair", exact: true }).click();
    await page.screenshot({
      path: `${captures}/home-light-${width}.png`,
      fullPage: true,
    });
    await page.locator("#speaking").screenshot({
      path: `${captures}/learning-light-${width}.png`,
    });
    expect(errors).toEqual([]);
    expect(
      // The Cloudflare Web Analytics beacon is the one intended third party.
      requests.every(
        (url) =>
          url.startsWith("http://127.0.0.1:8793") ||
          url.startsWith("https://static.cloudflareinsights.com/"),
      ),
    ).toBeTruthy();
  });
}
test("Uncommon identity uses editorial serif, below-hero navigation and local fonts", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() =>
    Promise.all([
      document.fonts.load('700 16px "Geist"'),
      document.fonts.load('italic 16px "Instrument Serif"'),
    ]),
  );
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
    expect(style.marker).toBe("none");
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
    page.getByRole("button", { name: "Sombre", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const light = page.getByRole("button", { name: "Clair", exact: true });
  await light.focus();
  await page.keyboard.press("Enter");
  await expect(light).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Sombre", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Auto : suivre le thème de l’appareil" })
    .click();
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
    page.getByRole("link", { name: "Aller au contenu" }),
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
  await page.getByRole("button", { name: "Sombre", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
test("synthetic published fixtures: search, topics, reset, article route and SEO", async ({
  page,
}) => {
  await page.goto("/fixture/");
  const rows = page.locator(".post[data-search]:visible");
  await expect(rows).toHaveCount(2);
  await page
    .getByRole("searchbox", { name: "Rechercher dans les notes" })
    .fill("renderer");
  await expect(rows).toHaveCount(1);
  await expect(page.locator("#result-count")).toHaveText("1 note trouvée");
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
  await page.getByRole("button", { name: "Sombre", exact: true }).click();
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
    "APERÇU PRIVÉ · Non publié",
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
  await expect(page.locator(".card")).toHaveCount(6);
  await expect(page.locator(".bin b")).toHaveText(["3", "2", "1"]);
  await expect(page.locator(".toast")).toContainText("demain");
  await expect(page.locator('[data-demo="prix"] .st')).toHaveText([
    "validé ✓",
    "validé ✓",
    "validé ✓",
    "validé ✓",
    "inchangé",
  ]);
  await expect(page.locator('[data-demo="matin"] .mail')).toContainText(
    "Facture F002 · Garage des Tilleuls · 3 j",
  );
  await expect(page.locator("#about")).toBeVisible();
  await expect(page.locator("#topics")).toHaveCount(0);
  await expect(page.locator('a[href="/blog"]').first()).toBeVisible();
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

test("specimens retain static states with reduced motion and replay", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:8793/");
  await page.locator(".restart").first().click();
  await expect(page.locator(".bin b")).toHaveText(["3", "2", "1"]);
  await expect(page.locator(".toast")).toContainText("demain");
  await expect(page.locator('[data-demo="prix"] .st')).toHaveText([
    "validé ✓",
    "validé ✓",
    "validé ✓",
    "validé ✓",
    "inchangé",
  ]);
  await expect(page.locator('[data-demo="matin"] .mail')).toContainText(
    "Facture F002 · Garage des Tilleuls · 3 j",
  );
  await context.close();
});

test("live specimens replay and restore their static state offscreen", async ({
  page,
}) => {
  await page.goto("/");
  const card = page.locator('[data-demo="tri"]');
  await card.scrollIntoViewIfNeeded();
  await card.locator(".restart").click();
  await expect(card.locator(".envelope")).toBeVisible();
  await expect(card.locator(".bin b").first()).not.toHaveText("3");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(card.locator(".bin b")).toHaveText(["3", "2", "1"]);
  await expect(card.locator(".envelope")).toHaveCount(0);
});

test("morning typing and price approvals replay in sequence", async ({
  page,
}) => {
  await page.goto("/");
  const morning = page.locator('[data-demo="matin"]');
  await morning.scrollIntoViewIfNeeded();
  await morning.locator(".restart").click();
  await expect(morning.locator(".caret")).toBeVisible();
  await expect(morning.locator(".mail-entry").first()).toBeHidden();
  await expect(morning.locator(".subject")).toHaveText(
    "Point du matin du 11/05 : 2 avancés, 3 à décider, 1 en retard",
  );
  await expect(morning.locator(".mail-entry")).toHaveText([
    "· Devis D001 · Boulangerie Lefort → à valider",
    "· Nouveau : devis D013 · Pâtisserie du Moulin",
    "· Devis D004 · Atelier des Saules · 13/05",
    "· Remise D013 · 22/05",
    "· Facture F002 · Garage des Tilleuls · 3 j",
  ]);
  await expect(morning.locator(".mail-entry").last()).toBeVisible();
  const price = page.locator('[data-demo="prix"]');
  await price.scrollIntoViewIfNeeded();
  await price.locator(".restart").click();
  await expect(price.locator(".st")).toHaveText(Array(5).fill("en attente"));
  await expect(price.locator(".st").nth(1)).toHaveText("baisse · à valider");
  await expect(price.locator(".st").first()).toHaveText("hausse · à valider");
  await expect(price.locator(".st")).toHaveText([
    "validé ✓",
    "validé ✓",
    "validé ✓",
    "validé ✓",
    "inchangé",
  ]);
  await expect(price.locator(".st.ok")).toHaveCount(4);
});

test("new specimens replay and restore offscreen", async ({ page }) => {
  await page.goto("/");
  const veille = page.locator('[data-demo="veille"]');
  await veille.scrollIntoViewIfNeeded();
  await veille.locator(".restart").click();
  await expect(veille.locator(".candidate")).toHaveCount(10);
  await expect(veille.locator(".veille-row")).toHaveCount(4, { timeout: 5000 });
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(veille.locator(".veille-row")).toHaveCount(4);
  const mails = page.locator('[data-demo="mails"]');
  await mails.scrollIntoViewIfNeeded();
  await mails.locator(".restart").click();
  await expect(mails.locator(".draft p")).toHaveText("");
  await expect(mails.locator(".draft p")).toContainText("Zacaria", {
    timeout: 6000,
  });
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(mails.locator(".inbox-chip")).toHaveCount(6);
  await expect(mails.locator(".draft p")).toContainText("Zacaria");
});
for (const width of [1280, 390, 320])
  test(`offers responsive and reduced motion ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/offres");
    await expect(page.locator("[data-offer-visual]")).toHaveCount(4);
    await expect(page.locator(".offer-reveal")).toHaveCount(13);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 390) {
      const boxes = await page.locator(".offer-sheet").evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom };
        }),
      );
      for (let i = 1; i < boxes.length; i++)
        expect(boxes[i].top).toBeGreaterThanOrEqual(boxes[i - 1].bottom);
    }
    expect(errors).toEqual([]);
  });

test("offers animate once and preserve complete no-JavaScript visuals", async ({
  page,
  browser,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/offres");
  await page.locator("#tri-des-demandes").scrollIntoViewIfNeeded();
  await expect(page.locator(".sort-inbox")).toBeVisible();
  await expect(page.locator(".sort-inbox")).toHaveCount(0, { timeout: 4000 });
  await page.locator("#rappel-echeances").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  expect(errors).toEqual([]);
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 800 },
  });
  const staticPage = await context.newPage();
  await staticPage.goto("http://127.0.0.1:8793/offres");
  await expect(staticPage.locator(".sort-column")).toHaveCount(4);
  await expect(staticPage.locator(".offer-ad")).toHaveCount(3);
  await expect(staticPage.locator(".offer-timeline")).toContainText(
    "la veille",
  );
  await expect(staticPage.locator(".offer-message").first()).toContainText(
    "En retard",
  );
  await context.close();
});
