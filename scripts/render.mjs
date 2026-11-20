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
const MISSION_HREF =
  "mailto:z@havesomecode.io?subject=Discutons%20de%20votre%20projet";
const CTA = `<a href="${MISSION_HREF}">Discutons de votre projet →</a>`;
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

// Line 01 is an example prospection line; L2/L3 are the other two offers.
// No client uses it yet: the caption says "exemple", never a case study.
// styles.css repeats this path for the moving signal and times each stop to it.
const route =
  "M40 200 H170 Q200 200 200 170 V90 Q200 60 230 60 H350 Q380 60 380 90 V130 Q380 160 410 160 H520";
const stops = [
  ["Apollo · contacts", 40, 200, "below"],
  ["Claude rédige", 200, 130, "left"],
  ["Vous validez", 290, 60, "above"],
  ["HubSpot relance", 380, 110, "right"],
  ["Votre appel", 520, 160, "end"],
];
function stop([label, x, y, side]) {
  const [tx, ty, anchorAt] = {
    below: [x - 8, y + 26, "start"],
    left: [x - 18, y + 4, "end"],
    above: [x, y - 18, "middle"],
    right: [x + 18, y + 4, "start"],
    end: [x + 8, y + 30, "end"],
  }[side];
  return `<g class="stop"><circle cx="${x}" cy="${y}" r="9" /><text x="${tx}" y="${ty}" text-anchor="${anchorAt}">${escape(label)}</text></g>`;
}
const lineMap = `<figure class="line-map"><figcaption><span>Ligne 01 · prospection</span><span class="line-status">Exemple de parcours</span></figcaption><svg viewBox="0 0 560 280" role="img" aria-label="Ligne 01, prospection : Apollo trouve les contacts, Claude rédige un premier message, vous validez, HubSpot envoie et relance, puis vous appelez."><path class="branch l3" d="M40 60 H230" /><text class="branch-label l3" x="40" y="46">L3 · administratif</text><path class="branch l2" d="M40 246 H370 Q400 246 405 210 L410 160" /><text class="branch-label l2" x="40" y="272">L2 · veille commerciale</text><circle class="junction" cx="230" cy="60" r="5" /><circle class="junction" cx="410" cy="160" r="5" /><path class="route" d="${route}" />${stops.map(stop).join("")}<circle class="signal" r="7" /></svg><ol class="line-log"><li><span>apollo</span> trouve les entreprises et les bons interlocuteurs</li><li><span>claude</span> rédige un premier message adapté à chacun</li><li><span>vous</span> relisez et validez avant tout envoi</li><li><span>hubspot</span> envoie, relance et garde l’historique</li><li><span>vous</span> appelez ceux qui ont répondu</li></ol></figure>`;

const interest = `<section class="interest" id="suivre"><h2>Un processus qui vous fait perdre du temps ?</h2><p>Je publie ce que j’apprends en regardant des processus réels de PME : ce qui se simplifie, ce qui ne vaut pas l’automatisation, ce que l’IA fait ou ne fait pas. Laissez votre courriel pour recevoir ces retours, et être prévenu si je prends de nouvelles missions de conseil.</p><form class="interest-form" method="post" action="https://interest.havesomecode.io/subscribe" data-interest><input type="hidden" name="source" value="landing" /><div class="field"><label for="interest-email">Votre courriel professionnel</label><input id="interest-email" type="email" name="email" autocomplete="email" placeholder="prenom@entreprise.fr" maxlength="254" required /></div><div class="trap" aria-hidden="true"><label>Ne pas remplir<input type="text" name="website" tabindex="-1" autocomplete="off" /></label></div><div class="consent"><input id="interest-consent" type="checkbox" name="consent" value="on" required /><label for="interest-consent">Je souhaite recevoir par courriel l’actualité de HaveSomeCode sur le conseil IA pour les PME.</label></div><button type="submit">Je veux suivre</button><p class="interest-note">Seule votre adresse est enregistrée, uniquement pour ces courriels. Un lien de désinscription figure dans chacun. Détails dans la <a href="/confidentialite">politique de confidentialité</a>.</p><p class="interest-status" role="status" data-interest-status></p></form></section>`;

