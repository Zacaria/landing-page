import test from "node:test";
import assert from "node:assert/strict";
import {
  readFile,
  writeFile,
  mkdir,
  mkdtemp,
  rm,
  readdir,
  symlink,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { build } from "../scripts/build.mjs";
import { validateSnapshot, safeHref, pinSnapshot } from "../scripts/schema.mjs";
import {
  renderIndex,
  renderArticle,
  renderArticleBody,
} from "../scripts/render.mjs";
import { fixture } from "./fixtures.mjs";
const root = path.resolve(".local");
await mkdir(root, { recursive: true });
const baseline = JSON.parse(await readFile("content/published.json"));
function reject(mutator) {
  const s = fixture();
  mutator(s);
  assert.throws(() => validateSnapshot(s), /Invalid published snapshot/);
}
test("baseline is verified public content and has no invented article history", () => {
  validateSnapshot(baseline);
  assert.equal(baseline.articles.length, 0);
  const html = renderIndex(baseline);
  assert.match(html, /No notes published yet/);
  assert.match(
    html,
    /At Club Med, I helped scale a public API platform from 10M to 25M requests\/day in production so it could support more traffic\./,
  );
  for (const href of [
    "https://zacaria.github.io/float/",
    "https://pathfinding-client.vercel.app/",
    "https://havesomecode.github.io/kibana-mcp-server/",
    "https://cv.havesomecode.io/",
    "https://www.youtube.com/watch?v=eSo3e3ugn5g",
    "/linkedin-editorial-scout-privacy",
  ])
    assert.ok(html.includes(href), href);
  assert.doesNotMatch(
    html,
    /2000-01|Synthetic|data-article|Design preview|Draft/,
  );
});
test("all four configurable categories render and ordered visibility is honored", () => {
  const s = fixture();
  s.site.intro = "Changed introduction";
  s.site.bio = "Changed bio";
  s.projects[0].title = "Changed project";
  s.navigation = [
    { label: "Hidden", href: "/#about", visible: false, order: 0 },
    { label: "Second", href: "/#about", visible: true, order: 2 },
    { label: "First", href: "/#posts", visible: true, order: 1 },
  ];
  const html = renderIndex(pinSnapshot(s));
  for (const text of [
    "Changed introduction",
    "Changed bio",
    "Changed project",
    "FEATURED",
    "Synthetic renderer fixture",
    "Rust",
    "Second",
    "First",
  ])
    assert.ok(html.toLowerCase().includes(text.toLowerCase()), text);
  assert.ok(html.indexOf("[ FIRST ]") < html.indexOf("[ SECOND ]"));
  assert.doesNotMatch(html, /\[ HIDDEN \]/);
});
test("article routing, SEO and published dates come from selected snapshot only", () => {
  const s = fixture(),
    a = s.articles[0];
  const html = renderArticle(a, s);
  assert.match(html, /https:\/\/www.havesomecode.io\/blog\/test-renderer/);
  assert.match(html, /<title>Renderer fixture SEO<\/title>/);
  assert.match(html, /datetime="2000-01-01T00:00:00.000Z"/);
});
test("public and private preview use identical block renderer and asset contracts", () => {
  const s = fixture(),
    a = s.articles[0];
  const pub = renderArticle(a, s),
    priv = renderArticle(a, s, { preview: true });
  const body = /<div class="article-body">([\s\S]*?)<\/div>/;
  assert.equal(pub.match(body)[1], priv.match(body)[1]);
  assert.ok(pub.includes(renderArticleBody(a)));
  assert.match(priv, /noindex, nofollow/);
  assert.match(priv, /PRIVATE PREVIEW · Not published/);
  assert.doesNotMatch(priv, /datetime=|rel="canonical"/);
  for (const file of [
    "/assets/styles.css",
    "/assets/site.js",
    "/assets/theme-init.js",
    "/assets/fonts/geist-mono.woff2",
  ])
    assert.ok(pub.includes(file) && priv.includes(file));
});
test("rich text and code are escaped and sequential list items form real lists", () => {
  const s = fixture();
  s.articles[0].title = "<img src=x onerror=alert(1)>";
  s.articles[0].blocks.unshift({
    kind: "paragraph",
    spans: [{ text: "</p><script>alert(1)</script>", bold: true }],
  });
  const pinned = pinSnapshot(s);
  const html = renderArticle(pinned.articles[0], pinned);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>alert|<img src=x/);
  assert.match(html, /<ul><li>First bullet<\/li><li>Second bullet<\/li><\/ul>/);
  assert.match(html, /<strong>/);
  assert.match(html, /<em>/);
  assert.match(html, /<pre><code>&lt;script&gt;/);
});
for (const [name, mutate] of [
  ["root drafts", (s) => (s.drafts = [])],
  ["unknown schema", (s) => (s.schemaVersion = 2)],
  ["private source id", (s) => (s.articles[0].notionPageId = "private")],
  ["private block id", (s) => (s.articles[0].blocks[0].id = "private")],
  ["raw html", (s) => (s.articles[0].blocks[0].kind = "html")],
  ["unsupported block", (s) => (s.articles[0].blocks[0].kind = "unsupported")],
  ["missing version", (s) => delete s.articles[0].version],
  ["invalid revision", (s) => (s.revision = "bad")],
  ["slug traversal", (s) => (s.articles[0].slug = "../secret")],
  ["duplicate slugs", (s) => s.articles.push(s.articles[0])],
  ["missing selected article", (s) => (s.site.selectedSlugs = ["missing"])],
  ["unexpected auth field", (s) => (s.site.apiKey = "secret")],
  [
    "remote expiring image",
    (s) =>
      s.articles[0].blocks.push({
        kind: "image",
        spans: [],
        asset: "https://example.com/signed?token=secret",
      }),
  ],
  [
    "svg image",
    (s) => (s.projects[0].image = "/content/assets/" + "b".repeat(64) + ".svg"),
  ],
  ["empty image field", (s) => (s.projects[0].image = "")],
  ["bad boolean", (s) => (s.navigation[0].visible = "false")],
  ["invalid timestamp", (s) => (s.articles[0].publishedAt = "yesterday")],
  ["oversized text", (s) => (s.site.intro = "x".repeat(4001))],
  [
    "bad URL",
    (s) => (s.articles[0].blocks[0].spans[0].href = "javascript:alert(1)"),
  ],
])
  test(`rejects ${name}`, () => reject(mutate));
