import test from "node:test";
import assert from "node:assert/strict";
import { historicalFixture as historical } from "./fixtures.mjs";
import { pinSnapshot, validateSnapshot } from "../scripts/schema.mjs";
import { renderArticle, renderIndex } from "../scripts/render.mjs";
import { build } from "../scripts/build.mjs";
import { mkdir, mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";

test("static build retains original dates without attribution and fails closed without replacing good output", async () => {
  await mkdir(".local", { recursive: true });
  const dir = await mkdtemp(path.resolve(".local/history-build-"));
  try {
    const s = historical();
    const snapshotPath = path.join(dir, "snapshot.json"),
      output = path.join(dir, "dist");
    await writeFile(snapshotPath, JSON.stringify(s));
    const result = await build({ snapshotPath, output });
    assert.equal(result.articles, 3);
    const article = await readFile(
      path.join(output, "blog/older-import.html"),
      "utf8",
    );
    assert.doesNotMatch(
      article,
      /Originally published|Published on HaveSomeCode|Adapted from|Adaptation|datetime="2026-10-01/i,
    );
    assert.ok(!article.includes(s.articles[0].originalPublication.url));
    assert.match(article, /datetime="2026-03-01T10:00:00.000Z"/);
    assert.match(
      await readFile(path.join(output, "index.html"), "utf8"),
      /2026-03-01<\/time>/,
    );
    s.articles[0].originalPublication.publishedAt = "9999-01-01T00:00:00.000Z";
    await writeFile(snapshotPath, JSON.stringify(s));
    await assert.rejects(build({ snapshotPath, output }));
    assert.equal(
      await readFile(path.join(output, "blog/older-import.html"), "utf8"),
      article,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("notes sort by plain original dates, not import time, alongside ordinary notes", () => {
  const s = historical();
  validateSnapshot(s);
  const html = renderIndex(s);
  assert.ok(
    html.indexOf('href="/blog/ordinary"') <
      html.indexOf('href="/blog/newer-import"'),
  );
  assert.ok(
    html.indexOf('href="/blog/newer-import"') <
      html.indexOf('href="/blog/older-import"'),
  );
  assert.match(html, /datetime="2026-03-01T10:00:00.000Z">2026-03-01<\/time>/);
  assert.doesNotMatch(html, /datetime="2026-10-01|<\/time> · LinkedIn/);
});

test("article and preview show one original date while provenance and actual release remain stored", () => {
  const s = historical(),
    a = s.articles[0];
  const before = structuredClone(a);
  const html = renderArticle(a, s);
  const preview = renderArticle(a, s, { preview: true });
  for (const view of [html, preview]) {
    assert.ok(!view.includes(a.originalPublication.url));
    assert.match(view, /datetime="2026-03-01T10:00:00.000Z"/);
    assert.equal((view.match(/<time /g) || []).length, 1);
    assert.doesNotMatch(
      view,
      /Originally published|Published on HaveSomeCode|Adapted from|Adaptation|datetime="2026-10-01/i,
    );
  }
  assert.doesNotMatch(preview, /rel="canonical"/);
  assert.match(preview, /PRIVATE PREVIEW · Not published/);
  assert.deepEqual(a, before);
  assert.equal(a.publishedAt, "2026-10-01T00:00:00.000Z");
});

test("original metadata participates in canonical content pins and rejects tampering", () => {
  const s = historical(),
    version = s.articles[0].version;
  for (const field of ["publishedAt", "url"]) {
    const changed = structuredClone(s);
    changed.articles[0].originalPublication[field] =
      field === "url"
        ? "https://www.linkedin.com/feed/update/urn:li:activity:1234567890123456789/"
        : "2026-03-02T10:00:00.000Z";
    assert.throws(() => validateSnapshot(changed));
    const pinned = pinSnapshot(changed);
    validateSnapshot(pinned);
    assert.notEqual(pinned.articles[0].version, version);
  }
});

for (const original of [
  null,
  {},
  { publishedAt: "2026-03-01T10:00:00.000Z" },
  {
    publishedAt: "2026-02-30T00:00:00.000Z",
    url: "https://www.linkedin.com/posts/example",
  },
  {
    publishedAt: "9999-01-01T00:00:00.000Z",
    url: "https://www.linkedin.com/posts/example",
  },
  {
    publishedAt: "2026-10-02T00:00:00.000Z",
    url: "https://www.linkedin.com/posts/example",
  },
  {
    publishedAt: "2026-03-01T10:00:00.000Z",
    url: "https://evil.test/posts/example",
  },
  {
    publishedAt: "2026-03-01T10:00:00.000Z",
    url: "https://www.linkedin.com/posts/example",
    privateId: "secret",
  },
]) {
  test(`strict original publication validation: ${JSON.stringify(original)}`, () => {
    const s = historical();
    s.articles[0].originalPublication = original;
    assert.throws(() => validateSnapshot(pinSnapshot(s)));
  });
}
