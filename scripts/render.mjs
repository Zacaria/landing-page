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
const separator = '<div class="separator" aria-hidden="true">~~~</div>';
const sources = [
  ["Float source", "https://github.com/Zacaria/float"],
  ["Pathfinding source", "https://github.com/Zacaria/pathfinding-client"],
  ["Kibana MCP source", "https://github.com/Havesomecode/kibana-mcp-server"],
];
function header(snapshot, article) {
  return `<div class="announcement"><a href="/#projects">SOFTWARE, SIDE PROJECTS &amp; QUESTIONS WORTH FOLLOWING →</a><p>${escape(snapshot.site.intro)}</p></div>
  <div class="rail-mobile"><span>MY PROJECTS</span>${snapshot.projects
    .filter((p) => p.featured)
    .map((p) => anchor(p.href, escape(p.title)))
    .join("")}</div>
  <header id="top"><div class="identity">${article ? '<p class="brand-line">' : "<h1>"}<a href="/">HAVESOMECODE<span class="cursor" aria-hidden="true"></span></a>${article ? "</p>" : "</h1>"}<p class="domain">havesomecode.io</p><p class="author">Zacaria Chtatar / Lead Developer</p></div><nav aria-label="Main navigation">${snapshot.navigation
    .filter((n) => n.visible)
    .sort((a, b) => a.order - b.order)
    .map((n) => anchor(n.href, `[ ${escape(n.label.toUpperCase())} ]`))
    .join("")}</nav></header>`;
}
function topics(snapshot) {
  const all = [...new Set(snapshot.articles.flatMap((a) => a.topics))].sort();
  return `<section id="topics"><h2>PICK SOMETHING<br />TO EXPLORE</h2><p class="description">A few starting points for understanding and building software.</p><div class="paths">${all.length ? all.map((t) => `<div class="path"><span class="category">${escape(t)}</span><div>${anchor(`/?topic=${encodeURIComponent(t)}#posts`, `Explore ${escape(t)} →`, ` data-topic-link="${escape(t)}"`)}</div></div>`).join("") : '<p class="empty">Topics will appear with published notes.</p>'}</div>${anchor("/#posts", "All notes →", ' class="more" data-all')}</section>`;
}
function sidebar(snapshot) {
  return `<aside class="right" aria-label="Topics, About and contact">${topics(snapshot)}${separator}<section class="about" id="about"><h2>HI, I'M ZACARIA.</h2>${paragraphs(snapshot.site.bio)}<a href="https://cv.havesomecode.io/">Read my CV →</a></section>${separator}<section id="contact"><h2>KEEP IN TOUCH</h2><p>If something here made you curious, come say hello.</p><p>Whether it’s about work, an idea, a question, or simply a conversation, I’d be happy to hear from you.</p><ul class="contact-links">${snapshot.site.contact.map((c) => `<li>${anchor(c.href, `${escape(c.label)} →`)}</li>`).join("")}</ul></section></aside>`;
}
function rail(snapshot) {
  return `<aside class="project-rail" aria-label="Selected projects"><p class="rail-heading">SELECTED PROJECTS</p>${snapshot.projects
    .filter((p) => p.featured)
    .sort((a, b) => a.order - b.order)
    .map(
      (p) =>
        `<a class="rail-card" href="${escape(p.href)}"><span class="rail-tag">MY PROJECT</span><div class="rail-symbol" aria-hidden="true">&gt;_</div><strong>${escape(p.title)}</strong><p>${escape(p.description)}</p></a>`,
    )
    .join("")}</aside>`;
}
function footer() {
  return `<footer class="footer"><div><strong>EXPLORE</strong><a href="/#posts">Notes</a><a href="/#search">Search</a><a href="/#topics">Topics</a></div><div><strong>MAKE &amp; TRY</strong><a href="/#projects">Projects</a><a href="/#thinking">Questions</a><a href="/#speaking">Talks</a></div><div><strong>CONNECT</strong><a href="https://cv.havesomecode.io/">CV</a><a href="https://github.com/Zacaria">GitHub</a><a href="/linkedin-editorial-scout-privacy">Editorial scout privacy</a></div><div class="bottom-note"><p>Zacaria Chtatar · HaveSomeCode</p>${theme}</div></footer>`;
}
function document(title, description, path, content, snapshot, options) {
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escape(title)}</title><meta name="description" content="${escape(description)}" />
${options.preview ? '<meta name="robots" content="noindex, nofollow" />' : `<link rel="canonical" href="${ORIGIN}${escape(path)}" />`}
<meta property="og:type" content="${path === "/" ? "website" : "article"}" /><meta property="og:title" content="${escape(title)}" /><meta property="og:description" content="${escape(description)}" /><meta property="og:image" content="${ORIGIN}/assets/social-card.png" /><meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="/assets/favicon.ico" sizes="any" /><link rel="preload" href="/assets/fonts/geist-mono.woff2" as="font" type="font/woff2" crossorigin /><link rel="stylesheet" href="/assets/styles.css" />
<script src="/assets/theme-init.js"></script><script defer src="/assets/site.js"></script></head><body>
<a class="skip" href="#main-content">Skip to content</a><div class="outer"><div class="site">${options.preview ? '<p class="preview-banner" role="status">PRIVATE PREVIEW · Not published</p>' : ""}${header(snapshot, path !== "/")}<main id="main-content">${content}${sidebar(snapshot)}</main>${footer()}</div>${rail(snapshot)}</div></body></html>\n`;
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
  return `<section class="products" id="projects">${separator}<p class="section-label">PROJECTS</p><h2>THINGS I MADE BECAUSE I WANTED THEM TO EXIST.</h2><p>Some started with a practical annoyance. Others began with a question I wanted to see moving.</p><div class="subhead">TOOLS &amp; EXPERIMENTS</div><div class="product-grid">${[
    ...snapshot.projects,
  ]
    .sort((a, b) => a.order - b.order)
    .map(
      (p) =>
        `<a class="product" href="${escape(p.href)}">${p.image ? `<img src="${escape(p.image)}" alt="" loading="lazy" />` : '<span class="appicon" aria-hidden="true">&gt;_</span>'}<span class="product-name">${escape(p.title)}</span><p>${escape(p.description)}</p></a>`,
    )
    .join(
      "",
    )}</div><div class="project-sources">${sources.map(([label, href]) => anchor(href, escape(label))).join(" · ")}</div><p class="more">These are only the tidier ones. <a href="https://github.com/Zacaria">Everything else is on GitHub →</a></p></section>`;
}
function questions() {
  return `<section id="thinking">${separator}<h2 class="kicker">THE QUESTIONS ARE OFTEN MORE INTERESTING THAN THE TOOLS.</h2><p>I tend to circle around the same ideas, whether I’m debugging a system or starting a side project.</p><dl class="questions">${[
    [
      "What is really happening?",
      "I like tracing a problem through the whole system before deciding which part deserves to change.",
    ],
    [
      "Can we make it click?",
      "I enjoy finding the diagram, example, or name that makes a complicated idea easier to carry.",
    ],
    [
      "Who needs to understand this?",
      "Software becomes useful when the people around it can reason about it, question it, and change it.",
    ],
    [
      "What happens if we test it?",
      "I would rather give an idea a fair experiment than argue about it in the abstract for too long.",
    ],
  ]
    .map(([q, a]) => `<dt>${escape(q)}</dt><dd>${escape(a)}</dd>`)
    .join(
      "",
    )}</dl><blockquote>“I have a weakness for good names. The right one can make an API contract, a meeting, or a half-formed idea suddenly click.”</blockquote></section>`;
}
function talk() {
  return `<section class="updates" id="speaking">${separator}<h2 class="kicker">TALKS &amp; EXPLANATIONS:</h2><ul class="post-list"><li class="post"><a href="https://www.youtube.com/watch?v=eSo3e3ugn5g">Forget TypeScript. Choose Rust to build robust, fast, and cheap APIs.</a><span class="meta">API Days Paris · 2023</span></li></ul><p>I like the moment an idea finally makes sense to someone else. This talk was my practical argument for using Rust where API reliability, performance, and cost matter.</p></section>`;
}
export function renderIndex(snapshot, options = {}) {
  validateSnapshot(snapshot);
  const articles = [...snapshot.articles].sort((a, b) =>
    noteDate(b).localeCompare(noteDate(a)),
  );
  const selected = snapshot.site.selectedSlugs.map((slug) =>
    articles.find((a) => a.slug === slug),
  );
  const content = `<div class="left"><div class="searchbox"><label for="search" class="sr-only">Search published notes</label><input type="search" id="search" placeholder="Search notes, tools and experiments" /></div><section id="posts">${separator}<h2 class="kicker" id="posts-label">LATEST NOTES:</h2>${selected.map((a) => `<article class="featured" data-featured><span class="tag">FEATURED</span>${anchor(`/blog/${a.slug}`, escape(a.title))}<p>${escape(a.excerpt)}</p></article>`).join("")}<ul class="post-list">${articles.map(row).join("")}</ul><p class="empty" id="no-articles"${articles.length ? " hidden" : ""}>No notes published yet. In the meantime, explore the projects and talk below.</p><p class="empty" id="no-results" role="status" hidden>No matching notes. Clear the search or try another topic.</p><p id="result-count" class="sr-only" role="status"></p><a class="more" href="/#posts" data-all>See all notes →</a></section>${projects(snapshot)}${talk()}${questions()}</div>`;
  return document(
    "HaveSomeCode — Zacaria Chtatar",
    "Software, side projects, talks, and questions worth following.",
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
