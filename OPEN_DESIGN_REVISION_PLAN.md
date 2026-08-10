# Open Design revision plan — HaveSomeCode personal world

Status: design specification only. This document does not authorize a production edit or deployment.

## 1. Open Design provenance

Open Design was available and explicitly selected for this pass before design work began.

- Application: Open Design 0.18.1
- Selected execution: Local Codex inside Open Design
- Confirmed brief:
  - Goal: **Showcase work**
  - Scope: **Rich single page**
  - Character: **Warm human**
- Open Design project: `zacaria-personal-world-authored-pass-7eba`
- Run: `7f500719-2167-4c1b-ae62-38c0e7b3e906`
- Conversation: `e6654f06-5480-4e88-84d4-78d0be2ce495`
- Agent: `codex`
- Run result: `succeeded`, 9 artifacts, no unfinished work

The selected Open Design run inspected these project-local authoritative inputs:

- `source/index.html`
- `source/assets/styles.css`
- `source/assets/site.js`
- `references/brand-positioning.md`

The complete Open Design artifact used for this plan is:

`/Users/zacariachtatar/Library/Application Support/Open Design/namespaces/release-stable/data/projects/zacaria-personal-world-authored-pass-7eba/`

Its primary deliverables are `index.html`, `assets/styles.css`, `assets/site.js`, and `brand-spec.md`. The manifest `index.html.artifact.json` records a complete HTML artifact created on 2026-08-07 with HTML, PDF, and ZIP export capabilities. The Open Design image export failed in the local renderer with `BAD_REQUEST: Cannot read properties of undefined (reading 'ok')`, so the run itself completed static integrity and accessibility checks rather than claiming a rendered preview. For this specification, the imported local candidate was additionally served from the repository and inspected in a real Chromium rendering at desktop and 390 × 844 mobile widths.

The Open Design diagnosis was: the production system has trustworthy content and a strong visual foundation, but it is over-composed. Stacked diagrams, framed modules, repeated labels, and too many equal-intensity moments make it feel generated. The selected response was to reduce the page to a few recurring gestures—numbered margins, long typographic rules, integrated imagery, and restrained color fields—while making the work the largest sustained passage.

## 2. Sources and non-negotiable boundaries

This plan combines:

1. The production page at `https://www.havesomecode.io/`, inspected structurally and visually.
2. The repository at `/Users/zacariachtatar/repos/landing-page`, including the current Open Design-derived working-tree candidate.
3. `/Users/zacariachtatar/repos/havesomecode/_docs/brand-positioning.md` as the factual and wording source of truth.
4. Task `t_ab1d5775`, whose accepted conclusion was that the personal-world page does the job for now but still feels somewhat AI-generated/editorial.
5. The Open Design run and artifact identified above.

Preserve throughout:

- The personal-world architecture: introduction, things made, recurring questions, speaking, personal context, contact.
- Warm paper, near-black ink, forest green, accessible clay, Newsreader display type, Manrope body, and sparse DM Mono labels.
- Square edges, fine rules, asymmetric layouts, generous whitespace, natural portrait treatment, and real project imagery.
- The current factual copy boundaries and all real destination URLs.
- `https://cv.havesomecode.io/` as the route for chronology, metrics, detailed proof, and résumé evidence.
- Semantic headings and landmarks, skip link, descriptive alternative text, keyboard visibility, external-link safety, reduced-motion support, and readable no-JavaScript content.

Do not introduce résumé metrics, proof dashboards, unsupported impact or management claims, terminal/code-editor styling, gradients, rounded SaaS cards, card dashboards, framework-led identity, decorative data visualizations, cursor gimmicks, or spectacle that competes with the work.

## 3. Why production feels generated or over-editorial

### 3.1 The hero asks the visitor to decode a designed thesis

The production hero combines an oversized `WHY?`, a four-node context/systems/people/operations diagram, orbit lines, the portrait, a clay caption block, two button treatments, and a mono focus line. Each device is individually coherent, but together they present a brand argument before they present Zacaria. The result feels art-directed for authority rather than personally authored.

Revision intent: keep the human introduction, H1, short paragraph, portrait, and two direct paths. Remove the decision map, watermark, orbit treatment, pointer field, and profile-card caption block. Let the portrait be a photograph in the reading flow, not evidence inside a model.

### 3.2 Too many sections introduce a new component grammar

Production moves through a four-cell Make/Learn/Share/Lead map, an early “open door” conversion band, a dark project stage, alternating shadowed media frames, an accordion plus an abstract chart, a large naming quotation, a talk card, an about panel, and a full clay contact banner. The constant change of mechanism makes every passage announce itself as a designed moment.

Revision intent: establish one page grammar and repeat it. Use a numbered margin, an asymmetric content column, a fine horizontal rule, and occasional full-width color only when the subject genuinely changes. The work, not the component system, should provide variety.

### 3.3 Display typography has no quiet counter-rhythm