const problems = [
  {
    line: "l1",
    name: "Prospection",
    title: "Des prospects prêts avant de décrocher le téléphone",
    text: "La recherche des entreprises, des bons interlocuteurs et le premier message se préparent sans vous. L’appel reste à vous, avec le contexte sous les yeux.",
    chain: [
      [
        "Apollo",
        "trouve les entreprises et les décideurs qui vous ressemblent",
      ],
      ["Claude", "rédige un premier message adapté à chacun"],
      ["Vous", "relisez et validez avant tout envoi"],
      ["HubSpot", "envoie, relance et note chaque réponse"],
    ],
  },
  {
    line: "l2",
    name: "Veille commerciale",
    title: "Des contacts à jour, une offre et des prix qui suivent le marché",
    text: "Changements de poste, nouveaux interlocuteurs, offres et tarifs des concurrents : l’information remonte d’elle-même, et vous voyez quand repositionner votre offre ou revoir un prix.",
    chain: [
      ["Apollo", "signale les changements de poste et les nouveaux décideurs"],
      ["HubSpot", "met les fiches contacts à jour"],
      ["ChatGPT", "résume les offres et les prix de vos concurrents"],
      ["Notion", "rassemble la veille dans une note par semaine"],
    ],
  },
  {
    line: "l3",
    name: "Administratif",
    title:
      "Votre chiffre d’affaires et votre trésorerie, sans tableur à remplir",
    text: "Factures émises, paiements reçus, retards : tout est regroupé automatiquement. Vous savez où en est le mois et ce qui rentre dans les semaines qui viennent.",
    chain: [
      ["Facturation", "votre logiciel exporte factures et paiements"],
      ["Claude", "rapproche les paiements et repère les retards"],
      [
        "Notion",
        "tient le tableau de bord du chiffre d’affaires et de la trésorerie",
      ],
      ["Vous", "recevez le point de la semaine"],
    ],
  },
];
const services = `<section class="services" id="services"><h2>Ce que j’automatise</h2>${problems
  .map(
    (p) =>
      `<article class="problem ${p.line}"><div class="problem-text"><p class="line-name">${p.name}</p><h3>${escape(p.title)}</h3><p>${escape(p.text)}</p></div><ol class="chain" aria-label="Outils branchés : ${escape(p.name)}">${p.chain.map(([tool, does]) => `<li><span class="tool">${escape(tool)}</span> ${escape(does)}</li>`).join("")}</ol></article>`,
  )
  .join("")}</section>`;

const steps = [
  [
    "Partir de votre flux réel",
    "On suit ensemble la dernière demande ou commande, de bout en bout, avec la personne qui la traite.",
  ],
  [
    "Un premier cas",
    "Une seule tâche, un périmètre limité, des critères de réussite fixés avant de commencer et un retour arrière possible.",
  ],
  [
    "Mesurer",
    "Quelqu’un de votre équipe l’utilise pour de vrai. On mesure le temps gagné, les erreurs et ce qui reste à faire à la main.",
  ],
  [
    "Mettre en service",
    "Si le résultat tient, le flux passe en service. Je le suis et le corrige, ou je le transmets à votre équipe.",
  ],
];
const method = `<section class="method" id="methode"><h2>Comment on travaille</h2><ol class="method-steps">${steps.map(([title, text]) => `<li class="method-step"><h3>${escape(title)}</h3><p>${escape(text)}</p></li>`).join("")}</ol><p class="method-note">Parfois, la bonne réponse est une fonction déjà présente dans votre logiciel, ou de ne rien automatiser : je vous le dis. Rien ne part chez un client, rien n’est payé ni signé sans votre validation, et vos accès restent les vôtres.</p></section>`;

