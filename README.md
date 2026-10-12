# HaveSomeCode public site

Static personal publication for Zacaria Chtatar. The owner edits constrained content in Notion; the separately protected service promotes explicitly approved immutable snapshots. This repository renders only `content/published.json`. It needs no Notion credentials or runtime service access, and ships useful verified public defaults with no approved articles.

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

Read `docs/public-renderer.md` for exact DTO/digest rules, safe media/link policies, exports and preview integration. `DESIGN.md` is the accepted reference-first Geist Mono / white-black-blue design, with explicit Light/Dark/Auto controls. The self-hosted Geist font's SIL OFL is in `licenses/`.

The committed snapshot preserves the live approved intro, Club Med scale sentence, real projects, talk, CV and contacts. Articles/topics remain honestly empty. Prior sketches, award submissions and their scorecards describe the earlier design, not this candidate. The existing editorial-scout privacy page is intentionally byte-identical.

## Release

The existing public project is `havesomecode-landing` on Vercel, production domain `www.havesomecode.io`; apex remains the Gandi-managed redirect. `vercel.json` builds `dist/` and enables clean article URLs. The GitHub workflow verifies only; it performs no publication/deployment.

The existing review/integration/release chain must accept the exact signed candidate before a release worker uses the preserved deployment commands. Renderer/style vendoring must retain the manifest and exact bytes. This implementation does not deploy or publish drafts.
