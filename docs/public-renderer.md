# Published site and protected-preview contract

## Source and authority

The accepted architecture is the signed service spec `35096fa5964fd2591a44f1685a096e0a1125e71e:docs/2026-10-12-notion-cms.md`, attached to task t_4fe0a2c6. The service owns authentication, source-version selection, owner-only release authorization, durable promotion/CAS/replay protection and delivery. This repository consumes only published projections and makes no Notion/runtime request.

`d6b5d8c` first preserves the attached verified two-file live baseline. `content/published.json` now contains that approved public prose and real projects, with zero articles. Existing canonical Git/source destinations, CV, talk, contact and privacy remain useful.

## Public schema v1

Homepage correction (22 October 2026): show professional context before personal experiments, keep CV/contact directly available, render projects once, and omit empty notes/search/topics plus their links. Preserve all existing real destinations and the date-only article contract. This presentation release does not authorize Notion publication, private-service activation or preview renderer updates; reconcile new shared pins before future CMS delivery.

Approved HaveSome curation: replace the existing Speaking heading with Talks & learning, retaining `#speaking`. Show the HaveSome… series as three compact list entries: OIDC (interactive guide, 2026), Worktrees (slides, 2026) and Rust APIs (API Days Paris, 2023). Retain the existing talk video, add its slides, and link All presentations to `https://github.com/Zacaria/zacaria#links`. Years and destinations come from that public profile; no new section, cards, article collection, remote embed, dependency or Notion write is needed. The existing schema and published snapshot remain unchanged.

Canonical validator: `scripts/schema.mjs`. Root fields are exactly `schemaVersion`, `revision`, `articles`, `projects`, `site`, `navigation`. An article has schemaVersion, slug, title, excerpt, version, publishedAt, topics, seo `{title,description}`, blocks `{kind,spans,language?,asset?}`. Rich spans accept text, bold/italic/code/strike flags and a safe href. No arbitrary HTML, script, private block/source IDs, context or draft DTO fields.

Project: `{slug,title,description,href,image?,featured,order}`. Site: `{intro,bio,contact:[{label,href}],selectedSlugs}`. Navigation: `{label,href,visible,order}`. Selection must name existing published article slugs. Images are optional for projects but required for image blocks. Unsafe/unknown data, duplicate slugs/topics/selections, unsupported blocks, missing assets and wrong digest pins fail closed.

Digests match the service canonical JSON order in `server/cms.ts`: article content `{schemaVersion,slug,title,excerpt,topics,seo,blocks,originalPublication?}`; version is SHA256 of JSON.stringify(content). Optional `originalPublication` is exactly `{publishedAt,url}` in that order. Article projection adds version then publishedAt. Site content `{schemaVersion,projects,site,navigation,articles}`; revision is its digest. Optional false rich-text flags are omitted during canonicalization. `pinSnapshot` is an offline integrity helper, not release authorization. ISO timestamps have UTC millisecond precision. Limits match the service; the UI additionally rejects dangling selected slugs, invalid calendar timestamps and private control-plane link destinations.

`publishedAt` always means actual website promotion. Historical imports use optional `originalPublication` for the verified original date and public LinkedIn post URL, both bound to the content pin. The timestamp must round-trip exactly, be at or after the Unix epoch, and not exceed now or website promotion. The URL must be an HTTPS LinkedIn `/posts/<slug>` or `/feed/update/urn:li:activity:<digits>` link, without credentials, query, fragment or escapes. Unknown or partial metadata fails closed. At the author's request, listings and article metadata display only the original date, without source links, platform labels or adaptation notices. Provenance and actual website promotion remain in the validated snapshot, not in the rendered attribution. Listings sort descending by original date when present, otherwise website date. Ordinary notes are unchanged; no new collection exists.

## Exact shared renderer

Vendor these files without editing their bytes and retain a per-file SHA256 manifest:

- `scripts/render.mjs` and `scripts/schema.mjs` (Node >=22; no runtime package dependencies).
- `client/assets/styles.css`, `client/assets/theme-init.js`, `client/assets/site.js`.
- `client/assets/fonts/geist-mono.woff2` and `licenses/geist-mono-OFL.txt`.
- `client/assets/fonts/geist-regular.woff2` and `geist-bold.woff2`, with `licenses/geist-OFL.txt`; `instrument-serif-regular.woff2` and `instrument-serif-italic.woff2`, with `licenses/instrument-serif-OFL.txt`. The latest identity follows Uncommon Web, superseding the interrupted Sandstone candidate. Font origins are recorded in `docs/font-provenance.md`.
- `content/published.json` as the verified public baseline for homepage/About/navigation/project preview context.

Exports: `renderIndex(snapshot,{preview:true})`, `renderArticle(article,snapshot,{preview:true})`, `renderArticleBody(article)`. Full renderers return HTML documents, not React JSX. The protected service must authorize before supplying any selected draft DTO, derive public-shaped fields and pins without private IDs/URLs, and never put that DTO into public Git/output. Preview has no canonical URL or website publication date, and displays PRIVATE PREVIEW / Not published. Historical previews show only the original date, matching the public article date without exposing provenance. That rendering option is not an access-control boundary; the caller owns effective authorization. Media must be frozen local hash-addressed copies or visibly blocked by the service before rendering. Unsupported draft content must surface warnings rather than be silently dropped.

Serve assets at identical absolute paths. A private preview response must retain external theme-init/site scripts, CSS and font bytes; do not embed the document into an unrelated styled page. Index navigation always points at public routes; preview linkage may be separately protected but cannot expose draft endpoints. Tests prove exact article-body equality and identical assets in public/private variants. No public fixture/preview route exists.

## Build and failure behavior

`make build` reads the canonical public snapshot, validates hashes and structure, renders all pages, verifies each frozen asset's SHA256 and image signature, and stages an allowlisted static tree before replacement. It never copies the snapshot JSON, source modules, tests, fixtures, secrets or private content. Missing/malformed snapshots and failed media verification leave last-known-good output unchanged and fail the command, so deployment must not proceed. Missing provider configuration is irrelevant: the committed public snapshot is sufficient. Notion outage cannot alter the deployed output.

Articles become `/blog/<slug>.html`, served by Vercel cleanUrls as `/blog/<slug>`. Sitemap entries derive only from published articles. Rebuild removes unpublished/stale article files. Asset paths are `/content/assets/<SHA256>.(png|jpg|webp|gif)`, at most 10MiB; symlinked/mismatched/executable formats are rejected. Existing assets are code-owned; media ingestion/SSRF protection belong to the service.

## Verification and next release step

Run `npm ci --ignore-scripts`, `npm test`, `make build`, `npm run lint`, `npm run format:check`, `npm run test:browser`, design-spec lint and `git diff --check`. Browser tests use installed Brave; CI may set `HSC_BROWSER_EXECUTABLE` or install Playwright Chromium. Synthetic fixtures exist only in tests and the loopback harness, never the production snapshot/output.

The pre-created reviewer t_23f1b1dc consumes the signed UI candidate and service candidate. Integrator freezes the combined candidate and checks vendored hashes/build/preview parity; release remains the existing chain. This UI task performs no deployment, live Notion/provider writes, draft publication or release-triggering push.
