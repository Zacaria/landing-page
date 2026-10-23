import { test, expect } from "@playwright/test";
import {
  appearanceCss,
  DEFAULT_APPEARANCE,
} from "../../scripts/appearance.mjs";
import catalogue from "../../appearance/catalogue.json" with { type: "json" };

const rootValue = (page, name) =>
  page.evaluate(
    (key) =>
      getComputedStyle(document.documentElement).getPropertyValue(key).trim(),
    name,
  );

test("fallback first paint, inline precedence, reader Light/Dark/Auto and next selection", async ({
  page,
}) => {
  await page.route("**/api/appearance?target=site", (route) => route.abort());
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  expect(await rootValue(page, "--background")).toBe("#f7f5ef");
  await page.evaluate(() =>
    document.documentElement.style.setProperty("--background", "red"),
  );
  expect(await rootValue(page, "--background")).toBe("#f7f5ef");
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  expect(await rootValue(page, "--background")).toBe("#0b0b0c");
  await page.getByRole("button", { name: "Auto: follow device theme" }).click();
  await page.emulateMedia({ colorScheme: "light" });
  expect(await rootValue(page, "--background")).toBe("#f7f5ef");
  await page.unroute("**/api/appearance?target=site");
  await page.route("**/api/appearance?target=site", (route) =>
    route.fulfill({
      contentType: "text/css",
      body: appearanceCss({ theme: "vercel", band: "contrast", type: "geist" }),
    }),
  );
  await page.reload();
  expect(await rootValue(page, "--background")).toBe("oklch(0.99 0 0)");
  expect(
    await page
      .locator("h1")
      .evaluate((node) => getComputedStyle(node).fontFamily),
  ).toContain("Geist");
});

test("CV CSS is screen-only and Auto works without reader JS", async ({
  page,
}) => {
  await page.goto("/");
  await page.setContent(
    '<style>:root{--resume-paper:papayawhip;--resume-serif:Georgia;--background:orange}</style><body class="resume-app"><h1>CV print baseline</h1></body>',
  );
  await page.addStyleTag({ content: appearanceCss(DEFAULT_APPEARANCE, "cv") });
  await page.emulateMedia({ colorScheme: "dark" });
  expect(
    await page
      .locator("body")
      .evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--resume-paper").trim(),
      ),
  ).toBe("#0b0b0c");
  expect(await rootValue(page, "--background")).toBe("orange");
  await page.evaluate(() => (document.documentElement.dataset.theme = "light"));
  expect(
    await page
      .locator("body")
      .evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--resume-paper").trim(),
      ),
  ).toBe("#f7f5ef");
  await page.emulateMedia({ media: "print" });
  expect(await rootValue(page, "--resume-paper")).toBe("papayawhip");
  expect(await rootValue(page, "--resume-serif")).toBe("Georgia");
});

test("all approved palettes parse into effective CSS variables without extra rules", async ({
  page,
}) => {
  await page.goto("/");
  await page.setContent("<h1>Palette parser</h1>");
  for (const palette of catalogue) {
    const style = await page.addStyleTag({
      content: appearanceCss({ ...DEFAULT_APPEARANCE, theme: palette.id }),
    });
    for (const mode of ["light", "dark"]) {
      await page.evaluate(
        (value) => (document.documentElement.dataset.theme = value),
        mode,
      );
      expect(await rootValue(page, "--background")).toBe(
        palette[mode].background,
      );
      expect(
        await page.evaluate(() =>
          CSS.supports(
            "color",
            getComputedStyle(document.documentElement).getPropertyValue(
              "--foreground",
            ),
          ),
        ),
      ).toBe(true);
    }
    await style.evaluate((node) => node.remove());
  }
});

// Actual current recruiter DOM; only CSS responses are synthetic.
test("owner bands recolor the current hero without changing recruiter geometry or curation", async ({
  page,
}) => {
  let choice = { theme: "vercel", band: "soft", type: "uncommon" };
  await page.route("**/api/appearance?target=site", (route) =>
    route.fulfill({ contentType: "text/css", body: appearanceCss(choice) }),
  );
  await page.emulateMedia({ colorScheme: "light" });
  const backgrounds = [];
  let geometry;
  for (const band of ["soft", "accent", "contrast"]) {
    choice = { ...choice, band };
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const measured = await page.locator(".hero").evaluate((el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const probe = document.createElement("span");
      probe.style.color = style.getPropertyValue("--appearance-band");
      el.append(probe);
      const expected = getComputedStyle(probe).color;
      probe.remove();
      return {
        background: style.backgroundColor,
        expected,
        width: rect.width,
        height: rect.height,
        padding: style.padding,
        font: getComputedStyle(el.querySelector("h1")).fontFamily,
      };
    });
    expect(measured.background).toBe(measured.expected);
    expect(measured.font).toContain("Instrument Serif");
    const current = {
      width: measured.width,
      height: measured.height,
      padding: measured.padding,
    };
    if (geometry) expect(current).toEqual(geometry);
    geometry = current;
    backgrounds.push(measured.background);
    await expect(page.locator(".announcement, .rail")).toHaveCount(0);
    await expect(page.locator("#speaking .post")).toHaveCount(3);
    await expect(page.locator(".topline")).toBeVisible();
    await expect(page.locator(".hero h1")).toHaveText("Zacaria Chtatar");
  }
  // Vercel accent and contrast intentionally share black; soft remains distinct.
  expect(new Set(backgrounds).size).toBe(2);
});
