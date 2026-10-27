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
const theme = `<div class="theme-control" role="group" aria-label="Apparence"><span class="theme-label">Thème :</span><div class="theme-options">${[
  ["light", "Clair"],
  ["dark", "Sombre"],
  ["system", "Auto"],
]
  .map(
    ([mode, label]) =>
      `<button type="button" class="theme-choice" data-mode="${mode}" aria-pressed="false"${mode === "system" ? ' aria-label="Auto : suivre le thème de l’appareil"' : ""}>${label}</button>`,
  )
  .join("")}</div></div>`;

// Line 01 is the real Club Med workflow; L2/L3 are service lines, not case studies.
// styles.css repeats this path for the moving signal and times each stop to it.
const route =
  "M40 200 H170 Q200 200 200 170 V90 Q200 60 230 60 H350 Q380 60 380 90 V130 Q380 160 410 160 H520";
const stops = [
  ["Ticket « ai-ready »", 40, 200, "below"],
  ["CI déclenchée", 200, 130, "left"],
  ["Agent au travail", 290, 60, "above"],
  ["Pull request", 380, 110, "right"],
  ["Revue humaine", 520, 160, "end"],
];
function stop([label, x, y, side]) {
  const [tx, ty, anchorAt] = {
    below: [x - 8, y + 26, "start"],
    left: [x - 18, y + 4, "end"],
    above: [x, y - 18, "middle"],
    right: [x + 18, y + 4, "start"],
    end: [x + 8, y - 18, "end"],
  }[side];
  return `<g class="stop"><circle cx="${x}" cy="${y}" r="9" /><text x="${tx}" y="${ty}" text-anchor="${anchorAt}">${escape(label)}</text></g>`;
}
const lineMap = `<figure class="line-map"><figcaption><span>Ligne 01 · du ticket à la pull request</span><span class="line-status">Réalisée chez Club Med</span></figcaption><svg viewBox="0 0 560 280" role="img" aria-label="Ligne 01 : un ticket marqué ai-ready déclenche la CI, un agent développe, ouvre une pull request, puis un humain relit."><path class="branch l3" d="M40 60 H230" /><text class="branch-label l3" x="40" y="46">L3 · formation</text><path class="branch l2" d="M40 246 H370 Q400 246 405 210 L410 160" /><text class="branch-label l2" x="40" y="272">L2 · logs, docs, API</text><circle class="junction" cx="230" cy="60" r="5" /><circle class="junction" cx="410" cy="160" r="5" /><path class="route" d="${route}" />${stops.map(stop).join("")}<circle class="signal" r="7" /></svg><ol class="line-log"><li><span>jira</span> ticket marqué ai-ready</li><li><span>circleci</span> job lancé</li><li><span>agent</span> lit le ticket, écrit le code</li><li><span>github</span> pull request ouverte</li><li><span>humain</span> relit et commente, l’agent corrige</li></ol></figure>`;
const services = `<section class="services" id="services"><h2>Trois lignes de service</h2><ol class="service-lines"><li class="l1"><p class="line-name">L1 · Installer</p><h3>Choisir et installer</h3><p>Assistants, agents de code et outils internes : choisis pour votre contexte, configurés, sécurisés et documentés.</p></li><li class="l2"><p class="line-name">L2 · Connecter</p><h3>Construire les workflows</h3><p>Des agents branchés sur vos tickets, vos logs, vos documents et vos API, avec une revue humaine à chaque étape qui compte.</p></li><li class="l3"><p class="line-name">L3 · Former</p><h3>Rendre les équipes autonomes</h3><p>Des ateliers sur vos cas réels, pour que l’usage tienne dans la durée.</p></li></ol></section>`;

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
  return `<header id="top">${article ? '<p class="author">Zacaria Chtatar · HaveSomeCode</p>' : `<div class="hero"><div class="pitch"><p class="role">Agents IA · workflows agentiques · accompagnement</p><h1>Mettre l’IA <em>au travail.</em></h1><p class="intro">J’installe les bons outils, je les connecte à votre quotidien et je construis les agents qui prennent en charge le travail répétitif. Puis je forme vos équipes à s’en servir.</p><p class="quick-links"><a href="/#contact">Parler de votre projet →</a><a href="/#services">Voir les services →</a></p></div>${lineMap}</div>`}<div class="topline"><p class="brand-line"><a href="/">HAVESOMECODE</a></p><nav aria-label="Navigation principale">${navigation}</nav></div></header>`;
}
function topics(snapshot) {
  const all = [...new Set(snapshot.articles.flatMap((a) => a.topics))].sort();
  if (!all.length) return "";
  return `<section id="topics"><h2>Sujets</h2><div class="paths">${all.map((t) => `<div class="path"><span class="category">${escape(t)}</span><div>${anchor(`/?topic=${encodeURIComponent(t)}#posts`, `Explorer ${escape(t)} →`, ` data-topic-link="${escape(t)}"`)}</div></div>`).join("")}</div>${anchor("/#posts", "Toutes les notes →", ' class="more" data-all')}</section>`;
}
function sidebar(snapshot) {
  return `${topics(snapshot)}<section id="contact"><h2>Parlons de votre projet</h2><p>Un outil à installer, un workflow à automatiser, une équipe à former : décrivez votre besoin, je vous réponds.</p><ul class="contact-links">${snapshot.site.contact.map((c) => `<li>${anchor(c.href, `${escape(c.label)} →`)}</li>`).join("")}</ul></section>`;
}
function footer() {
  return `<footer class="footer"><a href="/linkedin-editorial-scout-privacy">Confidentialité</a><div class="bottom-note"><p>Zacaria Chtatar · HaveSomeCode</p>${theme}</div></footer>`;
}
function document(title, description, path, content, snapshot, options) {
  return `<!doctype html>
<html lang="fr"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escape(title)}</title><meta name="description" content="${escape(description)}" />
${options.preview ? '<meta name="robots" content="noindex, nofollow" />' : `<link rel="canonical" href="${ORIGIN}${escape(path)}" />`}
<meta property="og:type" content="${path === "/" ? "website" : "article"}" /><meta property="og:title" content="${escape(title)}" /><meta property="og:description" content="${escape(description)}" /><meta property="og:image" content="${ORIGIN}/assets/social-card.png" /><meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="/assets/favicon.ico" sizes="any" /><link rel="preload" href="/assets/fonts/instrument-serif-regular.woff2" as="font" type="font/woff2" crossorigin /><link rel="preload" href="/assets/fonts/geist-regular.woff2" as="font" type="font/woff2" crossorigin /><link rel="preload" href="/assets/fonts/geist-mono.woff2" as="font" type="font/woff2" crossorigin /><link rel="stylesheet" href="/assets/styles.css" />
<link rel="stylesheet" href="/appearance-fallback.css" />${options.preview ? "" : '<link rel="stylesheet" href="/api/appearance?target=site" />'}
<script src="/assets/theme-init.js"></script><script defer src="/assets/site.js"></script></head><body>
<a class="skip" href="#main-content">Aller au contenu</a><div class="outer"><div class="site">${options.preview ? '<p class="preview-banner" role="status">APERÇU PRIVÉ · Non publié</p>' : ""}${header(snapshot, path !== "/")}<main id="main-content">${content}${sidebar(snapshot)}</main>${footer()}</div></div></body></html>\n`;
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
  return `<section class="products" id="projects"><h2>Projets personnels</h2><div class="product-grid">${[
    ...snapshot.projects,
  ]
    .sort((a, b) => a.order - b.order)
    .map(
      (p) =>
        `<article class="product">${p.image ? `<img src="${escape(p.image)}" alt="" loading="lazy" />` : ""}<h3>${anchor(p.href, escape(p.title))}</h3><p>${escape(p.description)}</p>${sources[p.slug] ? anchor(sources[p.slug], "Source →", ` class="source-link" aria-label="Voir la source de ${escape(p.title)}"`) : ""}</article>`,
    )
    .join("")}</div></section>`;
}
function talk() {
  return `<section class="updates" id="speaking"><h2>Conférences &amp; apprentissage</h2><p class="section-label">HaveSome…</p><ul class="post-list"><li class="post"><a href="https://havesomecode.github.io/havesome-oidc/">HaveSome OIDC</a><span class="meta">Guide interactif · 2026</span><p>OAuth 2.0, OIDC et PKCE à travers un parcours guidé et un laboratoire pratique.</p></li><li class="post"><a href="https://zacaria.github.io/havesome-worktrees/">HaveSome Worktrees</a><span class="meta">Slides · 2026</span><p>Isoler et relire le travail avec les worktrees Git, les agents IA et Codex.</p></li><li class="post"><a href="https://www.youtube.com/watch?v=eSo3e3ugn5g">Rust APIs</a><span class="meta">API Days Paris · 2023</span><p>Oubliez TypeScript : Rust pour construire des API robustes, rapides et économiques.</p><a class="source-link" href="https://havesome-rust-apidays.surge.sh/" aria-label="Voir les slides Rust APIs">Slides →</a></li></ul><a class="more" href="https://github.com/Zacaria/zacaria#links">Toutes les présentations →</a></section>`;
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
    ? `<section id="posts"><h2 class="kicker" id="posts-label">DERNIÈRES NOTES :</h2><div class="searchbox"><label for="search" class="sr-only">Rechercher dans les notes</label><input type="search" id="search" placeholder="Rechercher dans les notes" /></div>${selected.map((a) => `<article class="featured" data-featured><span class="tag">À LA UNE</span>${anchor(`/blog/${a.slug}`, escape(a.title))}<p>${escape(a.excerpt)}</p></article>`).join("")}<ul class="post-list">${articles.map(row).join("")}</ul><p class="empty" id="no-results" role="status" hidden>Aucune note ne correspond. Videz la recherche ou essayez un autre sujet.</p><p id="result-count" class="sr-only" role="status"></p><a class="more" href="/#posts" data-all>Voir toutes les notes →</a></section>`
    : "";
  const content = `${services}<section class="about" id="about"><h2>Qui intervient</h2><p class="who">Zacaria Chtatar · lead developer et architecte · France</p><p>${escape(snapshot.site.intro)}</p>${paragraphs(snapshot.site.bio)}<p><a href="https://cv.havesomecode.io/">Lire mon CV →</a></p></section>${projects(snapshot)}${talk()}${notes}`;
  return document(
    "HaveSomeCode — Mettre l’IA au travail · Zacaria Chtatar",
    "Installation d’outils IA, agents et workflows agentiques connectés à vos outils, formation des équipes. Par Zacaria Chtatar, lead developer et architecte.",
    "/",
    content,
    snapshot,
    options,
  );
}
export function renderArticle(article, snapshot, options = {}) {
  validateSnapshot(snapshot);
  validateArticle(article);
  const content = `<article class="reading"><a href="/#posts">← Toutes les notes</a><p class="section-label">${options.preview ? "APERÇU PRIVÉ" : "NOTE"}</p><h1>${escape(article.title)}</h1>${articleMeta(article, options.preview)}<p class="lede">${escape(article.excerpt)}</p><div class="article-body">${renderArticleBody(article)}</div><a class="more" href="/#posts">Retour à toutes les notes →</a></article>`;
  return document(
    article.seo.title,
    article.seo.description,
    `/blog/${article.slug}`,
    content,
    snapshot,
    options,
  );
}
