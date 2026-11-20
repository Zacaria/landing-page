---
version: alpha
name: HaveSomeCode — Uncommon editorial
description: Monumental editorial serif, technical metadata, fine rules and restrained chartreuse accents.
colors:
  primary: "#23231f"
  secondary: "#68675f"
  accent: "#d4ff4f"
  neutral: "#f5f3ed"
  surface: "#eeece5"
  dark-background: "#0b0b0c"
  dark-text: "#ece8e1"
  dark-muted: "#a29e97"
  dark-link: "#d4ff4f"
  dark-surface: "#121214"
typography:
  heading:
    fontFamily: Instrument Serif
    fontSize: 7.5rem
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  body:
    fontFamily: Geist
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: 0em
  article:
    fontFamily: Geist
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: 0em
rounded:
  none: 0px
  search: 6px
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
components:
  page:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "{spacing.md}"
  dark-page:
    backgroundColor: "{colors.dark-background}"
    textColor: "{colors.dark-text}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "{spacing.md}"
  link:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "{spacing.xs}"
  dark-link:
    backgroundColor: "{colors.dark-background}"
    textColor: "{colors.dark-link}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "{spacing.xs}"
  dark-quiet-copy:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.dark-muted}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "{spacing.sm}"
  accent-marker:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary}"
    rounded: "{rounded.search}"
    padding: "{spacing.xs}"
  quiet-copy:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    typography: "{typography.body}"
---

## Accepted identity

On 22 October 2026, the owner replaced the CV/Sandstone direction with `https://webdev.teknium.io/#react` (Uncommon Web), then accepted a HaveSomeCode adaptation. Keep the recruiter-focused content cleanup: name, hands-on role, professional evidence and direct CV/contact access before personal experiments. This accepts the reference direction, not a production release or article publication.

On 20 November 2026 (card t_62704fac) the homepage became an SMB offer, with kirako.ai as the clarity bar (structure only, not its style). A non-technical SMB owner must understand in ten seconds what Zacaria does for them and how to reach him. The hero states the outcome (« Du temps pour vendre, pas pour recopier. »), names the three automations and the tools they connect, and offers one action, « Discutons de votre projet » (mailto). No price is shown. Its transit-line map draws the prospection line (Apollo → Claude → your validation → sending and follow-up → HubSpot), with L2 commercial watch and L3 admin as branches. `main` then shows one screen per real problem (prospection alongside the phone call; commercial watch: contacts, positioning, prices; admin: revenue reporting and cash visibility), each with the tools it connects drawn as a small line of stops; then « Comment on travaille » (start from the real flow, one first case, measure, put into service); then the contact call to action. « Qui intervient » with the CV link, projects, talks and notes follow as secondary content. There are no clients on this offer yet: no testimonials, client figures, logos or invented interfaces.

Use Instrument Serif for the name and large section/project titles, including an italic accent; Geist Sans for reading; Geist Mono for compact metadata and numbering. Capture the real reference at desktop/mobile dimensions and compare its bottom-weighted hero, below-hero navigation, restrained surfaces and thin rules—not only its palette. Locally bundle licensed fonts; no network font dependency. Keep the attached CV private and do not turn the homepage into its chronology.

The inspected reference is a custom HTML/CSS/JavaScript shell; `#react` is a catalogue section, not proof of a React host or an installable shadcn theme. Reuse the working static renderer rather than adding a framework solely for styling. Retain background/foreground/primary/muted/accent/border roles compatible with component theming. Dark colors follow the reference; the light variant uses the same hierarchy with readable dark text and an olive link accent. See `docs/font-provenance.md` for exact font sources and licenses.

## Composition and behavior

Use a left-aligned editorial frame up to 1200px, a hero that starts near the top of the page (no empty band above the offer), small role metadata, a monumental serif headline, and the owner band colour running full-bleed behind the hero (no dotted texture: the line map carries the only grid). Keep CV/contact visible before the navigation band; do not require animation to read or act. Avoid fake stats, dashboard ornaments or the reference's huge catalogue. The line map is the one animated element: a CSS signal travels the route and lights each stop; reduced motion stops it and the numbered log below carries the same steps without animation. Below 600px the map hides its SVG labels and relies on that log. Present each project once in a compact ruled list with purpose, working destination and source. Main navigation sits beneath the hero without a sticky overlay. Fit 320px without horizontal document overflow; code scrolls inside its own block.

Appearance choices sit in the subdued footer beside the site credit, not in the identity/header or as a primary call to action (owner revision, 13 October 2026). Keep their transparent, borderless text styling and 44px touch targets. They carry aria-pressed, persist when storage works, and Auto follows device changes. No-JavaScript Auto uses the OS preference through CSS. Focus is visible and reduced motion disables smooth scrolling.

## Honest content

No articles are currently approved. The committed snapshot contains only verified existing public content, including the approved Club Med scale sentence, projects, CV, talk, profile/contact links and preserved privacy destination. Omit notes, search, topics and their navigation links when their published content is absent; restore them automatically when published data exists. Never fill gaps with draft titles, fabricated dates, sponsors, courses or publishing history. Published notes alone participate in search and topic filtering.

## Rendering boundary

The shared renderer and styles are code-owned; Notion edits constrained data only. Use the contract in docs/public-renderer.md. Private previews use those exact bytes with a visible private label and noindex, not a lookalike dashboard. Privacy remains byte-for-byte unchanged with its self-contained historical styles. Prior sketches and submission evidence are historical, not validation of this candidate.
