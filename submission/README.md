# HaveSomeCode — award submission brief

## Submission title

**HaveSomeCode — A corner of the web**

## Short description

A warm editorial home for Zacaria Chtatar’s software, side projects, talks, and current questions. The site introduces a curious maker before it asks visitors to understand a professional title.

## Suggested categories

- Portfolio
- Personal
- Technology
- Editorial

## Project story

HaveSomeCode began as a professional portfolio full of outcomes and case studies. It was polished, but it sounded like a résumé. The final concept makes a deliberate channel choice: the CV carries evidence and chronology; the landing page welcomes people into Zacaria’s world.

The opening decision field turns one persistent habit—asking why—into a map of context, systems, people, and operations. Four doorways introduce what Zacaria likes to make, learn, share, and lead. The main chapter features three real public projects: Float, an always-on-top image utility; an interactive Rust/WASM pathfinding visualizer; and a read-only MCP for structured Kibana log investigations.

The second interactive chapter is built from questions Zacaria returns to rather than leadership claims. A native-details interface lets visitors explore how he looks at systems, explanations, people, and experiments. The page closes with a public talk, personal interests, a direct Lead Developer invitation, and a visible email address.

The visual identity remains **Editorial Authority**: warm paper, dark ink, forest green, clay accents, square geometry, large Newsreader typography, and restrained technical labels. The tone is personal, curious, and calm.

## Jury-facing highlights

1. **A real point of view**  
   The site refuses the common personal-brand pattern of repeating résumé proof on every channel. Its content is selected to create recognition and curiosity.

2. **Real things, not project placeholders**  
   Float, Pathfinding, and Kibana Log Investigation MCP are working public experiences. Every project image is a capture from the actual project; the Kibana example uses explicitly synthetic data.

3. **Curiosity as the visual language**  
   The hero map and question matrix make Zacaria’s habits visible without terminal chrome, decorative code, generic particles, or an unrelated 3D scene.

4. **Progressive interaction**  
   Core content is complete without JavaScript. Intersection reveal, pointer depth, current-section navigation, and native disclosures enhance existing semantics.

5. **Deliberate performance and accessibility**  
   The site uses static HTML, CSS, JavaScript, SVG, and optimized WebP captures. Fonts are self-hosted. There is no framework, animation library, WebGL runtime, or analytics dependency in the critical path.

## Measured quality

See [`scorecard.json`](scorecard.json) for the machine-readable summary.

| Audit | Mobile | Desktop |
|---|---:|---:|
| Performance | 100 | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |
| Total Blocking Time | 0 ms | 0 ms |
| Cumulative Layout Shift | 0 | 0 |

These figures were measured against the verified production domain on Vercel over HTTPS. They must be refreshed after any material source change.

## Award-criteria alignment

### Awwwards

- **Design:** editorial hierarchy, asymmetric hero, color chapters, real project imagery, cohesive square geometry.
- **Usability:** direct navigation, visible project destinations, mobile state, native disclosures, no hidden core information.
- **Creativity:** WHY? decision field, large live-project chapters, interactive recurring-question map.
- **Content:** a specific human voice and usable public work rather than generic professional claims.

### Developer Award

- Semantic landmarks and heading hierarchy
- Local metadata and structured Person data
- Responsive portrait and lazy-loaded project imagery with explicit dimensions
- Motion limited to transforms and opacity
- Reduced-motion and no-JavaScript fallbacks
- Self-hosted fonts and zero runtime dependencies

### CSS Design Awards

- **UI:** authored editorial system with content-specific visual chapters
- **UX:** clear doorway index, usable project links, native question disclosures
- **Innovation:** the visual concept comes from personal curiosity rather than decorative development effects

The full benchmark and source research are in [`../AWARD-READINESS.md`](../AWARD-READINESS.md).

## Presentation assets

| Asset | Purpose |
|---|---|
| [`assets/awwwards-1600x1200.png`](assets/awwwards-1600x1200.png) | Exact 1600 × 1200 Awwwards principal image |
| [`assets/cssda-1068x646.jpg`](assets/cssda-1068x646.jpg) | Exact 1068 × 646 CSSDA image; 81,499 bytes |
| [`assets/desktop-hero.png`](assets/desktop-hero.png) | Desktop first viewport |
| [`assets/mobile-hero.png`](assets/mobile-hero.png) | Mobile first viewport |
| [`assets/project-float.png`](assets/project-float.png) | Real maker-project chapter |
| [`assets/projects-showcase.png`](assets/projects-showcase.png) | Complete selected-projects chapter |
| [`assets/questions-matrix.png`](assets/questions-matrix.png) | Interactive curiosity concept |
| [`assets/desktop-full-page.png`](assets/desktop-full-page.png) | Complete desktop page |
| [`assets/mobile-full-page.png`](assets/mobile-full-page.png) | Complete mobile page |

Platform-specific constrained fields, descriptions, credits, and rights checks are prepared in [`platform-copy.md`](platform-copy.md).

## Suggested submission copy

> HaveSomeCode is Zacaria Chtatar’s corner of the web: a place for software, side projects, talks, and questions he is still following. Real working projects sit beside a small interactive map of how he looks at systems and ideas. The warm editorial design keeps the experience personal without falling back on résumé proof or developer-portfolio clichés.

## Credits

- Owner, subject, and project author: **Zacaria Chtatar**
- Human collaborators: **None**
- Portrait rights: **Fully owned by Zacaria Chtatar**
- Project-capture reproduction: **Authorized as needed for submission and award-directory media**
- Identity: **Editorial Authority**
- Site: **HaveSomeCode**
- Country: **France**
- Technologies: **HTML, CSS, JavaScript, SVG, WebP**

## Reproduce locally

```sh
make dev
python3 tests/test_site.py -v
npx -y html-validate 'client/*.html'
npx -y @google/design.md lint DESIGN.md
make build
```

## Before a real submission

- [ ] Deploy the current `dist/` build to production.
- [ ] Verify the production URL after the Vercel deployment.
- [ ] Run Lighthouse against production over HTTPS.
- [ ] Confirm every live project, email, CV, LinkedIn, GitHub, and talk destination from production.
- [x] Confirm portrait ownership, project-capture reproduction rights, and human collaborators.
- [ ] If a platform explicitly asks about AI-assisted production, answer that field accurately.
- [ ] Choose the award program and complete its account/payment step.
- [ ] Reconfirm each platform's current form limits and image specification at checkout.
- [ ] Confirm the final title, description, credits, and exact platform screenshot from [`platform-copy.md`](platform-copy.md).

No external award submission, payment, push, or infrastructure apply has been performed.
