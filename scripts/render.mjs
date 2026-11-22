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
    "Je fais communiquer vos outils entre eux pour réduire les tâches sans valeur ajoutée. Vous gardez la main sur chaque action finale.",
    "Des assistants IA pour les PME : tri des demandes, point du matin, rappel d’échéances. Chaque envoi reste soumis à votre accord.",
  ],
  [
    "Zacaria Chtatar, développeur",
    "Je construis des logiciels depuis plus de dix ans, et je dirige des équipes techniques depuis plusieurs années. Je suis aujourd’hui lead développeur chez Club Med. Je suis indépendant et je travaille depuis la France.",
  ],
  [
    "Parlons de votre tâche qui prend trop de temps",
    "Écrivez-moi en deux lignes ce qui vous fait perdre du temps. Je vous réponds pour fixer un appel d’une demi-heure.",
  ],
];
const specimens = [
  {
    id: "tri",
    title: "Le tri des demandes",
    text: "Chaque mail est rangé, avec un brouillon de réponse prêt à relire.",
    tags: ["mails", "tableur", "validation humaine"],
    label: "Trois demandes prêtes, deux à compléter et une urgente.",
    visual: `<div class="bins"><div class="bin"><b>3</b><span>Prêt</span></div><div class="bin"><b>2</b><span>À compléter</span></div><div class="bin"><b>1</b><span>Urgent</span></div></div>`,
  },
  {
    id: "matin",
    title: "Le point du matin",
    text: "À 9 h, un mail court : ce qui avance, ce qui attend, ce qui est en retard.",
    tags: ["google sheets", "lecture seule"],
    label: "Un mail récapitule les avancées, les décisions et les retards.",
    visual: `<div class="mail"><strong class="subject">Point du matin du 11/05 : 2 avancés, 3 à décider, 1 en retard</strong><div class="mail-line"><b class="mail-reveal">Ce qui a avancé</b><span class="mail-entry mail-reveal">· Devis D001 · Boulangerie Lefort → à valider</span><span class="mail-entry mail-reveal">· Nouveau : devis D013 · Pâtisserie du Moulin</span></div><div class="mail-line"><b class="mail-reveal">À votre décision</b><span class="mail-entry mail-reveal">· Devis D004 · Atelier des Saules · 13/05</span><span class="mail-entry mail-reveal">· Remise D013 · 22/05</span></div><div class="mail-line late"><b class="mail-reveal">En retard</b><span class="mail-entry mail-reveal">· Facture F002 · Garage des Tilleuls · 3 j</span></div></div>`,
  },
  {
    id: "prix",
    title: "Les prix à jour",
    text: "Le tarif fournisseur arrive, chaque écart attend votre accord.",
    tags: ["pdf", "catalogue", "validation humaine"],
    label:
      "Cinq tarifs comparés : quatre changements validés, dont une baisse, et un tarif inchangé.",
    visual: `<div class="rows">${[
      ["Papier A4 80g", 62, 70, "hausse"],
      ["Encre noire", 48, 40, "baisse"],
      ["Bâche 3×1", 74, 86, "hausse"],
      ["Carton 350g", 38, 44, "hausse"],
      ["Vernis sélectif", 55, 55, "inchangé"],
    ]
      .map(
        ([name, old, current, change]) =>
          `<div class="prow" data-change="${change}"><span>${name}</span><span class="track"><i class="old old-${old}"></i><i class="new width-${current}"></i></span><span class="st${change === "inchangé" ? "" : " ok"}">${change === "inchangé" ? "inchangé" : "validé ✓"}</span></div>`,
      )
      .join("")}</div>`,
  },
  {
    id: "echeance",
    title: "Le rappel d’échéance",
    text: "À J-7 puis J-1, la bonne personne est prévenue. Rien de plus.",
    tags: ["agenda", "message"],
    label:
      "Deux rappels, à J-7 et J-1, précèdent l’échéance TVA ; Marc est prévenu.",
    visual: `<div class="tl"><span class="mk mark-seven">J-7</span><span class="mk mark-one">J-1</span><span class="mk due">TVA</span><span class="cur"></span></div><div class="toast"><b>Rappel</b> · TVA à déclarer demain → Marc</div>`,
  },
  {
    id: "veille",
    title: "Veille missions",
    text: "Chaque lundi à 8 h, au plus cinq missions classées, avec le lien pour les lire.",
    tags: ["sources publiques", "lecture seule"],
    label:
      "Une dizaine d’annonces lues, quatre retenues et classées, chacune avec sa source et son lien.",
    visual: `<div class="veille-list"><p>Lundi 8 h · 4 retenues</p>${[
      ["Architecte solution API", "Free-Work"],
      ["Architecte data & IA", "Free-Work"],
      ["Architecte IA générative", "Free-Work"],
      ["Appli web avec IA", "Codeur"],
    ]
      .map(
        ([title, source], i) =>
          `<div class="veille-row"><b>${i + 1}</b><span>${escape(title)}<small>${source}</small></span><span>lien ↗</span></div>`,
      )
      .join("")}</div>`,
  },
  {
    id: "mails",
    title: "Tri des mails",
    text: "À 7 h 30, ma boîte est rangée en quatre piles, avec un brouillon pour chaque mail qui attend une réponse.",
    tags: ["gmail", "rien n’est envoyé"],
    label:
      "Six mails reçoivent une étiquette : un urgent, deux à répondre, un à compléter, deux à ignorer ; un brouillon de réponse est prêt.",
    visual: `<div class="inbox-demo">${[
      ["Cabinet RH", "Urgent"],
      ["Client · devis", "À répondre"],
      ["Fournisseur", "À répondre"],
      ["Banque", "À compléter"],
      ["Newsletter", "À ignorer"],
      ["Actualités", "À ignorer"],
    ]
      .map(
        ([sender, label], i) =>
          `<div class="inbox-row${i > 3 ? " ignored" : ""}"><span>${sender}</span><span class="inbox-chip chip-${i}">${label}</span></div>`,
      )
      .join(
        "",
      )}<div class="draft"><span>brouillon · à relire</span><p>Bonjour, merci pour votre message. Je vous propose un appel jeudi. Bonne journée. Zacaria</p></div></div>`,
  },
];
function cards() {
  return `<section id="assistants" class="specimens" aria-label="Assistants en démonstration"><div class="cards">${specimens.map((card, index) => `<article class="card" data-demo="${card.id}"><div class="demo"><div class="bar"><span class="mono live">en direct</span><button type="button" class="mono restart" aria-label="Rejouer la démo : ${escape(card.title)}">⟲ rejouer</button></div><div class="demo-visual" role="img" aria-label="${escape(card.label)}">${card.visual}</div></div><div class="card-body"><span class="mono">0${index + 1}</span><h3>${escape(card.title)}</h3><p>${escape(card.text)}</p><div class="tags">${card.tags.map((tag) => `<span>${escape(tag)}</span>`).join("")}</div></div></article>`).join("")}</div><p class="offers-link"><a href="/offres">Voir les quatre offres →</a></p></section>`;
}
const interest = `<section class="interest" id="suivre"><h2>Un processus qui vous fait perdre du temps ?</h2><p>Je publie ce que j’apprends en regardant des processus réels de PME : ce qui se simplifie, ce qui ne vaut pas l’automatisation, ce que l’IA fait ou ne fait pas. Laissez votre courriel pour recevoir ces retours, et être prévenu si je prends de nouvelles missions de conseil.</p><form class="interest-form" method="post" action="https://interest.havesomecode.io/subscribe" data-interest><input type="hidden" name="source" value="landing" /><div class="field"><label for="interest-email">Votre courriel professionnel</label><input id="interest-email" type="email" name="email" autocomplete="email" placeholder="prenom@entreprise.fr" maxlength="254" required /></div><div class="trap" aria-hidden="true"><label>Ne pas remplir<input type="text" name="website" tabindex="-1" autocomplete="off" /></label></div><div class="consent"><input id="interest-consent" type="checkbox" name="consent" value="on" required /><label for="interest-consent">Je souhaite recevoir par courriel l’actualité de HaveSomeCode sur le conseil IA pour les PME.</label></div><button type="submit">Je veux suivre</button><p class="interest-note">Seule votre adresse est enregistrée, uniquement pour ces courriels. Un lien de désinscription figure dans chacun. Détails dans la <a href="/confidentialite">politique de confidentialité</a>.</p><p class="interest-status" role="status" data-interest-status></p></form></section>`;