Newsreader is appropriate and distinctive, but production repeatedly uses very large aphoristic headings, while DM Mono labels, indices, and uppercase calls to action appear in nearly every passage. This makes the page resemble a magazine concept or generated “editorial portfolio” prompt.

Revision intent: retain Newsreader but vary intensity. Reserve the largest scale for the H1 and one section-level transition at a time. Use Manrope for explanations and links. Keep DM Mono to orientation labels, project categories, and compact metadata; do not use it to decorate every sentence.

### 3.4 Imagery is treated as a designed module rather than lived evidence

The portrait is surrounded by a conceptual diagram. Project screenshots sit inside repeated offset frames and a dark showcase stage. These treatments make real images feel like components in a template.

Revision intent: integrate the square portrait directly into the hero grid and let each 8:5 project screenshot occupy substantial unframed space. Use a small clay square or a thin rule as punctuation, not a shadow system. Project imagery should carry the work passage without additional diagrams.

### 3.5 Interaction performs “design” instead of helping orientation

Pointer movement, diagram animation, staggered reveals, accordion state, an updating principle chart, active navigation, and multiple hover systems accumulate into a demonstrative interaction layer. The quieter content does not need this much choreography.

Revision intent: retain only practical mobile navigation, section orientation, subtle link/media hover feedback, and a single non-staggered reveal behavior. Remove parallax, diagram animation, chart state, and interaction that hides explanatory copy. Everything remains visible and usable without JavaScript.

### 3.6 Copy and structure drift toward an executive microsite

The words are mostly truthful and personable, but the succession of declarative headings, category systems, and the early conversion band turns curiosity into positioning proof. The role-forward closing then makes the page resolve as recruitment collateral.

Revision intent: preserve the accepted first-person copy where it describes curiosity, making, speaking, and life outside work. Remove synthetic proof framing. Keep career chronology and measured impact in the CV. The landing page should feel like entering a person’s world, not reviewing a leadership proposition.

## 4. Coherent revision specification

### 4.1 Narrative sequence

Use one uninterrupted sequence:

1. **Hello** — curiosity, a short self-introduction, portrait, and paths to work or email.
2. **Selected work** — the longest and most image-led passage.
3. **Questions I return to** — a quiet reading list, not an interactive model.
4. **Speaking** — one distinct forest-green field for the public talk.
5. **Away from the work** — compact personal context without proof language.
6. **Come say hello** — direct contact, with CV, GitHub, LinkedIn, and email retained in the footer.

Remove the standalone Make/Learn/Share/Lead map and the early “open door” conversion section. Their ideas are already expressed more naturally by the sequence itself.

### 4.2 Shared composition

- Use a 12-column desktop grid inside a maximum 1320 px shell.
- Use a fluid outer gutter around `clamp(1.125rem, 3vw, 3rem)`.
- Place section orientation in the left three columns and primary content in the central/right columns.
- Use one-pixel rules and surface changes to mark transitions; avoid containers that read as cards.
- Keep major vertical intervals generous but purposeful. The current Open Design candidate’s `clamp(6rem, 11vw, 11rem)` section rhythm is the upper bound, not a requirement to create empty spectacle.
- Do not alternate layout simply for variety. Alternate project media only where it improves reading rhythm.

### 4.3 Header and navigation

- Keep a quiet two-line identity lockup: `Zacaria Chtatar` with restrained `HaveSomeCode` underneath.
- Use `Work`, `Questions`, `Speaking`, and `About` as plain section links.
- Keep `Read my CV ↗` as the only outlined header action; it routes to the evidence-first channel.
- Active-section treatment is a fine underline, not a pill, filled tab, or animated indicator.
- The header should not become sticky unless later testing shows a concrete navigation need.

### 4.4 Hero

- Desktop order: section mark in the left margin; greeting, H1, introduction, and text links in the middle; portrait on the right; one quiet focus line below the copy.
- Use the existing H1 as the central idea. Forest-green italic emphasis on `really` is sufficient; do not add a second conceptual graphic.
- Keep the portrait square, naturally cropped, and large enough to feel present. Use a single small clay square as punctuation and a thin factual caption below.
- Use text links rather than large filled buttons so the visitor meets the person before a conversion pattern.
- Keep the introduction’s readable width near 39 rem and body line-height near 1.7–1.75.

### 4.5 Selected work

- Give this section the greatest sustained visual space.
- Keep three real projects in the accepted order unless content review changes it: Float, Pathfinding, Kibana Log Investigation MCP.
- For each project, lead with why it exists, then compact stack metadata, direct project/source links, and the real screenshot.
- Use a fine top rule to start each project and generous separation between projects.
- Present screenshots at 8:5 without rounded frames, offset shadows, browser chrome, invented diagrams, or decorative overlays. A small square “Open project” label may sit over the image if it remains subordinate.
- Keep alternating copy/media alignment on wide screens, but preserve a consistent reading order in the DOM.

### 4.6 Questions and naming