const mission = `<section class="mission" id="mission"><h2>Une tâche vous prend trop de temps ?</h2><p>Décrivez-la en quelques lignes. Je vous réponds par e-mail et on en parle 30 minutes, sans engagement.</p><p class="quick-links">${CTA}</p></section>`;

const sources = {
  float: "https://github.com/Zacaria/float",
  pathfinding: "https://github.com/Zacaria/pathfinding-client",
  "kibana-mcp": "https://github.com/Havesomecode/kibana-mcp-server",
};
function availableLink(href, snapshot) {
  if (["/blog", "/#posts", "/#search"].includes(href))
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
  return `<header id="top">${article ? '<p class="author">Zacaria Chtatar · HaveSomeCode</p>' : `<div class="hero"><div class="pitch"><p class="role">Zacaria Chtatar · automatisations IA pour les PME</p><h1>Du temps pour vendre, <em>pas pour recopier.</em></h1><p class="intro">Je branche l’IA sur les outils que vous utilisez déjà (HubSpot, Notion, Apollo, Claude, ChatGPT) pour automatiser la prospection, la mise à jour de vos contacts et le suivi du chiffre d’affaires et de la trésorerie. Vous validez ce qui part chez un client ; le reste se fait sans ressaisie.</p><p class="quick-links">${CTA}</p><p class="conditions">Premier échange de 30 minutes offert, sur une tâche précise de votre entreprise.</p></div>${lineMap}</div>`}<div class="topline"><p class="brand-line"><a href="/">HAVESOMECODE</a></p><nav aria-label="Navigation principale">${navigation}</nav></div></header>`;
}
function topics(snapshot) {
  const all = [...new Set(snapshot.articles.flatMap((a) => a.topics))].sort();
  if (!all.length) return "";
  return `<section id="topics"><h2>Sujets</h2><div class="paths">${all.map((t) => `<div class="path"><span class="category">${escape(t)}</span><div>${anchor(`/?topic=${encodeURIComponent(t)}#posts`, `Explorer ${escape(t)} →`, ` data-topic-link="${escape(t)}"`)}</div></div>`).join("")}</div>${anchor("/#posts", "Toutes les notes →", ' class="more" data-all')}</section>`;
}
function sidebar(snapshot) {
  return `${topics(snapshot)}<section id="contact"><h2>Parlons de votre projet</h2><p>Une prospection à automatiser, des contacts à tenir à jour, un reporting à monter : décrivez votre besoin, je vous réponds.</p><p>Écrivez-moi à <a href="mailto:z@havesomecode.io">z@havesomecode.io</a>.</p><ul class="contact-links">${snapshot.site.contact.map((c) => `<li>${anchor(c.href, `${escape(c.label)} →`)}</li>`).join("")}</ul></section>`;
}
function footer() {
  return `<footer class="footer"><a href="/confidentialite">Confidentialité</a><div class="bottom-note"><p>Zacaria Chtatar · HaveSomeCode</p>${theme}</div></footer>`;
}
// Cloudflare Web Analytics, public pages only (previews stay out).
const analyticsSnippet =
  '<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon=\'{"token": "04f11759a0bd40a5900231a4e43dc019"}\'></script>';

