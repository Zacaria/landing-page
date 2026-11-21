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

const homepageCopy = [
  [
    "Développeur, j'aide les entreprises à mettre l'IA au travail.",
    "Bienvenue sur mon site. Vous y trouvez mon accompagnement pour les entreprises qui veulent y voir clair sur l'IA, mais aussi des guides pour apprendre, mes notes de travail et mes projets personnels.",
    "Accompagnement : 30 minutes pour en parler, sans engagement. Je ne vends pas de logiciel.",
  ],
  [
    "Un agent, c'est un assistant qui fait le travail à côté de vous",
    "Vous lui expliquez une tâche, comme à un nouveau collègue : \"quand un client écrit, cherche sa commande, réponds-lui\". Il utilise alors vos outils habituels (messagerie, tableur, logiciel de facturation) et fait le travail à votre place. Pour tout ce qui engage l'entreprise, il vous demande avant d'agir.",
  ],
  [
    "Mélanie passe sa semaine à recopier des fiches",
    "Mélanie est indépendante en développement commercial. Pour trouver des clients, elle ne fait pas que téléphoner : elle cherche des entreprises dans Apollo, les range dans Notion, suit les échanges dans HubSpot, et demande à Claude et ChatGPT de rédiger ses messages. Tout en versions gratuites, donc cinq outils qui ne se parlent pas. Mardi, 21 h : elle recopie encore des noms d'un outil à l'autre. Ce temps-là, elle ne le passe pas avec un prospect.",
    "L'agent cherche les entreprises qui correspondent à ce que Mélanie vend, les range au même endroit et prépare un brouillon de message pour chacune. Mélanie lit, corrige, et c'est elle qui envoie. Le lendemain, elle ouvre un seul outil et sait qui rappeler.",
    "Vous allez me dire : \"mes prospects ne veulent pas de messages automatiques\". Ils n'en reçoivent pas. L'agent prépare, Mélanie relit et signe chaque message. Le téléphone reste son meilleur outil, l'agent s'occupe de ce qui l'entoure.",
  ],
  [
    "Le devis est parti avec l'ancien prix",
    "Hélène dirige une petite entreprise qui pose des cuisines. Ses fournisseurs lui envoient leurs nouveaux tarifs par mail, en PDF. Jeudi, 17 h : un client demande un devis, et personne ne sait si la liste de prix du tableur est la dernière. Un devis au mauvais prix, c'est soit une marge perdue, soit un client à rappeler pour s'excuser.",
    'Quand un fournisseur envoie un nouveau tarif, l\'agent lit le document, met à jour la liste de prix et signale à Hélène ce qui a changé : "3 références ont augmenté". Même chose pour les coordonnées : si un contact change de numéro dans un mail, la fiche est corrigée.',
    "Vous allez me dire : \"et s'il se trompe de ligne ?\" Chaque changement est listé avec l'ancien et le nouveau prix, et Hélène valide avant qu'il serve dans un devis. Un agent peut se tromper, c'est pour cela que vous gardez la dernière main.",
  ],
  [
    "Où en est la trésorerie ? Je regarde quel fichier est le bon",
    "Patrick dirige un bureau d'études de huit personnes. Pour savoir où en est l'entreprise, il doit ouvrir l'outil de facturation, la banque, et un tableur qu'une collègue met à jour quand elle a le temps. Le 28 du mois, 8 h 30 : il hésite à valider une dépense, parce qu'il ne sait pas si les deux factures en retard ont été payées.",
    "L'agent rassemble les factures, les paiements reçus et les dépenses prévues, et affiche une page simple : ce qui est rentré ce mois-ci, ce qui est en retard, ce qui reste sur le compte dans trente jours. Plus de tableur à ouvrir ni de collègue à déranger. Patrick lit un écran, pas des lignes.",
    'Vous allez me dire : "mes chiffres sont confidentiels". Ils le restent : l\'agent lit seulement ce que vous lui ouvrez, et vous décidez où les données sont stockées. On en parle avant de commencer, pas après.',
  ],
  [
    "On commence par parler, pas par installer",
    "Trois étapes, et vous pouvez vous arrêter après chacune.",
  ],
  [
    "Zacaria Chtatar, développeur",
    "Je construis des logiciels depuis 2013, et je dirige des équipes techniques depuis 2018. Depuis 2020, je suis lead développeur chez Club Med, sur la plateforme qui alimente leurs applications, où j'ai mis en production trois agents pour des tâches de diagnostic et de développement. Je suis indépendant et je travaille depuis la France.",
  ],
  [
    "Parlons de votre tâche qui prend trop de temps",
    "Écrivez-moi en deux lignes ce qui vous fait perdre du temps. Je vous réponds pour fixer un appel de trente minutes.",
  ],
];
const siteMap = [
  [
    "Conseil IA",
    "Mettre un assistant au travail dans votre entreprise",
    "#agent",
  ],
  [
    "Guides",
    "Go, GitOps, Kubernetes, mémoire des agents : comprendre pas à pas",
    "#projects",
  ],
  [
    "Notes",
    "Ce que j'apprends en construisant, noté au fil de l'eau",
    "#posts",
  ],
  [
    "Projets",
    "Des outils que je construis pour moi : Kibana MCP, Pathfinding, Float",
    "#projects",
  ],
];
const homepageSteps = [
  [
    "Trente minutes au téléphone.",
    "Vous me décrivez une tâche qui vous fait perdre du temps. Je pose des questions, je ne vends rien. Il est possible que ma réponse soit : ne changez rien.",
  ],
  [
    "Un diagnostic.",
    "Je regarde comment la tâche se fait vraiment, avec la personne qui la fait. Je vous remets une page : ce qui peut être simplifié, et comment. Parfois, un réglage dans votre logiciel actuel suffit.",
  ],
  [
    "Un essai sur une seule tâche.",
    "Une personne de votre équipe l'utilise, nous mesurons ce qui change, et vous décidez de continuer ou d'arrêter.",
  ],
];

