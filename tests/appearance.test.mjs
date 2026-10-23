import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import { readFile } from "node:fs/promises";
import { renderIndex, renderArticle } from "../scripts/render.mjs";
import { fixture } from "./fixtures.mjs";

const defaults = { theme: "teknium", band: "soft", type: "uncommon" };
const settings = {
  site: defaults,
  cv: { theme: "vercel", band: "contrast", type: "geist" },
};
const connection =
  "postgresql://appearance_reader:synthetic-password@ep-test-unit.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const digest = (text) => createHash("sha256").update(text).digest("hex");
const rowResponse = (document) =>
  new Response(
    JSON.stringify({ rows: [[digest(document), document]], rowCount: 1 }),
  );
const response = (data) => rowResponse(JSON.stringify(data));
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
  await createAppearanceHandler({
    fetch,
    env: { HSC_APPEARANCE_DATABASE_URL: connection },
    ...extra,
  })({ url, method }, result);
  return result;
}

test("initial database settings are actual Teknium defaults for both consumers", async () => {
  const initial = { site: defaults, cv: defaults };
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

test("read-only Neon transport is fixed and selected CSS has a bounded cache", async () => {
  const { appearanceCss } = await import("../scripts/appearance.mjs");
  const calls = [];
  let selected = settings;
  const fetch = async (url, options) => {
    calls.push([url, options]);
    return response(selected);
  };
  const first = await request(fetch);
  assert.equal(first.body, appearanceCss(settings.site));
  selected = { ...settings, site: settings.cv };
  const second = await request(fetch);
  assert.equal(second.body, appearanceCss(settings.cv));
  assert.notEqual(first.body, second.body);
  assert.equal(
    first.headers["Cache-Control"],
    "public, max-age=60, s-maxage=60",
  );
  assert.equal(first.headers["Access-Control-Allow-Origin"], "*");
  assert.equal(first.headers["Access-Control-Allow-Credentials"], undefined);
  assert.equal(first.headers["X-Appearance-Status"], "selected");
  assert.equal(calls[0][0], "https://api.eu-central-1.aws.neon.tech/sql");
  assert.equal(calls[0][0], calls[1][0]);
  assert.equal(calls[0][1].method, "POST");
  assert.equal(calls[0][1].headers["Neon-Connection-String"], connection);
  assert.equal(calls[0][1].headers["Neon-Array-Mode"], "true");
  assert.equal(calls[0][1].headers["Neon-Raw-Text-Output"], "true");
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    query:
      "SELECT version, document FROM public.appearance_settings WHERE id = 'appearance'",
    params: [],
  });
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
  assert.doesNotMatch(
    JSON.stringify({ headers: first.headers, body: first.body }),
    /synthetic-password|postgresql:|Neon-Connection-String/,
  );
});