- Replace the accordion and chart with a static ordered list of the four existing questions and explanations.
- Use the same grid and rule system as the rest of the page. No disclosure affordance should imply hidden content.
- Treat the naming passage as a pause after the list, not as a proof card. One large quotation and one clay punctuation square are enough.

### 4.7 Speaking, about, and contact

- Speaking receives the only full forest-green field. Keep the real event/year, talk title, short first-person context, and direct talk link.
- About returns to warm paper and uses an asymmetric heading/copy composition. It should contain personal interests and working context, not a condensed career history.
- Contact uses near-black ink rather than a second loud clay campaign banner. Keep one clear invitation and one highly legible email link.
- Clay remains punctuation and focus color; it should not become a large background unless a later design review demonstrates a specific need.

### 4.8 Interaction and motion

- Links: underline or color shift with no layout movement.
- Project media: at most a 1–2% image scale and restrained saturation shift on pointer hover.
- Reveal: one optional 650 ms fade/20 px rise as sections enter; no stagger and no content gating.
- Navigation: update `aria-current="location"` when a section is genuinely current.
- Mobile menu: explicit Menu/Close text, `aria-expanded`, Escape-to-close, focus returned to the trigger, body scroll lock while open, and links that close the menu.
- Reduced motion: disable smooth scrolling, transitions, and animation; show all content immediately.
- No-JavaScript: navigation and every content passage remain visible and operable.

## 5. Responsive intent

### Wide desktop (above 1050 px)

Use the full 12-column composition. Hero copy and portrait share the first viewport without the portrait being reduced to a badge. Project copy occupies roughly four columns and media roughly seven, with one-column breathing space where useful.

### Compact desktop and tablet (about 761–1050 px)

Preserve the asymmetric hero while allowing a smaller portrait and tighter column gaps. Use a container query around 860 px for project entries so each project becomes one column before its text or image becomes cramped. Copy precedes media in the reading order even for visually reversed desktop entries.

### Mobile (760 px and below)

- Replace inline navigation with a full-width Menu/Close disclosure.
- Sequence the hero as mark → greeting/H1/introduction/links → portrait → focus line.
- Keep the mobile H1 expressive but cap it so words do not create accidental one- or two-letter fragments. The inspected 390 px candidate fits the current H1 cleanly, though the portrait falls below the first viewport; that is acceptable if the human greeting and two actions remain complete above it.
- Stack every section to one column. Move section marks above their headings and reduce large section gaps where they no longer create useful asymmetry.
- Keep project copy before its screenshot, maintain 44 px minimum targets, and allow email text to wrap without overflow.
- At 430 px and below, reduce the brand, display headings, project titles, and media overlay inset; do not shrink body copy below 16 px.

## 6. Acceptance criteria for a later implementation task

A later implementation is ready for review when:

1. The production decision map, Make/Learn/Share/Lead grid, early conversation band, accordion/chart, pointer effect, and staggered motion are absent.
2. The page follows the six-part sequence in section 4.1 and projects receive the largest sustained passage.
3. All accepted copy, project URLs, source URLs, talk, CV, social, and email destinations remain correct.
4. No résumé metric, formal management implication, unverified impact claim, or new career chronology appears.
5. Desktop, tablet, 390 px mobile, keyboard-only, reduced-motion, and no-JavaScript passes are visually and functionally reviewed.
6. The portrait and all three project screenshots render from existing local assets with correct dimensions and alternative text.
7. Focus indicators and all recurring text/background combinations meet accessible contrast; clay is not used for small text where contrast is insufficient.
8. The result feels coherent when scrolling: no section introduces a component language that exists only to show design range.
9. The final implementation is explicitly reviewed before commit or deployment.

## 7. Unresolved content decisions

These are design/content gates, not permission to invent copy:

1. **Contact posture:** should the closing remain explicitly role-seeking (`Lead Developer roles with a wider technical view`) or become a broader invitation to thoughtful technical work? The former is truthful but pulls the personal-world page back toward recruitment framing.
2. **Portrait caption:** is `France · Lead Developer` useful orientation, or should the caption be less role-forward so the photograph remains personal rather than profile-card evidence?
3. **Naming quotation:** is the current first-person quotation approved as Zacaria’s own wording, or should it be replaced by a more literal sentence from the brand source? The underlying interest is supported; the exact quotation needs owner approval before high-visibility use.
4. **Project order:** should Float remain first as the most immediately personal/useful object, or should a different project lead based on current quality and relevance? Do not reorder without checking the live projects.
5. **Mobile first viewport:** is it preferable for the portrait to appear partially above the fold, or is a complete introduction plus actions the stronger mobile opening? The inspected candidate chooses the latter.
6. **HaveSomeCode lockup:** should `HaveSomeCode` remain the small second line under Zacaria’s name, or should the site lead with only the person’s name and leave the project identity to metadata/footer?

Until these questions are answered, the Open Design artifact should be treated as the coherent reference direction—not as an approved production patch.