const interest = `<section class="interest" id="suivre"><h2>Un processus qui vous fait perdre du temps ?</h2><p>Je publie ce que j’apprends en regardant des processus réels de PME : ce qui se simplifie, ce qui ne vaut pas l’automatisation, ce que l’IA fait ou ne fait pas. Laissez votre courriel pour recevoir ces retours, et être prévenu si je prends de nouvelles missions de conseil.</p><form class="interest-form" method="post" action="https://interest.havesomecode.io/subscribe" data-interest><input type="hidden" name="source" value="landing" /><div class="field"><label for="interest-email">Votre courriel professionnel</label><input id="interest-email" type="email" name="email" autocomplete="email" placeholder="prenom@entreprise.fr" maxlength="254" required /></div><div class="trap" aria-hidden="true"><label>Ne pas remplir<input type="text" name="website" tabindex="-1" autocomplete="off" /></label></div><div class="consent"><input id="interest-consent" type="checkbox" name="consent" value="on" required /><label for="interest-consent">Je souhaite recevoir par courriel l’actualité de HaveSomeCode sur le conseil IA pour les PME.</label></div><button type="submit">Je veux suivre</button><p class="interest-note">Seule votre adresse est enregistrée, uniquement pour ces courriels. Un lien de désinscription figure dans chacun. Détails dans la <a href="/confidentialite">politique de confidentialité</a>.</p><p class="interest-status" role="status" data-interest-status></p></form></section>`;