function document(title, description, path, content, snapshot, options) {
  return `<!doctype html>
<html lang="fr"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escape(title)}</title><meta name="description" content="${escape(description)}" />
${options.preview ? '<meta name="robots" content="noindex, nofollow" />' : `<link rel="canonical" href="${ORIGIN}${escape(path)}" />`}
<meta property="og:type" content="${path === "/" ? "website" : "article"}" /><meta property="og:title" content="${escape(title)}" /><meta property="og:description" content="${escape(description)}" /><meta property="og:image" content="${ORIGIN}/assets/social-card.png" /><meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="/assets/favicon.ico" sizes="any" /><link rel="preload" href="/assets/fonts/instrument-serif-regular.woff2" as="font" type="font/woff2" crossorigin /><link rel="preload" href="/assets/fonts/geist-regular.woff2" as="font" type="font/woff2" crossorigin /><link rel="preload" href="/assets/fonts/geist-mono.woff2" as="font" type="font/woff2" crossorigin /><link rel="stylesheet" href="/assets/styles.css" />
<link rel="stylesheet" href="/appearance-fallback.css" />${options.preview ? "" : '<link rel="stylesheet" href="/api/appearance?target=site" />'}
<script src="/assets/theme-init.js"></script><script defer src="/assets/site.js"></script><script defer src="/assets/interest.js"></script>${options.preview ? "" : analyticsSnippet}</head><body>
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
    ? `<section id="posts"><h2 class="kicker" id="posts-label">DERNIÈRES NOTES :</h2><div class="searchbox"><label for="search" class="sr-only">Rechercher dans les notes</label><input type="search" id="search" placeholder="Rechercher dans les notes" /></div>${selected.map((a) => `<article class="featured" data-featured><span class="tag">À LA UNE</span>${anchor(`/blog/${a.slug}`, escape(a.title))}<p>${escape(a.excerpt)}</p></article>`).join("")}<ul class="post-list">${articles.map(row).join("")}</ul><p class="empty" id="no-results" role="status" hidden>Aucune note ne correspond. Videz la recherche ou essayez un autre sujet.</p><p id="result-count" class="sr-only" role="status"></p><a class="more" href="/blog">Voir toutes les notes →</a></section>`
    : "";
  const content = `${services}${method}${mission}${interest}<section class="about" id="about"><h2>Qui intervient</h2><p class="who">Zacaria Chtatar · lead developer et architecte · France</p><p>${escape(snapshot.site.intro)}</p>${paragraphs(snapshot.site.bio)}<p><a href="https://cv.havesomecode.io/">Lire mon CV →</a></p></section>${projects(snapshot)}${talk()}${notes}`;
  return document(
    "HaveSomeCode — Automatisations IA pour les PME · Zacaria Chtatar",
    "Prospection automatisée, contacts à jour, suivi du chiffre d’affaires et de la trésorerie : Zacaria Chtatar branche l’IA sur vos outils (HubSpot, Notion, Apollo, Claude, ChatGPT).",
    "/",
    content,
    snapshot,
    options,
  );
}
export function renderBlogIndex(snapshot) {
  validateSnapshot(snapshot);
  const articles = [...snapshot.articles].sort((a, b) =>
    noteDate(b).localeCompare(noteDate(a)),
  );
  const content = `<section class="reading blog-index"><p class="section-label">NOTES</p><h1>Blog</h1><p class="lede">Ce que j’apprends en construisant des API, des agents et des équipes.</p><ul class="post-list">${articles.map((a) => `<li class="post">${anchor(`/blog/${a.slug}`, escape(a.title))}<span class="meta">${time(noteDate(a))}</span><p>${escape(a.excerpt)}</p></li>`).join("")}</ul></section>`;
  return document(
    "Blog · Zacaria Chtatar · HaveSomeCode",
    "Notes de Zacaria Chtatar sur les API, l’observabilité et les agents de code.",
    "/blog",
    content,
    snapshot,
    {},
  );
}
export function renderArticle(article, snapshot, options = {}) {
  validateSnapshot(snapshot);
  validateArticle(article);
  const content = `<article class="reading"><a href="/blog">← Toutes les notes</a><p class="section-label">${options.preview ? "APERÇU PRIVÉ" : "NOTE"}</p><h1>${escape(article.title)}</h1>${articleMeta(article, options.preview)}<p class="lede">${escape(article.excerpt)}</p><div class="article-body">${renderArticleBody(article)}</div><a class="more" href="/blog">Retour à toutes les notes →</a></article>`;
  return document(
    article.seo.title,
    article.seo.description,
    `/blog/${article.slug}`,
    content,
    snapshot,
    options,
  );
}
