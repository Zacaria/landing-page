import test from "node:test";
import assert from "node:assert/strict";

import { readFile } from "node:fs/promises";
import { renderIndex, renderArticle } from "../scripts/render.mjs";
import { fixture } from "./fixtures.mjs";

const defaults = { theme: "teknium", band: "soft", type: "uncommon" };
const settings = {
  site: defaults,
  cv: { theme: "vercel", band: "contrast", type: "geist" },
};
const response = (data) => new Response(JSON.stringify(data));
async function request(
  fetch,
  url = "/api/appearance?target=site",
  method = "GET",
  extra = {},
) {
  const { createAppearanceHandler } = await import("../api/appearance.mjs");
  const headers = {};
  const result = {
    headers,
    statusCode: 200,
    setHeader(k, v) {
      headers[k] = v;
    },
    end(body) {
      this.body = body ?? "";
    },
  };
  await createAppearanceHandler({ fetch, ...extra })({ url, method }, result);
  return result;
}

test("initial published settings are actual Teknium defaults for both consumers", async () => {
  const initial = JSON.parse(await readFile("content/appearance.json", "utf8"));
  assert.deepEqual(initial, { site: defaults, cv: defaults });
  const { appearanceCss } = await import("../scripts/appearance.mjs");
  for (const target of ["site", "cv"]) {
    const result = await request(
      async () => response(initial),
      `/api/appearance?target=${target}`,
    );
    assert.equal(result.body, appearanceCss(defaults, target));
    assert.equal(result.headers["X-Appearance-Status"], "selected");
  }
});

test("invalid, unknown and malicious choices/targets fail closed", async () => {
  const { appearanceCss } = await import("../scripts/appearance.mjs");
  for (const bad of [
    null,
    {},
    [],
    { ...defaults, mode: "dark" },
    { ...defaults, theme: "__proto__" },
    { ...defaults, theme: "teknium;}</style>" },
    { ...defaults, band: "url(https://evil.test)" },
    { ...defaults, type: "serif" },
  ]) {
    assert.throws(() => appearanceCss(bad), /Invalid appearance choice/);
  }
  assert.throws(
    () => appearanceCss(defaults, "site{}"),
    /Invalid appearance target/,
  );
});

test("raw transport is fixed, cache-busted and selection changes on next request", async () => {
  const { appearanceCss } = await import("../scripts/appearance.mjs");
  const calls = [];
  let selected = settings;
  let clock = 100;
  const fetch = async (url, options) => {
    calls.push([url, options]);
    return response(selected);
  };
  const first = await request(fetch, undefined, undefined, {
    now: () => clock++,
  });
  assert.equal(first.body, appearanceCss(settings.site));
  selected = { ...settings, site: settings.cv };
  const second = await request(fetch, undefined, undefined, {
    now: () => clock++,
  });
  assert.equal(second.body, appearanceCss(settings.cv));
  assert.notEqual(first.body, second.body);
  assert.equal(first.headers["Cache-Control"], "no-store");
  assert.equal(first.headers["Access-Control-Allow-Origin"], "*");
  assert.equal(first.headers["Access-Control-Allow-Credentials"], undefined);
  assert.equal(first.headers["X-Appearance-Status"], "selected");
  assert.equal(
    calls[0][0],
    "https://raw.githubusercontent.com/Zacaria/landing-page/master/content/appearance.json?t=100",
  );
  assert.notEqual(calls[0][0], calls[1][0]);
  assert.equal(calls[0][1].redirect, "error");
  assert.equal(calls[0][1].credentials, "omit");
  assert.equal(calls[0][1].cache, "no-store");
  assert.ok(calls[0][1].signal instanceof AbortSignal);
  const cv = await request(
    fetch,
    "/api/appearance?target=cv&url=https://evil.test",
  );
  assert.equal(cv.body, appearanceCss(settings.cv, "cv"));
  assert.doesNotMatch(cv.body, /--bg:/);
  const head = await request(fetch, undefined, "HEAD");
  assert.equal(head.body, "");
  assert.equal(head.headers["Content-Type"], "text/css; charset=utf-8");
});

