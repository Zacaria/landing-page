import { createHash } from "node:crypto";
// This is the code-owned published projection, not a Notion/private draft DTO.
export const ASSET = /^\/content\/assets\/[a-f0-9]{64}\.(?:png|jpg|webp|gif)$/;
const HEX = /^[a-f0-9]{64}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KINDS = [
  "paragraph",
  "heading_1",
  "heading_2",
  "heading_3",
  "bulleted_list_item",
  "numbered_list_item",
  "quote",
  "code",
  "divider",
  "image",
];
function fail(path) {
  throw new Error(`Invalid published snapshot: ${path}`);
}
function object(value, keys, required, path) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(path);
  if (Object.keys(value).some((key) => !keys.includes(key)))
    fail(`${path}.unknown-field`);
  if (required.some((key) => !Object.hasOwn(value, key)))
    fail(`${path}.missing-field`);
}
function text(value, max, path, empty = false) {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (!empty && !value.trim()) ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)
  )
    fail(path);
}
function list(value, max, path) {
  if (!Array.isArray(value) || value.length > max) fail(path);
}
function bool(value, path) {
  if (typeof value !== "boolean") fail(path);
}
function order(value, path) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 10000) fail(path);
}
function slug(value, path) {
  text(value, 100, path);
  if (!SLUG.test(value)) fail(path);
}
function hex(value, path) {
  if (typeof value !== "string" || !HEX.test(value)) fail(path);
}
export function safeHref(value) {
  if (
    typeof value !== "string" ||
    value.length > 2048 ||
    /[\u0000-\u0020\u007f\\]/.test(value)
  )
    return false;
  // Code-owned local routes/anchors only; never control-plane/private URLs.
  if (
    /^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]*(?:#[a-zA-Z0-9_-]+)?$/.test(value)
  ) {
    return (
      !/(?:^|\/)\.\.?($|\/)/.test(value) &&
      !/^\/(?:api|admin|preview)(?:\/|$)/.test(value)
    );
  }
  try {
    const url = new URL(value);
    if (url.username || url.password) return false;
    if (url.protocol === "mailto:")
      return /^[^?]+@[^?]+$/.test(url.pathname) && !url.search && !url.hash;
    if (url.protocol !== "https:") return false;
    if (
      url.hostname === "localhost" ||
      url.hostname.endsWith(".localhost") ||
      url.hostname.endsWith(".local") ||
      /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname) ||
      url.hostname.includes(":")
    )
      return false;
    return true;
  } catch {
    return false;
  }
}
function href(value, path) {
  if (!safeHref(value)) fail(path);
}
function asset(value, path) {
  if (typeof value !== "string" || !ASSET.test(value)) fail(path);
}
function unique(items, key, path) {
  if (new Set(items.map(key)).size !== items.length) fail(`${path}.duplicate`);
}
function digest(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
function articleContent(a) {
  return {
    schemaVersion: 1,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    topics: a.topics,
    seo: { title: a.seo.title, description: a.seo.description },
    blocks: a.blocks.map((b) => ({
      kind: b.kind,
      spans: b.spans.map((s) => ({
        text: s.text,
        ...(s.bold ? { bold: true } : {}),
        ...(s.italic ? { italic: true } : {}),
        ...(s.code ? { code: true } : {}),
        ...(s.strike ? { strike: true } : {}),
        ...(s.href ? { href: s.href } : {}),
      })),
      ...("language" in b ? { language: b.language } : {}),
      ...("asset" in b ? { asset: b.asset } : {}),
    })),
  };
}
function snapshotContent(s) {
  return {
    schemaVersion: 1,
    projects: s.projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      href: p.href,
      featured: p.featured,
      order: p.order,
      ...("image" in p ? { image: p.image } : {}),
    })),
    site: {
      intro: s.site.intro,
      bio: s.site.bio,
      contact: s.site.contact.map((c) => ({ label: c.label, href: c.href })),
      selectedSlugs: s.site.selectedSlugs,
    },
    navigation: s.navigation.map((n) => ({
      label: n.label,
      href: n.href,
      visible: n.visible,
      order: n.order,
    })),
    articles: s.articles.map((a) => ({
      ...articleContent(a),
      version: a.version,
      publishedAt: a.publishedAt,
    })),
  };
}
// Pins are integrity metadata, NOT owner authorization. The service owns release checks.
export function pinSnapshot(snapshot) {
  const pinned = structuredClone(snapshot);
  pinned.articles.forEach((a) => {
    a.version = digest(articleContent(a));
  });
  pinned.revision = digest(snapshotContent(pinned));
  return pinned;
}
export function validateArticle(article) {
  object(
    article,
    [
      "schemaVersion",
      "slug",
      "title",
      "excerpt",
      "version",
      "publishedAt",
      "topics",
      "seo",
      "blocks",
    ],
    [
      "schemaVersion",
      "slug",
      "title",
      "excerpt",
      "version",
      "publishedAt",
      "topics",
      "seo",
      "blocks",
    ],
    "article",
  );
  if (article.schemaVersion !== 1) fail("article.schemaVersion");
  slug(article.slug, "article.slug");
  text(article.title, 200, "article.title");
  text(article.excerpt, 400, "article.excerpt", true);
  hex(article.version, "article.version");
  if (
    typeof article.publishedAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(
      article.publishedAt,
    ) ||
    !Number.isFinite(Date.parse(article.publishedAt)) ||
    new Date(article.publishedAt).toISOString() !== article.publishedAt
  )
    fail("article.publishedAt");
  list(article.topics, 20, "article.topics");
  article.topics.forEach((t) => text(t, 80, "article.topics"));
  unique(article.topics, (t) => t, "article.topics");
  object(
    article.seo,
    ["title", "description"],
    ["title", "description"],
    "article.seo",
  );
  text(article.seo.title, 200, "article.seo.title");
  text(article.seo.description, 400, "article.seo.description", true);
  list(article.blocks, 2000, "article.blocks");
  article.blocks.forEach((block) => {
    object(
      block,
      ["kind", "spans", "language", "asset"],
      ["kind", "spans"],
      "block",
    );
    if (!KINDS.includes(block.kind)) fail("block.kind");
    list(block.spans, 200, "block.spans");
    block.spans.forEach((span) => {
      object(
        span,
        ["text", "bold", "italic", "code", "strike", "href"],
        ["text"],
        "span",
      );
      text(span.text, 20000, "span.text", true);
      ["bold", "italic", "code", "strike"].forEach((k) => {
        if (k in span) bool(span[k], `span.${k}`);
      });
      if ("href" in span) href(span.href, "span.href");
    });
    if ("language" in block) {
      if (block.kind !== "code") fail("block.language-kind");
      text(block.language, 80, "block.language");
    }
    if ("asset" in block) {
      if (block.kind !== "image") fail("block.asset-kind");
      asset(block.asset, "block.asset");
    }
    if (block.kind === "image" && !block.asset)
      fail("block.image-without-asset");
  });
  if (digest(articleContent(article)) !== article.version)
    fail("article.version-digest");
  return article;
}
export function validateSnapshot(snapshot) {
  object(
    snapshot,
    ["schemaVersion", "revision", "articles", "projects", "site", "navigation"],
    ["schemaVersion", "revision", "articles", "projects", "site", "navigation"],
    "root",
  );
  if (snapshot.schemaVersion !== 1) fail("schemaVersion");
  hex(snapshot.revision, "revision");
  list(snapshot.articles, 500, "articles");
  snapshot.articles.forEach(validateArticle);
  unique(snapshot.articles, (a) => a.slug, "articles");
  list(snapshot.projects, 100, "projects");
  snapshot.projects.forEach((p) => {
    object(
      p,
      ["slug", "title", "description", "href", "image", "featured", "order"],
      ["slug", "title", "description", "href", "featured", "order"],
      "project",
    );
    slug(p.slug, "project.slug");
    text(p.title, 200, "project.title");
    text(p.description, 2000, "project.description", true);
    href(p.href, "project.href");
    bool(p.featured, "project.featured");
    order(p.order, "project.order");
    if ("image" in p) asset(p.image, "project.image");
  });
  unique(snapshot.projects, (p) => p.slug, "projects");
  object(
    snapshot.site,
    ["intro", "bio", "contact", "selectedSlugs"],
    ["intro", "bio", "contact", "selectedSlugs"],
    "site",
  );
  text(snapshot.site.intro, 4000, "site.intro", true);
  text(snapshot.site.bio, 20000, "site.bio", true);
  list(snapshot.site.contact, 20, "site.contact");
  snapshot.site.contact.forEach((c) => {
    object(c, ["label", "href"], ["label", "href"], "contact");
    text(c.label, 80, "contact.label");
    href(c.href, "contact.href");
  });
  list(snapshot.site.selectedSlugs, 100, "site.selectedSlugs");
  snapshot.site.selectedSlugs.forEach((s) => {
    slug(s, "selectedSlug");
    if (!snapshot.articles.some((a) => a.slug === s))
      fail("site.selectedSlugs.missing-article");
  });
  unique(snapshot.site.selectedSlugs, (s) => s, "selectedSlugs");
  list(snapshot.navigation, 30, "navigation");
  snapshot.navigation.forEach((n) => {
    object(
      n,
      ["label", "href", "visible", "order"],
      ["label", "href", "visible", "order"],
      "nav",
    );
    text(n.label, 80, "nav.label");
    href(n.href, "nav.href");
    bool(n.visible, "nav.visible");
    order(n.order, "nav.order");
  });
  if (digest(snapshotContent(snapshot)) !== snapshot.revision)
    fail("revision-digest");
  return snapshot;
}
