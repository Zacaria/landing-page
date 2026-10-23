import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { test, expect } from "@playwright/test";
import { createAppearanceHandler } from "../../api/appearance.mjs";
import { DEFAULT_APPEARANCE } from "../../scripts/appearance.mjs";

// Real browser/HTTP caching, synthetic SQL transport only. No provider access.
async function fixture({ failFirst = false } = {}) {
  let reads = 0;
  const document = JSON.stringify({
    site: DEFAULT_APPEARANCE,
    cv: DEFAULT_APPEARANCE,
  });
  const version = createHash("sha256").update(document).digest("hex");
  const handler = createAppearanceHandler({
    env: {
      HSC_APPEARANCE_DATABASE_URL:
        "postgresql://reader:synthetic-password@ep-cache-test.eu-central-1.aws.neon.tech/neondb?sslmode=require",
    },
    fetch: async () => {
      reads++;
      if (failFirst && reads === 1) return new Response(null, { status: 503 });
      return new Response(JSON.stringify({ rows: [[version, document]] }));
    },
  });
  const server = createServer((req, res) => {
    if (req.url.startsWith("/api/appearance")) return void handler(req, res);
    if (req.url.startsWith("/assets/fonts/")) {
      res.writeHead(404);
      return res.end();
    }
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "no-store");
    res.end(
      '<!doctype html><head><link rel="stylesheet" href="/api/appearance?target=site"></head><body><h1>Cache verification</h1></body>',
    );
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    reads: () => reads,
    async close() {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

test("selected CSS is reused across navigations without another SQL read", async ({
  page,
}) => {
  const app = await fixture();
  try {
    await page.goto(`${app.url}/first`);
    expect(app.reads()).toBe(1);
    await page.goto(`${app.url}/second`);
    expect(app.reads()).toBe(1);
    const transferSize = await page.evaluate(
      () =>
        performance
          .getEntriesByType("resource")
          .find((entry) => entry.name.includes("/api/appearance"))
          ?.transferSize,
    );
    expect(transferSize).toBe(0);
  } finally {
    await app.close();
  }
});

test("an outage fallback is not cached as the selected appearance", async ({
  page,
}) => {
  const app = await fixture({ failFirst: true });
  try {
    const statuses = [];
    page.on("response", (response) => {
      if (response.url().includes("/api/appearance"))
        statuses.push(response.headers()["x-appearance-status"]);
    });
    await page.goto(`${app.url}/first`);
    await page.goto(`${app.url}/second`);
    expect(app.reads()).toBe(2);
    expect(statuses).toEqual(["fallback", "selected"]);
  } finally {
    await app.close();
  }
});