test("tampered content or revision never passes published validation", () => {
  reject((s) => {
    s.articles[0].title = "Unapproved changed title";
  });
  reject((s) => {
    s.projects[0].description = "Unapproved project edit";
  });
  reject((s) => {
    s.revision = "b".repeat(64);
  });
  reject((s) => {
    s.articles[0].publishedAt = "2000-02-31T00:00:00.000Z";
  });
});
test("href policy rejects executable, protocol-relative, private/local and credential URLs", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,<script>",
    "//evil.example",
    "http://example.com",
    "https://user:password@example.com",
    "https://127.0.0.1/",
    "https://[::1]/",
    "https://localhost/",
    "/admin",
    "/api/preview",
    "/../secret",
    "/\\evil.example",
    "mailto:user@example.com?body=secret",
    "https://example.com/\n",
  ])
    assert.equal(safeHref(url), false, url);
  for (const url of [
    "/#posts",
    "/blog/safe-route",
    "https://github.com/Zacaria",
    "mailto:havesomecode@gmail.com",
  ])
    assert.equal(safeHref(url), true, url);
});
async function sandbox(fn) {
  const dir = await mkdtemp(path.join(root, "public-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
test("production artifact allowlist: no snapshot JSON, fixtures, drafts or private sources", () =>
  sandbox(async (dir) => {
    const output = path.join(dir, "dist");
    await build({ output });
    const files = await readdir(output, { recursive: true });
    assert.ok(files.includes("index.html"));
    for (const name of files)
      assert.doesNotMatch(
        name,
        /published\.json|fixture|preview|scripts|tests|\.env/,
      );
    assert.equal(
      await readFile(path.join(output, "index.html"), "utf8"),
      renderIndex(baseline),
    );
  }));
test("rebuild removes stale articles and retains last-known-good output on malformed/missing snapshot", () =>
  sandbox(async (dir) => {
    const snapshotPath = path.join(dir, "snapshot.json"),
      output = path.join(dir, "dist");
    await writeFile(snapshotPath, JSON.stringify(fixture()));
    await build({ snapshotPath, output });
    assert.ok(
      (
        await readFile(path.join(output, "blog/test-renderer.html"), "utf8")
      ).includes("Synthetic renderer fixture"),
    );
    await writeFile(snapshotPath, JSON.stringify(baseline));
    await build({ snapshotPath, output });
    assert.ok(!(await readdir(output)).includes("blog"));
    const good = await readFile(path.join(output, "index.html"));
    await writeFile(snapshotPath, '{"drafts":[]}');
    await assert.rejects(build({ snapshotPath, output }));
    assert.deepEqual(await readFile(path.join(output, "index.html")), good);
    await rm(snapshotPath);
    await assert.rejects(build({ snapshotPath, output }));
    assert.deepEqual(await readFile(path.join(output, "index.html")), good);
  }));
test("frozen image copy uses exact bytes/digest and rejects corruption and symlinks", () =>
  sandbox(async (dir) => {
    const bytes = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jpj8AAAAASUVORK5CYII=",
      "base64",
    );
    const hash = createHash("sha256").update(bytes).digest("hex"),
      asset = `/content/assets/${hash}.png`,
      file = path.join(dir, asset);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, bytes);
    const s = fixture();
    s.articles[0].blocks.push({
      kind: "image",
      spans: [{ text: "Fixture pixel" }],
      asset,
    });
    s.projects[0].image = asset;
    const snapshotPath = path.join(dir, "snapshot.json"),
      output = path.join(dir, "dist");
    await writeFile(snapshotPath, JSON.stringify(pinSnapshot(s)));
    await build({ snapshotPath, output, assetRoot: dir });
    assert.deepEqual(await readFile(path.join(output, asset)), bytes);
    const good = await readFile(path.join(output, "index.html"));
    await writeFile(file, Buffer.from("<script>unsafe</script>"));
    await assert.rejects(
      build({ snapshotPath, output, assetRoot: dir }),
      /format\/digest/,
    );
    assert.deepEqual(await readFile(path.join(output, "index.html")), good);
    await rm(file);
    const other = path.join(dir, "other.png");
    await writeFile(other, bytes);
    await symlink(other, file);
    await assert.rejects(
      build({ snapshotPath, output, assetRoot: dir }),
      /symlinked/,
    );
  }));
