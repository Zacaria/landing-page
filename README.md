# HaveSomeCode public site

Static personal publication for Zacaria Chtatar. The owner edits constrained content in Notion; the separately protected service promotes explicitly approved immutable snapshots. Article content renders only from `content/published.json`, without Notion credentials or runtime content access. A separate server-only Neon reader supplies the owner's site/CV appearance settings; it cannot publish content.

## Develop and verify

```sh
npm ci --ignore-scripts
make dev
```

`make dev` builds and serves `dist/`. The renderer is `scripts/render.mjs`, validation is `scripts/schema.mjs`, static assets/utility pages are in `client/`. No canonical homepage is hand-edited in `client/`; the build generates it from the snapshot. Invalid content or missing/unsafe media fails the build without replacing last-known-good output.

```sh
npm test
make build
npm run lint
npm run format:check
npm run test:browser
npx -y @google/design.md lint DESIGN.md
git diff --check
```

Browser tests use `/usr/bin/brave-browser`; set `HSC_BROWSER_EXECUTABLE` for an installed alternative. The loopback-only harness contains synthetic fixtures for published block/search/topic tests. No test fixture, preview, source JSON or private DTO is copied to production output. Browser captures and JSON results live in ignored `.local/`.

## Content and preview contract

Read `docs/public-renderer.md` for exact DTO/digest rules, safe media/link policies, exports and preview integration. `DESIGN.md` is the Uncommon Web-inspired Instrument Serif / Geist / Geist Mono design, with explicit Light/Dark/Auto controls. The self-hosted Geist font's SIL OFL is in `licenses/`.

The 40 approved appearance palettes stay in source. `HSC_APPEARANCE_DATABASE_URL` is a server-only restricted SELECT credential, never a browser variable. Default appearance is Teknium, soft hero band, Instrument Serif / Geist / Mono; private previews never read the public dynamic endpoint. Real first-paint and cache measurements determine whether Neon is retained or the admin becomes preview-only.

The public snapshot keeps the approved Club Med scale sentence, real projects, talk, CV and contacts, behind a French services-first homepage (AI installation, agentic workflows, team training). Empty article/search/topic sections and their navigation are omitted until published content exists. Prior sketches, award submissions and their scorecards describe the earlier design, not this candidate. The existing editorial-scout privacy page is intentionally byte-identical.

## Release

The existing public project is `havesomecode-landing` on Vercel, production domain `www.havesomecode.io`; apex remains the Gandi-managed redirect. `vercel.json` builds `dist/` and enables clean article URLs. The GitHub workflow verifies only; it performs no publication/deployment.

The existing review/integration/release chain must accept the exact signed candidate before a release worker uses the preserved deployment commands. Renderer/style vendoring must retain the manifest and exact bytes. This implementation does not deploy or publish drafts.
