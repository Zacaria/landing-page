---
version: alpha
name: Editorial Authority
description: Calm editorial clarity for strategic technical leadership.
colors:
  primary: "#172019"
  secondary: "#465148"
  muted: "#636F64"
  tertiary: "#C64F2B"
  tertiary-ink: "#A94222"
  accent: "#1F5B47"
  neutral: "#F1EEE6"
  surface: "#FBFAF6"
  on-tertiary: "#FFFFFF"
  accent-light: "#B8D7CA"
  tertiary-light: "#F0A489"
typography:
  display-xl:
    fontFamily: Newsreader
    fontSize: 6.25rem
    fontWeight: 500
    lineHeight: 0.93
    letterSpacing: "-0.055em"
  display-lg:
    fontFamily: Newsreader
    fontSize: 4.375rem
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.045em"
  heading-md:
    fontFamily: Newsreader
    fontSize: 1.9375rem
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  body-lg:
    fontFamily: Manrope
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0em
  body-md:
    fontFamily: Manrope
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0em
  label:
    fontFamily: DM Mono
    fontSize: 0.6875rem
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.1em
rounded:
  none: 0px
spacing:
  xs: 8px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 96px
components:
  page:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "{spacing.md}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "{spacing.sm}"
  button-secondary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "{spacing.sm}"
  questions-panel:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.none}"
    padding: "{spacing.lg}"
  contact-panel:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "{spacing.xl}"
  secondary-copy:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "{spacing.xs}"
  quiet-copy:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.muted}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "{spacing.xs}"
  accent-label:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-light}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "{spacing.xs}"
  dark-label:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.tertiary-light}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "{spacing.xs}"
  paper-label:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.tertiary-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "{spacing.xs}"
---

## Overview

Editorial Authority presents Zacaria as a curious technical leader and maker. The identity should feel closer to a thoughtful journal or personal publication than a software-product landing page. It is calm, assured, and human. Technical credibility comes through the things he makes and the questions he follows, not decorative code motifs.

The visual hierarchy welcomes people into Zacaria’s world: establish a personal point of view, show real projects, then reveal the questions and interests that connect them.

## Colors

- **Primary / Ink (`#172019`):** Headlines, primary actions, and high-emphasis surfaces. Its slight green cast feels warmer and more distinctive than black.
- **Secondary (`#465148`):** Long-form copy with strong contrast while allowing display typography to lead.
- **Muted (`#636F64`):** Supporting text and metadata. It clears WCAG AA against the paper background, including at small sizes.
- **Tertiary / Clay (`#C64F2B`):** Interaction, focus, and the final call to action. The value is dark enough for white body text to meet WCAG AA.
- **Accent / Forest (`#1F5B47`):** Questions, quotations, and reflective passages. It signals considered curiosity rather than status or success.
- **Neutral / Paper (`#F1EEE6`):** Main canvas. It should feel tactile and editorial without introducing texture that hurts readability.
- **Surface (`#FBFAF6`):** High-contrast light text and occasional lifted surfaces.

Orange and green are semantic accents, not decoration. Do not spread both evenly through every section.

## Typography

Newsreader carries the identity. Use it for the hero, project names, section statements, and quotations. Its optical sizing and restrained contrast communicate authority without becoming institutional.

Manrope is the working voice: straightforward, contemporary, and highly readable. Use it for explanations, navigation, and controls.

DM Mono is reserved for labels, locations, categories, and compact metadata. It gives technical precision in small doses. Do not use it for paragraphs or large pseudo-terminal displays.

Display text may use tight leading and negative tracking. Body text must remain comfortable, with approximately 1.55 line height and a practical line length.

## Layout

Use a maximum content width of 1180px with generous vertical intervals. Composition is asymmetric: the hero copy carries more weight than the portrait, and section labels occupy a deliberate left rail on wide screens.

Hairline borders structure content without creating a dashboard of cards. The four-word world index sits directly below the hero as orientation, not as proof.

At 800px and below, all major compositions become single-column. Actions stack, the navigation becomes an accessible disclosure, the portrait remains secondary to the statement, and project copy precedes each image. At 480px, the world index becomes a vertical list.

## Elevation & Depth

The default page is flat. Use no blur shadows, gradients, glass effects, or floating card layers. The only deliberate depth is a hard clay offset behind the speaking card and button hover states. This should feel printed, not rendered.

## Shapes

Corners are square. Structure comes from proportion, rules, and spacing rather than radius. The portrait is rectangular and intentionally cropped; do not turn it into an avatar.

## Components

- **Primary button:** Ink surface, paper text, square border, compact label. A clay hard shadow may appear on hover.
- **Secondary button:** Transparent paper surface with an ink border. It must not compete with the primary action.
- **World-index item:** One large verb—Make, Learn, Share, or Lead—followed by one restrained explanation.
- **Project feature:** Real project name, personal reason for making it, compact technology label, live/source links, and one truthful screenshot.
- **Question disclosure:** One question, one personal explanation, and a native interaction. Avoid values-poster language.
- **Quote panel:** Forest background, large Newsreader quotation, and minimal labeling.
- **Contact panel:** Full-width clay surface near the end of the page, with white text and one clear action.
- **Paper label:** Small DM Mono metadata on paper uses the darker clay variant so it remains AA-readable.

## Do's and Don'ts

### Do

- Lead with curiosity, personality, and things Zacaria has made.
- Use generous whitespace and strong typographic scale.
- Let the portrait support the story rather than dominate it.
- Keep career metrics in the résumé and LinkedIn rather than repeating them here.
- Preserve visible focus states, reduced-motion support, and AA contrast.
- Use technical vocabulary only when it helps someone understand a project or idea.

### Don't

- Turn the homepage into a framework inventory or terminal simulation.
- Add gradients, glassmorphism, soft shadows, or rounded card grids.
- Turn the homepage into a résumé, impact ledger, or generic leadership pitch.
- Fill empty space with icons, abstract tech art, or code snippets.
- Use clay and forest as interchangeable decoration.
- Let display typography reduce mobile readability or force awkward single-line phrases.
