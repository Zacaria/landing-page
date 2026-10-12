---
version: alpha
name: Reference-first HaveSomeCode
description: A compact monospace personal publication with explicit appearance controls.
colors:
  primary: "#000000"
  secondary: "#646464"
  accent: "#0000EE"
  neutral: "#FFFFFF"
  surface: "#F4F4F1"
  dark-background: "#101113"
  dark-text: "#E7E9ED"
  dark-muted: "#A4A9B2"
  dark-link: "#8CA7FF"
  dark-surface: "#1C1E23"
typography:
  heading:
    fontFamily: Geist Mono
    fontSize: 1.25rem
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0.025em
  body:
    fontFamily: Geist Mono
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: 0em
  article:
    fontFamily: Geist Mono
    fontSize: 0.9375rem
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
    textColor: "{colors.accent}"
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
---

## Accepted identity

The owner accepted the reference-first Flavio-inspired appearance and explicit Light / Dark / Auto controls. This replaces Editorial Authority for the public homepage and articles. Use Geist Mono throughout, white/black/blue, uppercase cursor-mark identity, bracketed right-aligned navigation, search-first notes, compact dash-bulleted rows with inline dates/topics, pale selected-note blocks, tilde separators, and separate topics/About sidebar and outside project rail.

The prototype's original CSS and licensed embedded Geist font were extracted, not copied from the external reference website. The local font and SIL OFL are retained in client/assets/fonts and licenses. No network font dependency is needed.

## Composition and behavior

The outer frame is 1280px; the inside article/topic columns are separate from the 160px outside project rail. At 1199px the rail becomes project shortcuts; at 850px content/sidebar stack. At 520px projects stack. Keep content readable at 320px without document overflow; long code scrolls within its own block.

Appearance choices remain visible, carry aria-pressed, persist when storage works, and Auto follows device changes. No-JavaScript Auto uses the OS preference through CSS. Focus is visible and reduced motion disables smooth scrolling.

## Honest content

No articles are currently approved. The committed snapshot contains only verified existing public content, including the approved Club Med scale sentence, projects, CV, talk, profile/contact links and preserved privacy destination. Show empty notes/topics rather than draft titles, fabricated dates, sponsors, courses or publishing history. Published notes alone participate in search and topic filtering.

## Rendering boundary

The shared renderer and styles are code-owned; Notion edits constrained data only. Use the contract in docs/public-renderer.md. Private previews use those exact bytes with a visible private label and noindex, not a lookalike dashboard. Privacy remains byte-for-byte unchanged with its self-contained historical styles. Prior sketches and submission evidence are historical, not validation of this candidate.
