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
  escape,
  renderIndex,
  renderArticle,
  renderArticleBody,
  renderBlogIndex,
  renderOffers,
} from "../scripts/render.mjs";
import { fixture } from "./fixtures.mjs";
const root = path.resolve(".local");
await mkdir(root, { recursive: true });
const baseline = JSON.parse(await readFile("content/published.json"));
// The site without articles: notes, search, topics and the Blog link disappear.
const empty = pinSnapshot({ ...baseline, articles: [] });
function reject(mutator) {
  const s = fixture();
  mutator(s);
  assert.throws(() => validateSnapshot(s), /Invalid published snapshot/);
}
test("baseline is verified public content with the three first blog articles", () => {
  validateSnapshot(baseline);
  assert.deepEqual(
    baseline.articles.map((a) => a.slug),
    [
      "ou-passe-le-temps-d-une-requete",
      "nommer-un-champ-d-api",
      "contexte-maitrise-agents-de-code",
    ],
  );
  for (const a of baseline.articles) {
    assert.ok(!("originalPublication" in a), a.slug);
    assert.doesNotMatch(
      JSON.stringify(a),
      /LinkedIn|tested capacity|test de charge, pas/,
    );
  }
  const html = renderIndex(baseline);
  assert.doesNotMatch(html, /No notes published yet/);
  assert.match(html, /lead développeur chez Club Med/);
  for (const href of [
    "https://zacaria.github.io/float/",
    "https://pathfinding-client.vercel.app/",
    "https://havesomecode.github.io/kibana-mcp-server/",
    "https://cv.havesomecode.io/",
    "https://www.youtube.com/watch?v=eSo3e3ugn5g",
    "/confidentialite",
  ])
    assert.ok(html.includes(href), href);
  assert.doesNotMatch(
    html,
    /2000-01|Synthetic|data-article|Design preview|Draft/,
  );
});
test("specimen homepage renders the four static demonstrations and section order", () => {
  const html = renderIndex(empty);
  assert.match(html, /Six assistants\.<br \/><em>En marche, ici\.<\/em>/);
  assert.deepEqual(
    [...html.matchAll(/data-demo="([^"]+)"/g)].map((m) => m[1]),
    ["tri", "matin", "prix", "echeance", "veille", "mails"],
  );
  assert.equal((html.match(/role="img"/g) ?? []).length, 6);
  assert.match(html, /aria-label="Assistants en démonstration"/);
  assert.match(html, /aria-label="Rejouer la démo : Le tri des demandes"/);
  assert.match(html, /<h3>Le tri des demandes<\/h3>/);
  assert.match(html, /href="#contact">Discutons de votre projet<\/a>/);
  assert.equal((html.match(/validé ✓/g) ?? []).length, 4);
  assert.match(
    html,
    /quatre changements validés, dont une baisse, et un tarif inchangé/i,
  );
  assert.match(html, /Point du matin du 11\/05/);
  assert.match(html, /TVA à déclarer demain/);
  assert.doesNotMatch(html, /hero\.js|id="demarche"|id="agent"/);
  const order = [
    "assistants",
    "about",
    "contact",
    "suivre",
    "projects",
    "speaking",
  ];
  for (let i = 1; i < order.length; i++)
    assert.ok(
      html.indexOf(`id="${order[i - 1]}"`) < html.indexOf(`id="${order[i]}"`),
    );
  assert.match(html, /href="\/#assistants"/);
  const s = fixture();
  assert.match(renderIndex(s), /id="search"/);
  assert.match(renderIndex(s), /id="posts"/);
  assert.match(renderIndex(s), /id="topics"/);
  s.articles.forEach((a) => {
    a.topics = [];
  });
  const topicless = renderIndex(pinSnapshot(s));
  assert.doesNotMatch(topicless, /id="topics"|\/#topics/);
  assert.match(topicless, /id="posts"/);
  const noProjects = structuredClone(baseline);
  noProjects.projects = [];
  assert.doesNotMatch(
    renderIndex(pinSnapshot(noProjects)),
    /id="projects"|\/#projects/,
  );
});
test("interest list block: explicit unticked consent, trap field, no price, privacy link", () => {
  const html = renderIndex(baseline);
  const block = html.match(/<section class="interest"[\s\S]*?<\/section>/)[0];
  assert.match(
    block,
    /action="https:\/\/interest\.havesomecode\.io\/subscribe"/,
  );
  assert.match(block, /<input id="interest-email" type="email"[^>]* required/);
  const consent = block.match(/<input id="interest-consent"[^>]*>/)[0];
  assert.match(consent, /type="checkbox"/);
  assert.match(consent, / required/);
  assert.doesNotMatch(consent, /checked/);
  assert.match(block, /name="website"[^>]*tabindex="-1"/);
  assert.match(block, /Je veux suivre/);
  assert.match(block, /href="\/confidentialite"/);
  assert.doesNotMatch(block, /€|tarif|TJM|prix/i);
});

test("HaveSome learning replaces Speaking with three unique entries and the complete archive", () => {
  const html = renderIndex(baseline);
  const section = html.match(
    /<section[^>]*id="speaking"[^>]*>([\s\S]*?)<\/section>/,
  )?.[1];
  assert.ok(section);
  assert.match(section, /<h2>Conférences &amp; apprentissage<\/h2>/);
  assert.match(section, /HaveSome…/);
  assert.equal((section.match(/<li class="post">/g) || []).length, 3);
  for (const href of [
    "https://havesomecode.github.io/havesome-oidc/",
    "https://zacaria.github.io/havesome-worktrees/",
    "https://www.youtube.com/watch?v=eSo3e3ugn5g",
    "https://havesome-rust-apidays.surge.sh/",
    "https://github.com/Zacaria/zacaria#links",
  ])
    assert.equal(html.split(`href="${href}"`).length - 1, 1, href);
  assert.match(section, /Guide interactif · 2026/);
  assert.match(section, /Slides · 2026/);
  assert.match(section, /API Days Paris · 2023/);
  assert.match(section, /Toutes les présentations →/);
  assert.doesNotMatch(section, /product-grid|<article|<iframe|<h2>Speaking/);
  assert.equal((html.match(/id="speaking"/g) || []).length, 1);
});
test("all four configurable categories render and ordered visibility is honored", () => {
  const s = fixture();
  s.projects[0].title = "Changed project";
  s.navigation = [
    { label: "Hidden", href: "/#about", visible: false, order: 0 },
    { label: "Second", href: "/#about", visible: true, order: 2 },
    { label: "First", href: "/#posts", visible: true, order: 1 },
  ];
  const html = renderIndex(pinSnapshot(s));
  for (const text of [
    "Changed project",
    "À LA UNE",
    "Synthetic renderer fixture",
    "Rust",
    "Second",
    "First",
  ])
    assert.ok(html.toLowerCase().includes(text.toLowerCase()), text);
  assert.ok(html.indexOf("[ FIRST ]") < html.indexOf("[ SECOND ]"));
  assert.doesNotMatch(html, /\[ HIDDEN \]/);
});
test("blog index lists every article newest first and is the target of nav and back-links", () => {
  const s = fixture();
  s.navigation.find((n) => n.label === "Blog").href = "/blog";
  const pinned = pinSnapshot(s);
  const html = renderBlogIndex(pinned);
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/www.havesomecode.io\/blog" \/>/,
  );
  assert.match(html, /<h1>Blog<\/h1>/);
  assert.ok(
    html.indexOf('href="/blog/test-second"') <
      html.indexOf('href="/blog/test-renderer"'),
  );
  assert.match(html, /A test of safe block rendering\./);
  assert.match(html, /<a href="\/blog">\[ BLOG \]<\/a>/);
  const article = renderArticle(pinned.articles[0], pinned);
  assert.match(article, /<a href="\/blog">← Toutes les notes<\/a>/);
  assert.match(
    article,
    /<a class="more" href="\/blog">Retour à toutes les notes →<\/a>/,
  );
  assert.match(
    renderIndex(pinned),
    /<a class="more" href="\/blog">Voir toutes les notes →<\/a>/,
  );
  assert.match(renderIndex(baseline), /<a href="\/blog">\[ BLOG \]<\/a>/);
  assert.doesNotMatch(renderIndex(baseline), /\[ RECHERCHE \]/);
});
test("public pages load the Cloudflare Web Analytics beacon; previews stay out", () => {
  const pinned = pinSnapshot(fixture());
  const article = pinned.articles[0];
  for (const html of [
    renderIndex(pinned),
    renderBlogIndex(pinned),
    renderArticle(article, pinned),
  ]) {
    assert.ok(
      html.includes(
        'src="https://static.cloudflareinsights.com/beacon.min.js"',
      ),
    );
    assert.ok(html.includes("04f11759a0bd40a5900231a4e43dc019"));
  }
  assert.doesNotMatch(
    renderIndex(pinned, { preview: true }),
    /cloudflareinsights/,
  );
  assert.doesNotMatch(
    renderArticle(article, pinned, { preview: true }),
    /cloudflareinsights/,
  );
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
  assert.match(priv, /APERÇU PRIVÉ · Non publié/);
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
  ["oversized text", (s) => (s.projects[0].description = "x".repeat(4001))],
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
    "mailto:z@havesomecode.io",
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
    assert.match(
      await readFile(path.join(output, "blog/index.html"), "utf8"),
      /href="\/blog\/test-renderer"/,
    );
    assert.match(
      await readFile(path.join(output, "sitemap.xml"), "utf8"),
      /havesomecode.io\/blog<\/loc>/,
    );
    await writeFile(snapshotPath, JSON.stringify(empty));
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

test("offers render seven sections, exact headings and contact without private notes", () => {
  const html = renderOffers(baseline);
  for (const id of [
    "offres-top",
    "tri-des-demandes",
    "point-du-matin",
    "rappel-echeances",
    "veille-appels-offres",
    "conversation",
    "contact",
  ])
    assert.match(html, new RegExp(`id="${id}"`));
  assert.match(
    html,
    /Quatre petites choses qui font gagner du temps à votre équipe/,
  );
  for (const dt of ["Je vous livre", "Vous gardez", "Mise en place"])
    assert.equal(html.split(`<dt>${dt}</dt>`).length - 1, 4);
  assert.match(
    html,
    /mailto:z@havesomecode.io\?subject=Parlons-en%2030%20minutes/,
  );
  assert.doesNotMatch(html, /Notes privées|€/);
  assert.equal(safeHref("/offres"), true);
});
test("build generates offers and sitemap route", () =>
  sandbox(async (dir) => {
    const output = path.join(dir, "dist");
    await build({ output });
    assert.match(
      await readFile(path.join(output, "offres.html"), "utf8"),
      /id="offres-top"/,
    );
    assert.match(
      await readFile(path.join(output, "sitemap.xml"), "utf8"),
      /havesomecode.io\/offres<\/loc>/,
    );
  }));
