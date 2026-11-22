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

The homepage follows `docs/homepage-script.md`: the direction B specimen notebook, the assistant demonstrations, biography, contact and preserved secondary content. The demonstrations have accessible static final states and optional replayable animation.

Use Instrument Serif for the name and large section/project titles, including an italic accent; Geist Sans for reading; Geist Mono for compact metadata and process-step numbering; homepage section headings are unnumbered. Capture the real reference at desktop/mobile dimensions and compare its bottom-weighted hero, below-hero navigation, restrained surfaces and thin rules—not only its palette. Locally bundle licensed fonts; no network font dependency. Keep the attached CV private and do not turn the homepage into its chronology.

The inspected reference is a custom HTML/CSS/JavaScript shell; `#react` is a catalogue section, not proof of a React host or an installable shadcn theme. Reuse the working static renderer rather than adding a framework solely for styling. Retain background/foreground/primary/muted/accent/border roles compatible with component theming. Dark colors follow the reference; the light variant uses the same hierarchy with readable dark text and an olive link accent. See `docs/font-provenance.md` for exact font sources and licenses.

## Composition and behavior

Use a left-aligned editorial frame up to 1200px, a black full-bleed hero, ivory serif headline, lime accent and navigation below the hero. Specimen cards remain readable without JavaScript or motion and at 320px without horizontal overflow. Present each project once in a compact ruled list.

Appearance choices sit in the subdued footer beside the site credit, not in the identity/header or as a primary call to action (owner revision, 13 October 2026). Keep their transparent, borderless text styling and 44px touch targets. They carry aria-pressed, persist when storage works, and Auto follows device changes. Dark is the default, including without JavaScript. Focus is visible and reduced motion disables smooth scrolling.

## Honest content

The committed snapshot contains published articles, real projects, CV, talks, profile/contact links and the preserved privacy destination. Omit notes, search, topics and their navigation links when their published content is absent; restore them automatically when published data exists. Never fill gaps with draft titles, fabricated dates, sponsors, courses or publishing history. Published notes alone participate in search and topic filtering.

## Rendering boundary

The shared renderer and styles are code-owned; Notion edits constrained data only. Use the contract in docs/public-renderer.md. Private previews use those exact bytes with a visible private label and noindex, not a lookalike dashboard. Privacy remains byte-for-byte unchanged with its self-contained historical styles. Prior sketches and submission evidence are historical, not validation of this candidate.

## Current verification

The homepage rebuild needs fresh production performance and accessibility measurements after release; historical sketch and submission scores do not describe this candidate. Local automated checks and screenshots cover this implementation, not live performance.