function about(snapshot) {
  return `<section class="about" id="about"><div><h2>${escape(homepageCopy[1][0])}</h2><p>${escape(homepageCopy[1][1])}</p><ul class="markers"><li>Développeur</li><li>Lead technique</li><li>Club Med</li></ul><ul class="contact-links">${snapshot.site.contact.map((c) => `<li>${anchor(c.href, escape(c.label))}</li>`).join("")}</ul></div><img src="/assets/portrait-responsive/portrait-w_600.jpg" alt="Portrait de Zacaria Chtatar" /></section>`;
}
const contact = `<section class="contact-panel" id="contact"><h2>${escape(homepageCopy[2][0])}</h2><p>${escape(homepageCopy[2][1])}</p><p class="quick-links"><a href="${MISSION_HREF}">Discutons de votre projet</a></p><p><a href="mailto:z@havesomecode.io">z@havesomecode.io</a></p></section>`;

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
function header(snapshot, article, offers = false) {
  const navigation = snapshot.navigation
    .filter((n) => n.visible && availableLink(n.href, snapshot))
    .sort((a, b) => a.order - b.order)
    .map((n) => anchor(n.href, `[ ${escape(n.label.toUpperCase())} ]`))
    .join("");
  const hero = offers
    ? ""
    : article
      ? `<header id="top"><p class="author">Zacaria Chtatar · HaveSomeCode</p></header>`
      : `<header class="hero" id="top"><div class="hero-grid"><div><p class="kicker"><span>HaveSomeCode</span><b>Zacaria Chtatar</b></p><h1>Qu’est-ce qui vous coûte <br /><em>le plus de temps</em> chaque jour&nbsp;?</h1><p class="hero-sub">${escape(homepageCopy[0][0])}</p></div><form class="hero-ask" action="mailto:z@havesomecode.io" method="get" data-hero-ask><span class="mono">Racontez-moi</span><label for="hero-ask-text">Ce qui me prend le plus de temps, c’est…</label><textarea id="hero-ask-text" name="body" rows="4"></textarea><button type="submit">Envoyer à Zacaria →</button></form></div><p class="conditions">Je vous réponds moi-même. 30 minutes pour en parler, sans engagement.</p></header>`;
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
// What the site offers, as read by search engines and AI assistants.
// Names and sentences are the ones shown on /offres.
const offerList = [
  [
    "tri-des-demandes",
    "Tri des demandes",
    "Chaque matin, vos demandes de devis sont rangées, avec une réponse prête à relire.",
  ],
  [
    "point-du-matin",
    "Le point du matin",
    "Chaque matin, un message court vous dit ce qui attend votre décision.",
  ],
  [
    "rappel-echeances",
    "Rappel d'échéances",
    "Les dates qu'on oublie arrivent dans la boîte de la bonne personne, avant qu'il soit trop tard.",
  ],
  [
    "veille-appels-offres",
    "Veille d'appels d'offres",
    "Chaque semaine, quelques annonces qui vous concernent, classées, avec le lien pour les lire.",
  ],
];
const PERSON_TEXT =
  "Zacaria Chtatar construit des logiciels depuis plus de dix ans et dirige des équipes techniques depuis plusieurs années. Il est aujourd’hui lead développeur chez Club Med. Il est indépendant et travaille depuis la France.";
const CALMLY = "https://calmly.havesomecode.io/";
const CALMLY_TEXT =
  "Des cours clairs, des métaphores simples, des quiz et des outils concrets pour apprendre l'IA sans jargon et sans stress.";
const ORG_TEXT =
  "Conseil IA pour les PME : des assistants qui prennent en charge les tâches qui prennent trop de temps, chaque envoi restant soumis à votre accord.";
function structuredData(snapshot) {
  const org = `${ORIGIN}/#organization`,
    person = `${ORIGIN}/#zacaria`;
  const contact = (label) =>
    snapshot.site.contact.find((c) => c.label === label)?.href;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${ORIGIN}/#website`,
        url: `${ORIGIN}/`,
        name: "HaveSomeCode",
        inLanguage: "fr",
        publisher: { "@id": org },
      },
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": org,
        name: "HaveSomeCode",
        url: `${ORIGIN}/`,
        description: ORG_TEXT,
        logo: `${ORIGIN}/assets/social-card.png`,
        image: `${ORIGIN}/assets/social-card.png`,
        email: "z@havesomecode.io",
        founder: { "@id": person },
        areaServed: { "@type": "Country", name: "France" },
        knowsLanguage: "fr",
        sameAs: ["https://github.com/Havesomecode"],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Offres",
          url: `${ORIGIN}/offres`,
          itemListElement: offerList.map(([id, name, description]) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name,
              description,
              url: `${ORIGIN}/offres#${id}`,
              provider: { "@id": org },
              areaServed: { "@type": "Country", name: "France" },
            },
          })),
        },
      },
      {
        "@type": "Person",
        "@id": person,
        name: "Zacaria Chtatar",
        givenName: "Zacaria",
        familyName: "Chtatar",
        url: `${ORIGIN}/#about`,
        image: `${ORIGIN}/assets/portrait-responsive/portrait-w_600.jpg`,
        jobTitle: "Lead développeur",
        description: PERSON_TEXT,
        email: "z@havesomecode.io",
        worksFor: [
          { "@id": org },
          { "@type": "Organization", name: "Club Med" },
        ],
        sameAs: [contact("LinkedIn"), contact("GitHub"), contact("CV")].filter(
          Boolean,
        ),
      },
      {
        "@type": "WebApplication",
        "@id": `${CALMLY}#app`,
        name: "Calmly",
        url: CALMLY,
        description: CALMLY_TEXT,
        applicationCategory: "EducationalApplication",
        inLanguage: "fr",
        publisher: { "@id": org },
      },
    ],
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}
export function renderLlmsTxt(snapshot) {
  validateSnapshot(snapshot);
  const articles = [...snapshot.articles].sort((a, b) =>
    noteDate(b).localeCompare(noteDate(a)),
  );
  const contact = snapshot.site.contact
    .filter((c) => c.label !== "E-mail")
    .map((c) => `- [${c.label}](${c.href})`)
    .join("\n");
  return `# HaveSomeCode

> HaveSomeCode est l'activité de conseil IA de Zacaria Chtatar, développeur indépendant en France. Il met en place, pour les PME, des assistants qui prennent en charge les tâches qui prennent trop de temps : tri des demandes, point du matin, rappel d'échéances, veille d'appels d'offres. Chaque envoi reste soumis à votre accord.

Qui : ${PERSON_TEXT}

Pour qui : les dirigeants et les équipes de PME qui perdent du temps sur une tâche répétitive (mails, devis, tableurs, échéances, annonces).

Comment ça commence : une conversation de 30 minutes, sans engagement. Si l'une des offres répond au besoin, on part de là ; sinon, Zacaria dit ce qu'il ferait à votre place, y compris ne rien changer. Un devis écrit avant tout engagement. HaveSomeCode ne vend pas de logiciel.

Contact : [z@havesomecode.io](mailto:z@havesomecode.io)

## Offres

${offerList.map(([id, name, text]) => `- [${name}](${ORIGIN}/offres#${id}): ${text}`).join("\n")}

## Pages clés

- [Accueil](${ORIGIN}/): des assistants IA en démonstration animée.
- [Offres](${ORIGIN}/offres): le détail des quatre offres, ce qui est livré et ce que vous gardez.
- [À propos](${ORIGIN}/#about): qui est Zacaria Chtatar.
${articles.length ? `- [Blog](${ORIGIN}/blog): notes sur les API, l'observabilité et les agents de code.\n` : ""}
## Produit

- [Calmly](${CALMLY}): produit de HaveSomeCode. ${CALMLY_TEXT}
${articles.length ? `\n## Notes\n\n${articles.map((a) => `- [${a.title}](${ORIGIN}/blog/${a.slug}): ${a.excerpt}`).join("\n")}\n` : ""}
## Zacaria Chtatar

${contact}
- [CV pour les IA (llms.txt)](https://cv.havesomecode.io/llms.txt)
`;
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
${path === "/" && !options.preview ? structuredData(snapshot) : ""}<script src="/assets/theme-init.js"></script><script defer src="/assets/site.js"></script>${path === "/" ? '<script defer src="/assets/vendor/motion.js"></script><script defer src="/assets/specimens.js"></script>' : path === "/offres" ? '<script defer src="/assets/vendor/motion.js"></script><script defer src="/assets/offres.js"></script>' : ""}<script defer src="/assets/interest.js"></script>${options.preview ? "" : analyticsSnippet}</head><body>
<a class="skip" href="#main-content">Aller au contenu</a><div class="outer"><div class="site">${options.preview ? '<p class="preview-banner" role="status">APERÇU PRIVÉ · Non publié</p>' : ""}${header(snapshot, path !== "/", path === "/offres")}<main id="main-content">${content}${path === "/" ? topics(snapshot) : path === "/offres" ? "" : sidebar(snapshot)}</main>${footer()}</div></div></body></html>\n`;
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
  const content = `${cards()}${about(snapshot)}${contact}${interest}${projects(snapshot)}${talk()}${notes}`;
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

export function renderOffers(snapshot, options = {}) {
  validateSnapshot(snapshot);
  const content = `<section id="offres-top" class="offers-hero"><div><h1>Quatre petites choses qui font gagner du temps à votre équipe</h1><p>Chacune règle un seul sujet, se met en place vite, et reste entre vos mains.</p><a class="offer-button" href="#contact">Parlons-en 30 minutes</a><p class="conditions">30 minutes pour en parler, sans engagement. Je ne vends pas de logiciel.</p></div><div class="offer-fan"><a class="offer-sheet sheet-1" href="#tri-des-demandes">Tri des demandes</a><a class="offer-sheet sheet-2" href="#point-du-matin">Point du matin</a><a class="offer-sheet sheet-3" href="#rappel-echeances">Rappel d'échéances</a><a class="offer-sheet sheet-4" href="#veille-appels-offres">Veille d'appels d'offres</a></div></section><section class="offer-section" id="tri-des-demandes"><div class="offer-copy"><span class="mono">01</span><h2>Tri des demandes</h2><p class="offer-result">Chaque matin, vos demandes de devis sont rangées, avec une réponse prête à relire.</p><dl><dt>Je vous livre</dt><dd>Un tri de votre boîte mail en quatre piles (urgent, à répondre, à compléter, à ignorer), un brouillon de réponse pour chaque demande, et un court récapitulatif du matin.</dd><dt>Vous gardez</dt><dd>La main sur chaque envoi : le brouillon attend dans le mail, vous relisez, vous envoyez. Vous mettez à jour une consigne d'une demi-page quand votre activité change.</dd><dt>Mise en place</dt><dd>Environ deux semaines, dont un essai sur vos vrais mails.</dd></dl></div><div class="offer-visual" role="img" aria-label="Des demandes rangées en quatre colonnes et un brouillon à relire." data-offer-visual><div class="offer-sort">${["urgent", "à répondre", "à compléter", "à ignorer"].map((label, i) => `<div class="sort-column"><b>${label}</b><span class="offer-reveal">${["Demande urgente", "Devis à relire", "Information manquante", "Information"][i]}</span>${i === 1 ? '<span class="offer-reveal sort-draft">Brouillon prêt<br /><span class="pill">Relire et envoyer</span></span>' : ""}</div>`).join("")}</div></div></section><section class="offer-section" id="point-du-matin"><div class="offer-copy"><span class="mono">02</span><h2>Le point du matin</h2><p class="offer-result">Chaque matin, un message court vous dit ce qui attend votre décision.</p><dl><dt>Je vous livre</dt><dd>Un message envoyé à l'heure de votre choix : devis en attente de réponse, commandes à livrer, factures impayées. Il se nourrit de votre tableur, dans votre compte.</dd><dt>Vous gardez</dt><dd>Le tableur et ses statuts, que vous tenez à jour, et l'heure d'envoi, que vous changez en une case. Je vous remets un mode d'emploi d'une page.</dd><dt>Mise en place</dt><dd>Quelques jours.</dd></dl></div><div class="offer-visual" role="img" aria-label="Un message du matin avec décisions, retards et sujets en cours." data-offer-visual><div class="offer-message"><b>Lundi · 8 h 30</b>${[
    ["Attend votre décision", "Devis en attente de réponse"],
    ["En retard", "Facture impayée"],
    ["En cours", "Commande à livrer"],
  ]
    .map(
      ([title, line]) =>
        `<div class="offer-reveal"><strong>${title}</strong><span>${line}</span></div>`,
    )
    .join(
      "",
    )}</div></div></section><section class="offer-section" id="rappel-echeances"><div class="offer-copy"><span class="mono">03</span><h2>Rappel d'échéances</h2><p class="offer-result">Les dates qu'on oublie arrivent dans la boîte de la bonne personne, avant qu'il soit trop tard.</p><dl><dt>Je vous livre</dt><dd>Vos échéances (TVA, charges, assurances, contrats, contrôles) saisies une fois, avec un rappel une semaine avant et la veille. Le rappel prévient, il ne paie rien et n'envoie rien.</dd><dt>Vous gardez</dt><dd>La liste des dates, que vous complétez quand un contrat est signé ou renouvelé.</dd><dt>Mise en place</dt><dd>Un à deux jours. Si votre agenda partagé fait déjà le travail, je vous le dis et on s'arrête là.</dd></dl></div><div class="offer-visual" role="img" aria-label="Une échéance et ses deux rappels sur une frise." data-offer-visual><div class="offer-timeline"><span class="offer-reveal">une semaine avant</span><span class="offer-reveal">la veille</span><span>échéance</span><i class="offer-cursor"></i></div></div></section><section class="offer-section" id="veille-appels-offres"><div class="offer-copy"><span class="mono">04</span><h2>Veille d'appels d'offres</h2><p class="offer-result">Chaque semaine, quelques annonces qui vous concernent, classées, avec le lien pour les lire.</p><dl><dt>Je vous livre</dt><dd>Une lecture hebdomadaire de sources publiques selon vos critères (métier, zone, taille de marché), au plus cinq annonces avec la raison pour laquelle elles vous correspondent, et rien du tout les semaines sans annonce utile.</dd><dt>Vous gardez</dt><dd>Vos critères, que vous modifiez dans un fichier d'une page. Les réponses aux appels d'offres restent les vôtres : la veille ne candidate à rien.</dd><dt>Mise en place</dt><dd>Environ une semaine, le temps de régler vos critères sur quelques semaines d'annonces.</dd></dl></div><div class="offer-visual" role="img" aria-label="Trois annonces classées avec lieu, raison et lien." data-offer-visual><div class="offer-message"><b>Lundi</b>${["Île-de-France", "Lyon", "À distance"].map((place) => `<div class="offer-reveal offer-ad"><i></i><span>${place}</span><span class="pill">pourquoi vous</span><span>lien ↗</span></div>`).join("")}</div></div></section><section id="conversation" class="conversation"><h2>On commence par une conversation, pas par un package</h2><p>Vous me décrivez une tâche qui vous fait perdre du temps. Si l'un de ces quatre sujets y répond, nous partons de là. Sinon, je vous dis ce que je ferais à votre place, y compris ne rien changer.</p><div class="conversation-steps"><div><strong>30 minutes</strong><span>Je m'arrête ici</span></div><div><strong>Diagnostic</strong><span>Je m'arrête ici</span></div><div><strong>Essai sur une tâche</strong><span>Je m'arrête ici</span></div></div><p>Un devis écrit avant tout engagement.</p></section><section id="contact" class="offers-contact"><h2>Quelle tâche prend trop de temps chez vous ?</h2><p>Écrivez-moi en deux lignes. Je vous réponds pour fixer un appel d'une demi-heure.</p><a class="offer-button" href="mailto:z@havesomecode.io?subject=Parlons-en%2030%20minutes">Parlons-en 30 minutes</a><p><a href="mailto:z@havesomecode.io">z@havesomecode.io</a></p></section>`;
  return document(
    "Offres · HaveSomeCode",
    "Quatre services pour faire gagner du temps à votre équipe : tri des demandes, point du matin, rappel d’échéances, veille d’appels d’offres.",
    "/offres",
    content,
    snapshot,
    options,
  );
}
