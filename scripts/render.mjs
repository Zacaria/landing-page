import { validateArticle, validateSnapshot } from "./schema.mjs";
export const ORIGIN = "https://www.havesomecode.io";
export function escape(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function anchor(href, label, attrs = "") {
  return `<a href="${escape(href)}"${attrs}>${label}</a>`;
}
function paragraphs(value) {
  return value
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((p) => `<p>${escape(p)}</p>`)
    .join("\n");
}
function spans(items) {
  return items
    .map((s) => {
      let result = escape(s.text);
      for (const [key, tag] of [
        ["code", "code"],
        ["bold", "strong"],
        ["italic", "em"],
        ["strike", "s"],
      ])
        if (s[key]) result = `<${tag}>${result}</${tag}>`;
      if (s.href) result = anchor(s.href, result, ' rel="noopener noreferrer"');
      return result;
    })
    .join("");
}
export function renderArticleBody(article) {
  validateArticle(article);
  let output = "",
    list = "";
  for (const b of article.blocks) {
    const current =
      b.kind === "bulleted_list_item"
        ? "ul"
        : b.kind === "numbered_list_item"
          ? "ol"
          : "";
    if (list !== current) {
      if (list) output += `</${list}>\n`;
      if (current) output += `<${current}>`;
      list = current;
    }
    const text = spans(b.spans);
    if (current) {
      output += `<li>${text}</li>`;
      continue;
    }
    switch (b.kind) {
      case "heading_1":
        output += `<h2>${text}</h2>`;
        break;
      case "heading_2":
        output += `<h3>${text}</h3>`;
        break;
      case "heading_3":
        output += `<h4>${text}</h4>`;
        break;
      case "paragraph":
        output += `<p>${text}</p>`;
        break;
      case "quote":
        output += `<blockquote>${text}</blockquote>`;
        break;
      case "divider":
        output += "<hr />";
        break;
      case "code":
        output += `<pre><code>${escape(b.spans.map((s) => s.text).join(""))}</code></pre>`;
        break;
      case "image":
        output += `<figure><img src="${escape(b.asset)}" alt="${escape(b.spans.map((s) => s.text).join(""))}" loading="lazy" />${text ? `<figcaption>${text}</figcaption>` : ""}</figure>`;
        break;
    }
    output += "\n";
  }
  if (list) output += `</${list}>`;
  return output;
}
const theme = `<div class="theme-control" role="group" aria-label="Appearance"><span class="theme-label">Theme:</span><div class="theme-options">${[
  ["light", "Light"],
  ["dark", "Dark"],
  ["system", "Auto"],
]
  .map(
    ([mode, label]) =>
      `<button type="button" class="theme-choice" data-mode="${mode}" aria-pressed="false"${mode === "system" ? ' aria-label="Auto: follow device theme"' : ""}>${label}</button>`,
  )
  .join("")}</div></div>`;

const sources = {
  float: "https://github.com/Zacaria/float",
  pathfinding: "https://github.com/Zacaria/pathfinding-client",
  "kibana-mcp": "https://github.com/Havesomecode/kibana-mcp-server",
};
function availableLink(href, snapshot) {
  if (["/#posts", "/#search"].includes(href))
    return snapshot.articles.length > 0;
  if (href === "/#topics")
    return snapshot.articles.some((a) => a.topics.length);
  if (href === "/#projects") return snapshot.projects.length > 0;
  return href !== "/#thinking";
}
function header(snapshot, article) {
  const navigation = snapshot.navigation
    .filter((n) => n.visible && availableLink(n.href, snapshot))
    .sort((a, b) => a.order - b.order)
    .map((n) => anchor(n.href, `[ ${escape(n.label.toUpperCase())} ]`))
    .join("");
  return `<header id="top">${article ? '<p class="author">Zacaria Chtatar / Lead Developer</p>' : `<div class="hero"><div class="identity"><p class="role">Hands-on Lead Developer · France</p><h1>Zacaria <em>Chtatar</em></h1></div><p class="intro">${escape(snapshot.site.intro)}</p><p class="quick-links"><a href="https://cv.havesomecode.io/">Read my CV →</a><a href="/#contact">Get in touch →</a></p></div>`}<div class="topline"><p class="brand-line"><a href="/">HAVESOMECODE</a></p><nav aria-label="Main navigation">${navigation}</nav></div></header>`;
}
function topics(snapshot) {
  const all = [...new Set(snapshot.articles.flatMap((a) => a.topics))].sort();
  if (!all.length) return "";
  return `<section id="topics"><h2>Topics</h2><div class="paths">${all.map((t) => `<div class="path"><span class="category">${escape(t)}</span><div>${anchor(`/?topic=${encodeURIComponent(t)}#posts`, `Explore ${escape(t)} →`, ` data-topic-link="${escape(t)}"`)}</div></div>`).join("")}</div>${anchor("/#posts", "All notes →", ' class="more" data-all')}</section>`;
}
function sidebar(snapshot) {
  return `${topics(snapshot)}<section id="contact"><h2>Get in touch</h2><p>For a role, a technical question or a conversation about a project.</p><ul class="contact-links">${snapshot.site.contact.map((c) => `<li>${anchor(c.href, `${escape(c.label)} →`)}</li>`).join("")}</ul></section>`;
}
function footer() {
  return `<footer class="footer"><a href="/linkedin-editorial-scout-privacy">Privacy</a><div class="bottom-note"><p>Zacaria Chtatar · HaveSomeCode</p>${theme}</div></footer>`;
}
function document(title, description, path, content, snapshot, options) {
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escape(title)}</title><meta name="description" content="${escape(description)}" />
${options.preview ? '<meta name="robots" content="noindex, nofollow" />' : `<link rel="canonical" href="${ORIGIN}${escape(path)}" />`}
<meta property="og:type" content="${path === "/" ? "website" : "article"}" /><meta property="og:title" content="${escape(title)}" /><meta property="og:description" content="${escape(description)}" /><meta property="og:image" content="${ORIGIN}/assets/social-card.png" /><meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="/assets/favicon.ico" sizes="any" /><link rel="preload" href="/assets/fonts/instrument-serif-regular.woff2" as="font" type="font/woff2" crossorigin /><link rel="preload" href="/assets/fonts/geist-regular.woff2" as="font" type="font/woff2" crossorigin /><link rel="preload" href="/assets/fonts/geist-mono.woff2" as="font" type="font/woff2" crossorigin /><link rel="stylesheet" href="/assets/styles.css" />
<link rel="stylesheet" href="/appearance-fallback.css" />${options.preview ? "" : '<link rel="stylesheet" href="/api/appearance?target=site" />'}
<script src="/assets/theme-init.js"></script><script defer src="/assets/site.js"></script></head><body>
<a class="skip" href="#main-content">Skip to content</a><div class="outer"><div class="site">${options.preview ? '<p class="preview-banner" role="status">PRIVATE PREVIEW · Not published</p>' : ""}${header(snapshot, path !== "/")}<main id="main-content">${content}${sidebar(snapshot)}</main>${footer()}</div></div></body></html>\n`;
}
function noteDate(article) {
  return article.originalPublication?.publishedAt ?? article.publishedAt;
}
function time(date) {
  return `<time datetime="${escape(date)}">${escape(date.slice(0, 10))}</time>`;
}
function articleMeta(article, preview) {
  if (preview && !article.originalPublication) return "";
  return `<p class="article-meta">${time(noteDate(article))}${article.topics.length ? ` · ${escape(article.topics.join(", "))}` : ""}</p>`;
}
function row(article) {
  return `<li class="post" data-search="${escape(`${article.title} ${article.excerpt} ${article.topics.join(" ")}`)}" data-topics="${escape(JSON.stringify(article.topics))}">${anchor(`/blog/${article.slug}`, escape(article.title))}<span class="meta">${time(noteDate(article))}${article.topics.length ? ` · ${escape(article.topics.join(", "))}` : ""}</span></li>`;
}
function projects(snapshot) {
  if (!snapshot.projects.length) return "";
  return `<section class="products" id="projects"><h2>Personal projects</h2><div class="product-grid">${[
    ...snapshot.projects,
  ]
    .sort((a, b) => a.order - b.order)
    .map(
      (p) =>
        `<article class="product">${p.image ? `<img src="${escape(p.image)}" alt="" loading="lazy" />` : ""}<h3>${anchor(p.href, escape(p.title))}</h3><p>${escape(p.description)}</p>${sources[p.slug] ? anchor(sources[p.slug], "Source →", ` class="source-link" aria-label="View ${escape(p.title)} source"`) : ""}</article>`,
    )
    .join("")}</div></section>`;
}
function talk() {
  return `<section class="updates" id="speaking"><h2>Talks &amp; learning</h2><p class="section-label">HaveSome…</p><ul class="post-list"><li class="post"><a href="https://havesomecode.github.io/havesome-oidc/">HaveSome OIDC</a><span class="meta">Interactive guide · 2026</span><p>OAuth 2.0, OIDC and PKCE through a guided flow and a hands-on practice lab.</p></li><li class="post"><a href="https://zacaria.github.io/havesome-worktrees/">HaveSome Worktrees</a><span class="meta">Slides · 2026</span><p>Isolating and reviewing work with Git worktrees, AI agents and Codex.</p></li><li class="post"><a href="https://www.youtube.com/watch?v=eSo3e3ugn5g">Rust APIs</a><span class="meta">API Days Paris · 2023</span><p>Forget TypeScript. Choose Rust to build robust, fast, and cheap APIs.</p><a class="source-link" href="https://havesome-rust-apidays.surge.sh/" aria-label="View Rust APIs slides">Slides →</a></li></ul><a class="more" href="https://github.com/Zacaria/zacaria#links">All presentations →</a></section>`;
}
export function renderIndex(snapshot, options = {}) {
  validateSnapshot(snapshot);
  const articles = [...snapshot.articles].sort((a, b) =>
    noteDate(b).localeCompare(noteDate(a)),
  );
  const selected = snapshot.site.selectedSlugs.map((slug) =>
    articles.find((a) => a.slug === slug),
  );
  const notes = articles.length
    ? `<section id="posts"><h2 class="kicker" id="posts-label">LATEST NOTES:</h2><div class="searchbox"><label for="search" class="sr-only">Search published notes</label><input type="search" id="search" placeholder="Search published notes" /></div>${selected.map((a) => `<article class="featured" data-featured><span class="tag">FEATURED</span>${anchor(`/blog/${a.slug}`, escape(a.title))}<p>${escape(a.excerpt)}</p></article>`).join("")}<ul class="post-list">${articles.map(row).join("")}</ul><p class="empty" id="no-results" role="status" hidden>No matching notes. Clear the search or try another topic.</p><p id="result-count" class="sr-only" role="status"></p><a class="more" href="/#posts" data-all>See all notes →</a></section>`
    : "";
  const content = `<section class="about" id="about"><h2>Work &amp; approach</h2>${paragraphs(snapshot.site.bio)}</section>${projects(snapshot)}${talk()}${notes}`;
  return document(
    "Zacaria Chtatar — Lead Developer · HaveSomeCode",
    "Hands-on technical leadership, product architecture and production systems. Work, personal projects and talks by Zacaria Chtatar.",
    "/",
    content,
    snapshot,
    options,
  );
}
export function renderArticle(article, snapshot, options = {}) {
  validateSnapshot(snapshot);
  validateArticle(article);
  const content = `<article class="reading"><a href="/#posts">← All notes</a><p class="section-label">${options.preview ? "PRIVATE PREVIEW" : "NOTE"}</p><h1>${escape(article.title)}</h1>${articleMeta(article, options.preview)}<p class="lede">${escape(article.excerpt)}</p><div class="article-body">${renderArticleBody(article)}</div><a class="more" href="/#posts">Back to all notes →</a></article>`;
  return document(
    article.seo.title,
    article.seo.description,
    `/blog/${article.slug}`,
    content,
    snapshot,
    options,
  );
}
