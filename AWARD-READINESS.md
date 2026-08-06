# Award-readiness brief

_Last researched: 2026-08-02_

## Objective

Make HaveSomeCode credible as a submission to a major web-design gallery while preserving the reason the site exists: welcome visitors into Zacaria's world through curiosity, making, teaching, and questions worth following. Technical leadership provides context; the CV remains the evidence-first channel.

The target is not “award-looking.” The target is authored art direction, content-native interaction, excellent usability, and unusually strong implementation discipline.

## Official evaluation systems

### Awwwards

The [Awwwards evaluation system](https://www.awwwards.com/about-evaluation/) currently weights jury scores as:

- **Design: 40%**
- **Usability: 30%**
- **Creativity: 20%**
- **Content: 10%**

The same page states that an average of 6.5 can receive Honorable Mention. Site of the Day selection is more competitive and also considers the Developer Award.

The Developer Award uses six dimensions in the [guideline linked by Awwwards](https://docs.google.com/document/d/1Gvmg6Z60UQ-4BOM3XyUcBKvq2shd4J-l_MoXT26JFEg/edit):

1. Semantics and SEO
2. Animations and transitions
3. Accessibility
4. Web Performance Optimisation
5. Responsive design
6. Markup and metadata

### CSS Design Awards

The [CSSDA awards explanation](https://www.cssdesignawards.com/about) says Website of the Day normally requires a judge average above 8.00, while scores above 6 can receive Special Kudos. Its public awards evaluate **UI, UX, and Innovation** and also require public votes.

The [CSSDA submission page](https://www.cssdesignawards.com/submit) currently lists a USD 50 submission fee and requires complete, original work with a high-quality screenshot and accurate submission information.

## Recent references inspected

These are references, not templates to copy.

| Site | Verified recognition | Useful lesson | Do not copy |
| --- | --- | --- | --- |
| [Russell Numo](https://www.russellnumo.nl/) · [CSSDA record](https://www.cssdesignawards.com/sites/russell-numo/49728/) | CSSDA Website of the Day, 2026-07-26, judge score 8.00 | One memorable typographic thesis, central portrait, strong pacing, clear section numbering | Monochrome creative-developer positioning and WebGL for its own sake |
| [TRIONN](https://www.awwwards.com/sites/trionn-2) | Awwwards Site of the Day, 2026-07-27, score 7.42; Developer score 7.05 | Bespoke interactions attached to individual sections; transitions are part of the identity | Sound, particle explosions, and interaction density that would weaken a strategic-leadership tone |
| [Artem Shcherbakov](https://www.awwwards.com/sites/artem-shcherbakov) | Awwwards Site of the Day, 2026 | Strong project pacing and authored image behavior | Art-direction tropes that do not communicate technical leadership |
| [Daniela Muntyan](https://www.awwwards.com/sites/portfolio-of-daniela-muntyan) | Awwwards nominee, 2026-07-29 | Rich media makes work feel tangible and personal | Rounded card-grid composition; its community scores show polish alone is not enough |
| [Cula Technologies](https://www.cssdesignawards.com/sites/cula-technologies/49729/) | CSSDA Website of the Day, 2026 | Product-specific diagrams, trust proof, and chapter-level color rhythm | Generic climate-tech aesthetics or cursor effects detached from meaning |
| [Marina Rachello](https://onepagelove.com/marina-rachello) | One Page Love feature | Concise one-page narrative and direct conversion path | Treating curated inclusion as a juried award |
| [RIPE — Leadership Is a Lifestyle](https://land-book.com/websites/96654-ripe-leadership-is-a-lifestyle) | Landbook verified gallery entry | Leadership content can carry expressive editorial direction without product screenshots | Lifestyle-brand language that dilutes evidence |
| [Brand Federation](https://land-book.com/websites/97133-brand-federation-strategic-consultancy-for-brands) | Landbook gallery entry | Strategic consulting is made tangible through narrative chapters and restrained art direction | Agency-style abstraction without individual proof |

## Pre-rework baseline and target

The site before this rework was estimated against the official Awwwards weights:

| Dimension | Baseline | Target | Gap |
| --- | ---: | ---: | --- |
| Design | 7.5 | 8.5 | Strong system; needs more authored composition and chapter rhythm |
| Usability | 8.5 | 9.0 | Preserve clarity while adding interaction |
| Creativity | 5.2 | 8.2 | Static presentation does not yet express the substance of the work |
| Content | 8.7 | 9.0 | Strong substance; make the person and his curiosity tangible |
| **Weighted** | **7.46** | **8.64** | Creativity is the limiting dimension |

## Verified implementation result

- Lighthouse mobile: **100 performance / 100 accessibility / 100 best practices / 100 SEO** on the verified Vercel HTTPS deployment.
- Lighthouse desktop: **100 / 100 / 100 / 100**.
- Total Blocking Time: **0 ms** on both audits.
- Cumulative Layout Shift: **0** on both audits.
- Acceptance suite: **30 tests passing**.
- HTML validation, JavaScript syntax, design-token validation, clean build, and `client`/`dist` parity: **passing**.
- Main HTML/CSS/JavaScript payload: **12.6 KiB gzipped**.
- Runtime dependencies: **none**.

The weighted 8.64 award score remains a reasoned readiness target rather than a jury result. Only an external jury can assign an official score or award.

## Creative concept: editorial curiosity

The site should welcome visitors into Zacaria’s world without asking every section to prove his professional value.

1. **Hero — follow the question.** A bespoke map connects context, systems, people, and operations around the portrait and a simple curiosity-led introduction. Pointer response is subtle; the non-JavaScript state remains complete.
2. **World index.** Make, Learn, Share, and Lead are doorways into the site rather than performance metrics.
3. **Things made.** Float, Pathfinding, and Kibana Log Investigation MCP appear as large editorial project chapters using captures from the real live projects. Copy explains why each exists rather than presenting it as an accomplishment.
4. **Question matrix.** Recurring questions become native disclosures with a small interactive map. Without JavaScript, every answer remains open and readable.
5. **Speaking and About.** A public talk sits beside personal details, side-project habits, and current interests before the direct email invitation.

## Interaction rules

- Use only opacity and transform for continuous motion.
- Core content must be visible before JavaScript and when JavaScript fails.
- `prefers-reduced-motion: reduce` must remove reveals, parallax, and smooth scrolling.
- Interactive diagrams must remain understandable as static SVGs, and project imagery must have descriptive alternatives.
- Every control must work with keyboard, touch, and visible focus.
- No preloader, scroll hijacking, custom cursor, autoplay audio, or interaction that delays reading.
- No WebGL unless a later prototype proves a content-specific benefit that SVG cannot provide.

## Technical acceptance gates

### Awwwards Developer dimensions

- **Semantics/SEO:** one H1, named regions, meaningful figure captions, valid structured data, canonical/social metadata.
- **Animation:** purposeful chapter reveals, no layout-animation jank, reduced-motion parity.
- **Accessibility:** WCAG AA contrast, visible focus, skip navigation, keyboard-complete controls, no hidden content trap.
- **WPO:** no framework or animation library; small JavaScript; responsive portrait remains the LCP candidate; zero avoidable CLS.
- **Responsive:** verified at 390px and desktop, plus no overflow at 320px.
- **Markup/metadata:** valid HTML, descriptive alt text, 1200×630 social image, useful 404.

### Submission standard

- Estimated Awwwards weighted score at or above 8.2 before submission.
- CSSDA self-review at or above 8.0 for UI, UX, and Innovation.
- All automated tests, HTML validation, design-token lint, and clean build pass.
- Desktop and mobile visual review show no clipping, collision, or illegible decorative text.
- Browser console has no errors.
- Submission package includes the exact Awwwards 1600 × 1200 principal image and CSSDA 1068 × 646 JPG under 150 KB, plus full-page captures, platform-specific copy, creator credits, technologies, and interaction highlights.
- Rights confirmed: Zacaria owns the portrait, authorizes project-capture reproduction as needed, and has no human collaborators. The three bundled fonts use the OFL.
- If a submission form explicitly asks about AI-assisted production, answer that field accurately; AI tooling is not listed as a human collaborator.

## Disqualifying failure modes

- Generic SaaS card grid, gradients, terminal chrome, or decorative framework identity.
- Motion that obscures content or makes the page feel less thoughtful.
- Essential information hidden behind hover-only behavior.
- Fake metrics, animated counters, or claims not present in the evidence source.
- JavaScript-required initial visibility.
- Missing reduced-motion behavior, weak focus states, horizontal overflow, or inaccessible contrast.
- A heavy creative-development stack whose performance cost is larger than its narrative value.