const illustrations = [
  `<div class="example-visual prospect-visual"><div class="visual-columns"><div class="before-panel"><b>Avant · mardi, 21 h</b><div class="scattered"><svg viewBox="0 0 220 245" role="img" aria-label="Avant : cinq outils dispersés mardi à 21 h. Après : une liste de trois prospects avec leurs brouillons à valider." focusable="false"><defs><marker id="scene-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8" fill="none" stroke="currentColor" stroke-width="1.3" /></marker></defs><g fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#scene-arrow)"><path d="M47 38 C130 27 142 109 180 110" /><path d="M173 42 C142 100 60 99 42 150" /><path d="M43 151 C85 120 157 178 175 184" /><path d="M175 184 C130 238 55 210 55 184" /><path d="M58 198 C108 189 129 95 175 51" /></g><circle cx="110" cy="109" r="13" fill="currentColor" /><path d="M83 153 C83 136 94 127 110 127 C126 127 137 136 137 153 L137 162 L83 162 Z" fill="currentColor" /></svg><span>Notion</span><span>Apollo</span><span>HubSpot</span><span>Claude</span><span>ChatGPT</span></div></div><div class="after-panel"><b>Après · Liste du jour</b><div class="prospect-list">${["01", "02", "03"].map((number) => `<div class="prospect-row"><span>Prospect ${number}</span><span>Brouillon</span><span class="validate-pill">Valider</span></div>`).join("")}</div></div></div></div>`,
  `<div class="example-visual" role="img" aria-label="Un tarif fournisseur met à jour trois prix : 412 à 436 euros, 285 à 299 euros et 168 à 179 euros, à valider."><p>✉ tarif-fournisseur.pdf ↓</p><div class="price-row"><b>Référence</b><b>Ancien</b><b>Nouveau</b><b>Validation</b></div>${[
    ["412", "436"],
    ["285", "299"],
    ["168", "179"],
  ]
    .map(
      ([oldPrice, newPrice], n) =>
        `<div class="price-row"><span>0${n + 1}</span><del>${oldPrice} €</del><strong>${newPrice} €</strong><span>Valider</span></div>`,
    )
    .join("")}</div>`,
  `<div class="example-visual dashboard" role="img" aria-label="Tableau de trésorerie : 64 200 euros encaissés ce mois-ci, 2 factures en retard et 38 900 euros disponibles dans 30 jours, avec une courbe."><div class="dashboard-grid">${[
    ["Encaissé ce mois-ci", "64 200 €"],
    ["En retard", "2 factures en retard"],
    ["Disponible dans 30 jours", "38 900 €"],
  ]
    .map(
      ([label, value]) => `<div><small>${label}</small><b>${value}</b></div>`,
    )
    .join("")}</div><div class="chart-line"></div></div>`,
];
function examples() {
  return ["prospection", "prix", "tresorerie"]
    .map((id, n) => {
      const [title, situation, agent, objection] = homepageCopy[n + 2];
      return `<section class="example-section" id="${id}"><div><h2>${escape(title)}</h2><p>${escape(situation)}</p><h3>Avec un agent</h3><p>${escape(agent)}</p><blockquote><p>${escape(objection)}</p></blockquote></div>${illustrations[n]}</section>`;
    })
    .join("");
}
const agent = `<section class="agent-section" id="agent"><h2>${escape(homepageCopy[1][0])}</h2><p>${escape(homepageCopy[1][1])}</p><ol class="agent-flow"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg> Vous écrivez la consigne</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m10 2 4 0 .5 2.2 1.7.7 1.9-1.2 2.8 2.8-1.2 1.9.7 1.7 2.2.5v4l-2.2.5-.7 1.7 1.2 1.9-2.8 2.8-1.9-1.2-1.7.7L14 22h-4l-.5-2.2-1.7-.7-1.9 1.2-2.8-2.8 1.2-1.9-.7-1.7L2 14v-4l2.2-.5.7-1.7-1.2-1.9 2.8-2.8 1.9 1.2 1.7-.7Z"/><circle cx="12" cy="12" r="3"/></svg> L'agent fait la tâche dans vos outils</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12 4 4L19 6"/></svg> Vous validez l'envoi</li></ol></section>`;
const method = `<section class="method" id="demarche"><h2>${escape(homepageCopy[5][0])}</h2><p>${escape(homepageCopy[5][1])}</p><ol class="method-steps">${homepageSteps.map(([title, text]) => `<li class="method-step"><h3>${escape(title)}</h3><p>${escape(text)}</p><p class="exit">Je m'arrête ici →</p></li>`).join("")}</ol><p>Un devis écrit avant tout engagement.</p></section>`;
function about(snapshot) {
  return `<section class="about" id="about"><div><h2>${escape(homepageCopy[6][0])}</h2><p>${escape(homepageCopy[6][1])}</p><ul class="markers"><li>Depuis 2013</li><li>Lead technique depuis 2018</li><li>Club Med depuis 2020</li></ul><ul class="contact-links">${snapshot.site.contact.map((c) => `<li>${anchor(c.href, escape(c.label))}</li>`).join("")}</ul></div><img src="/assets/portrait-responsive/portrait-w_600.jpg" alt="Portrait de Zacaria Chtatar" /></section>`;
}
const contact = `<section class="contact-panel" id="contact"><h2>${escape(homepageCopy[7][0])}</h2><p>${escape(homepageCopy[7][1])}</p><p class="quick-links"><a href="${MISSION_HREF}">Discutons de votre projet</a></p><p><a href="mailto:z@havesomecode.io">z@havesomecode.io</a></p></section>`;

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
  const hero = article
    ? `<header id="top"><p class="author">Zacaria Chtatar · HaveSomeCode</p></header>`
    : `<header class="hero" id="top"><div class="pitch"><p class="role">Zacaria Chtatar · HaveSomeCode</p><h1>${escape(homepageCopy[0][0])}</h1><p class="intro">${escape(homepageCopy[0][1])}</p><p class="conditions">${escape(homepageCopy[0][2])}</p><p class="quick-links"><a href="#agent">Voir ce qu'on trouve ici</a><a href="#contact">Discutons de votre projet</a></p></div><div class="hero-illustration site-map"><ol>${siteMap.map(([name, text, href]) => `<li><a href="${href}"><b>${escape(name)}</b><span>${escape(text)}</span></a></li>`).join("")}</ol></div></header>`;
  return `${hero}<div class="topline"><p class="brand-line"><a href="/">HAVESOMECODE</a></p><nav aria-label="Navigation principale">${navigation}</nav></div>`;
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
<a class="skip" href="#main-content">Aller au contenu</a><div class="outer"><div class="site">${options.preview ? '<p class="preview-banner" role="status">APERÇU PRIVÉ · Non publié</p>' : ""}${header(snapshot, path !== "/")}<main id="main-content">${content}${path === "/" ? topics(snapshot) : sidebar(snapshot)}</main>${footer()}</div></div></body></html>\n`;
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
  const content = `${agent}${examples()}${method}${about(snapshot)}${contact}${interest}${projects(snapshot)}${talk()}${notes}`;
  return document(
    "HaveSomeCode · Zacaria Chtatar",
    homepageCopy[0][1],
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