test("outages, an absent row and timed out transport return uncached default CSS", async () => {
  const { appearanceCss } = await import("../scripts/appearance.mjs");
  for (const fetch of [
    async () => {
      throw Error("offline");
    },
    async () => new Response("missing", { status: 404 }),
    async () => new Response(JSON.stringify({ rows: [], rowCount: 0 })),
    () => new Promise(() => {}),
  ]) {
    const result = await request(fetch, undefined, undefined, {
      timeoutMs: 10,
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.headers["X-Appearance-Status"], "fallback");
    assert.equal(result.headers["Cache-Control"], "no-store");
    assert.equal(result.body, appearanceCss(defaults));
  }
});

test("missing or unsafe database configuration never sends credentials", async () => {
  for (const value of [
    undefined,
    "",
    "https://ep-test-unit.eu-central-1.aws.neon.tech/neondb?sslmode=require",
    "postgresql://reader:synthetic-password@evil.test/neondb?sslmode=require",
    "postgresql://reader:synthetic-password@ep-test.neon.tech.evil.test/neondb?sslmode=require",
    connection.replace("ep-test-unit.", "api."),
    connection.replace("sslmode=require", "sslmode=disable"),
    connection.replace("/neondb?", ":444/neondb?"),
    connection + "#fragment",
    connection + "\n",
  ]) {
    let calls = 0;
    const result = await request(
      async () => {
        calls++;
        return response(settings);
      },
      undefined,
      undefined,
      { env: { HSC_APPEARANCE_DATABASE_URL: value } },
    );
    assert.equal(result.statusCode, 200);
    assert.equal(result.headers["X-Appearance-Status"], "fallback");
    assert.equal(result.headers["Cache-Control"], "no-store");
    assert.equal(calls, 0);
  }
});

test("database envelope, digest and document sizes fail closed before caching", async () => {
  const document = JSON.stringify(settings);
  for (const value of [
    {},
    {
      rows: [
        [digest(document), document],
        [digest(document), document],
      ],
    },
    { rows: [["a".repeat(64), document]] },
    { rows: [[digest(document), document, "unexpected"]] },
    { rows: [[digest(document), settings]] },
  ]) {
    const result = await request(
      async () => new Response(JSON.stringify(value)),
    );
    assert.equal(result.statusCode, 502);
    assert.equal(result.headers["Cache-Control"], "no-store");
    assert.equal(result.headers["X-Appearance-Status"], "invalid-settings");
  }
  const padded = document.padEnd(8192, " ");
  const maximum = await request(async () => rowResponse(padded));
  assert.equal(maximum.headers["X-Appearance-Status"], "selected");
  assert.equal(
    (await request(async () => rowResponse(padded + " "))).statusCode,
    502,
  );
  assert.equal(
    (
      await request(
        async () =>
          new Response("{}", { headers: { "Content-Length": "16385" } }),
      )
    ).statusCode,
    502,
  );
});

test("malformed UTF-8 cannot be repaired into publicly cached selected CSS", async () => {
  const document = `{"site":"�","site":${JSON.stringify(defaults)},"cv":${JSON.stringify(defaults)}}`;
  const encoded = Buffer.from(
    JSON.stringify({ rows: [[digest(document), document]] }),
  );
  const marker = Buffer.from("�");
  const offset = encoded.indexOf(marker);
  assert.notEqual(offset, -1);
  const malformed = Buffer.concat([
    encoded.subarray(0, offset),
    Buffer.from([0xff]),
    encoded.subarray(offset + marker.length),
  ]);
  assert.throws(() =>
    new TextDecoder("utf-8", { fatal: true }).decode(malformed),
  );
  const result = await request(async () => new Response(malformed));
  assert.equal(result.statusCode, 502);
  assert.equal(result.headers["X-Appearance-Status"], "invalid-settings");
  assert.equal(result.headers["Cache-Control"], "no-store");
});

test("appearance runtime is scoped to Paris without changing project-wide regions", async () => {
  const config = JSON.parse(await readFile("vercel.json", "utf8"));
  assert.deepEqual(config.functions?.["api/appearance.mjs"]?.regions, ["cdg1"]);
  assert.equal(config.regions, undefined);
  assert.deepEqual(Object.keys(config.functions), ["api/appearance.mjs"]);
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
  assert.match(site, /--background:[^;]+!important/);
  assert.match(site, /:root\[data-theme="light"\]/);
  assert.match(site, /:root\[data-theme="dark"\]/);
  assert.match(site, /prefers-color-scheme: dark/);
  assert.doesNotMatch(site, /--resume-/);
  assert.match(cv, /^@media screen\{/);
  assert.match(cv, /--resume-paper:[^;]+!important/);
  assert.match(cv, /body\.resume-app/);
  assert.doesNotMatch(cv, /--bg:|@media print/);
  assert.match(site, /Instrument Serif/);
  assert.match(site, /\/assets\/fonts\/instrument-serif-regular.woff2/);
  assert.notEqual(site, appearanceCss({ ...defaults, band: "accent" }));
  assert.notEqual(site, appearanceCss({ ...defaults, band: "contrast" }));
  assert.notEqual(site, appearanceCss({ ...defaults, type: "geist" }));
});
