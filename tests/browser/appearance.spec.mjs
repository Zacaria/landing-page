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
  expect(await rootValue(page, "--bg")).toBe("#f7f5ef");
  await page.evaluate(() =>
    document.documentElement.style.setProperty("--bg", "red"),
  );
  expect(await rootValue(page, "--bg")).toBe("#f7f5ef");
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  expect(await rootValue(page, "--bg")).toBe("#0b0b0c");
  await page.getByRole("button", { name: "Auto: follow device theme" }).click();
  await page.emulateMedia({ colorScheme: "light" });
  expect(await rootValue(page, "--bg")).toBe("#f7f5ef");
  await page.unroute("**/api/appearance?target=site");
  await page.route("**/api/appearance?target=site", (route) =>
    route.fulfill({
      contentType: "text/css",
      body: appearanceCss({ theme: "vercel", band: "contrast", type: "geist" }),
    }),
  );
  await page.reload();
  expect(await rootValue(page, "--bg")).toBe("oklch(0.99 0 0)");
  expect(
    await page
      .locator("h1")
      .evaluate((node) => getComputedStyle(node).fontFamily),
  ).toContain("Geist Sans");
});

test("CV CSS is screen-only and Auto works without reader JS", async ({
  page,
}) => {
  await page.goto("/");
  await page.setContent(
    '<style>:root{--resume-paper:papayawhip;--resume-serif:Georgia;--bg:orange}</style><body class="resume-app"><h1>CV print baseline</h1></body>',
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
  expect(await rootValue(page, "--bg")).toBe("orange");
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
      expect(await rootValue(page, "--bg")).toBe(palette[mode].background);
      expect(
        await page.evaluate(() =>
          CSS.supports(
            "color",
            getComputedStyle(document.documentElement).getPropertyValue("--fg"),
          ),
        ),
      ).toBe(true);
    }
    await style.evaluate((node) => node.remove());
  }
});