test("outages, missing initial file and timed out transport return explicit default CSS", async () => {
  const { appearanceCss } = await import("../scripts/appearance.mjs");
  for (const fetch of [
    async () => {
      throw Error("offline");
    },
    async () => new Response("missing", { status: 404 }),
    () => new Promise(() => {}),
  ]) {
    const result = await request(fetch, undefined, undefined, {
      timeoutMs: 10,
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.headers["X-Appearance-Status"], "fallback");
    assert.equal(result.body, appearanceCss(defaults));
  }
});

test("invalid target/method never fetch and malformed settings never silently fallback", async () => {
  const forbidden = () => {
    assert.fail("unexpected fetch");
  };
  for (const query of [
    "target=oops",
    "target=site&target=cv",
    "target=site%7B%7D",
  ]) {
    assert.equal(
      (await request(forbidden, `/api/appearance?${query}`)).statusCode,
      400,
    );
  }
  assert.equal((await request(forbidden, undefined, "POST")).statusCode, 405);
  for (const raw of [
    {},
    { ...settings, mode: "dark" },
    { ...settings, cv: { ...defaults, theme: "unknown" } },
    { ...settings, site: { ...defaults, mode: "dark" } },
  ]) {
    const result = await request(async () => response(raw));
    assert.equal(result.statusCode, 502);
    assert.equal(result.headers["X-Appearance-Status"], "invalid-settings");
    assert.doesNotMatch(result.body, /--bg:/);
  }
  for (const fetch of [
    async () => new Response("not json"),
    async () => new Response("x".repeat(8193)),
    async () => new Response("{}", { headers: { "Content-Length": "8193" } }),
  ]) {
    assert.equal((await request(fetch)).statusCode, 502);
  }
});

test("rendered public HTML has ordered render-blocking first-paint fallback and dynamic CSS", async () => {
  const s = fixture();
  for (const html of [renderIndex(s), renderArticle(s.articles[0], s)]) {
    const staticAt = html.indexOf('href="/assets/styles.css"');
    const fallbackAt = html.indexOf(
      'rel="stylesheet" href="/appearance-fallback.css"',
    );
    const dynamicAt = html.indexOf(
      'rel="stylesheet" href="/api/appearance?target=site"',
    );
    assert.ok(
      staticAt > 0 &&
        fallbackAt > staticAt &&
        dynamicAt > fallbackAt &&
        dynamicAt < html.indexOf("</head>"),
    );
    assert.doesNotMatch(html, /admin\.havesomecode|appearance[^>]+onload=/);
  }
  assert.doesNotMatch(renderIndex(s, { preview: true }), /\/api\/appearance/);
  const { appearanceCss } = await import("../scripts/appearance.mjs");
  assert.equal(
    await readFile("client/appearance-fallback.css", "utf8"),
    appearanceCss(defaults),
  );
});
test("approved choices generate isolated site/CV screen CSS and reader modes", async () => {
  const { appearanceCss } = await import("../scripts/appearance.mjs");
  const site = appearanceCss(defaults);
  const cv = appearanceCss(defaults, "cv");
  assert.match(site, /--bg:[^;]+!important/);
  assert.match(site, /:root\[data-theme="light"\]/);
  assert.match(site, /:root\[data-theme="dark"\]/);
  assert.match(site, /prefers-color-scheme: dark/);
  assert.doesNotMatch(site, /--resume-/);
  assert.match(cv, /^@media screen\{/);
  assert.match(cv, /--resume-paper:[^;]+!important/);
  assert.match(cv, /body\.resume-app/);
  assert.doesNotMatch(cv, /--bg:|@media print/);
  assert.match(site, /Instrument Serif/);
  assert.match(
    site,
    /\/appearance-fonts\/InstrumentSerif-normal-jizBRFtNs2.woff2/,
  );
  assert.notEqual(site, appearanceCss({ ...defaults, band: "accent" }));
  assert.notEqual(site, appearanceCss({ ...defaults, band: "contrast" }));
  assert.notEqual(site, appearanceCss({ ...defaults, type: "geist" }));
});
