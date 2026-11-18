# Published site and protected-preview contract

## Source and authority

The accepted architecture is the signed service spec `35096fa5964fd2591a44f1685a096e0a1125e71e:docs/2026-10-12-notion-cms.md`, attached to task t_4fe0a2c6. The service owns authentication, source-version selection, owner-only release authorization, durable promotion/CAS/replay protection and delivery. This repository consumes only published projections and makes no Notion/runtime request.

`d6b5d8c` first preserves the attached verified two-file live baseline. `content/published.json` now contains that approved public prose and real projects, with zero articles. Existing canonical Git/source destinations, CV, talk, contact and privacy remain useful.

## Public schema v1

Canonical validator: `scripts/schema.mjs`. Root fields are exactly `schemaVersion`, `revision`, `articles`, `projects`, `site`, `navigation`. An article has schemaVersion, slug, title, excerpt, version, publishedAt, topics, seo `{title,description}`, blocks `{kind,spans,language?,asset?}`. Rich spans accept text, bold/italic/code/strike flags and a safe href. No arbitrary HTML, script, private block/source IDs, context or draft DTO fields.

Project: `{slug,title,description,href,image?,featured,order}`. Site: `{intro,bio,contact:[{label,href}],selectedSlugs}`. Navigation: `{label,href,visible,order}`. Selection must name existing published article slugs. Images are optional for projects but required for image blocks. Unsafe/unknown data, duplicate slugs/topics/selections, unsupported blocks, missing assets and wrong digest pins fail closed.

Digests match the service canonical JSON order in `server/cms.ts`: article content `{schemaVersion,slug,title,excerpt,topics,seo,blocks,originalPublication?}`; version is SHA256 of JSON.stringify(content). Optional `originalPublication` is exactly `{publishedAt,url}` in that order. Article projection adds version then publishedAt. Site content `{schemaVersion,projects,site,navigation,articles}`; revision is its digest. Optional false rich-text flags are omitted during canonicalization. `pinSnapshot` is an offline integrity helper, not release authorization. ISO timestamps have UTC millisecond precision. Limits match the service; the UI additionally rejects dangling selected slugs, invalid calendar timestamps and private control-plane link destinations.

`publishedAt` always means actual website promotion. Historical imports use optional `originalPublication` for the verified original date and public LinkedIn post URL, both bound to the content pin. The timestamp must round-trip exactly, be at or after the Unix epoch, and not exceed now or website promotion. The URL must be an HTTPS LinkedIn `/posts/<slug>` or `/feed/update/urn:li:activity:<digits>` link, without credentials, query, fragment or escapes. Unknown or partial metadata fails closed. At the author's request, listings and article metadata display only the original date, without source links, platform labels or adaptation notices. Provenance and actual website promotion remain in the validated snapshot, not in the rendered attribution. Listings sort descending by original date when present, otherwise website date. Ordinary notes are unchanged; no new collection exists.

## Exact shared renderer

Vendor these files without editing their bytes and retain a per-file SHA256 manifest:

- `scripts/render.mjs` and `scripts/schema.mjs` (Node >=22; no runtime package dependencies).
- `client/assets/styles.css`, `client/assets/theme-init.js`, `client/assets/site.js`.
- `client/assets/fonts/geist-mono.woff2` and `licenses/geist-mono-OFL.txt`.
- `content/published.json` as the verified public baseline for homepage/About/navigation/project preview context.
- `scripts/appearance.mjs`, `appearance/catalogue.json`, `client/appearance-fallback.css`, and every file under `client/appearance-fonts/` (including licenses). Preserve these absolute `/appearance-fonts/<file>` URLs.

### Public appearance (independent of content digests)

`appearanceCss(choice, target = "site")` is a pure CSS generator. Choice is exactly `{theme,band,type}`: one of the 40 approved catalogue IDs, band `soft|accent|contrast`, type `geist|uncommon`. Default is `{theme:"teknium",band:"soft",type:"uncommon"}`. Unknown/extra fields or targets fail closed. `geist` uses Geist Sans headings/body and Geist Mono utility tokens; `uncommon` substitutes licensed Instrument Serif normal/italic headings. Bands style the site announcement or CV header only. Screen CSS maps semantic tokens to existing `--bg,--fg,--link,--muted,--border,--surface` or `--resume-*` variables with `!important`. Reader root `data-theme="light|dark"` always wins over device preference; absent/Auto follows `prefers-color-scheme`. CV output, including fonts and header styling, is wholly inside `@media screen`, leaving existing print/PDF CSS untouched.

Public pages load blocking fallback CSS followed by `/api/appearance?target=site`. Protected previews omit that public endpoint: the admin must serve its own authenticated CSS URL after the fallback. Preview callers must not substitute a public endpoint. Article bodies, source snapshots and digest construction are unchanged.

Owner decision, 23 October 2026: active appearance settings belong in a dedicated Neon Free database, not a Git branch. Git remains authoritative for code, palettes and fonts. The owner-authenticated admin alone writes the single `public.appearance_settings` row (`id = 'appearance'`), with an atomic version comparison and verified readback. Its `document` contains exactly `{site:choice,cv:choice}` and its `version` is a SHA256 hex digest of those exact text bytes. An absent row uses the existing Teknium defaults without writing. No article or Notion content enters this database. Font responses under `/appearance-fonts/` permit CORS `*` so the public CSS can also be consumed from the CV origin.

`api/appearance.mjs` accepts GET/HEAD with target `site|cv` (default site). The server-only `HSC_APPEARANCE_DATABASE_URL` must identify the dedicated Neon database; use a SELECT-only database role for this public runtime. The function issues only the fixed SELECT over Neon's HTTPS SQL transport, without redirects or browser credentials, with a 2-second full-response deadline and a 16384-byte response ceiling. Invalid UTF-8 is rejected before JSON parsing, never repaired and publicly cached. The returned document is limited to 8192 bytes; both choices and the version digest validate before use. No connection string or upstream error body is returned or logged.

`vercel.json` scopes only `api/appearance.mjs` to the `cdg1` region, near the dedicated Frankfurt database and the existing Paris admin runtime. It does not change the project's default region or unrelated functions. The Vercel project currently defaults to `iad1`; leaving the appearance function there would add a transatlantic database hop on cache misses. The function-specific `regions` setting is part of Vercel's published configuration schema.

Only validated, selected CSS receives `Cache-Control: public, max-age=60, s-maxage=60`; fallback/error responses remain `no-store`. This avoids a database read on every visitor while bounding cache visibility to a minute. There is no stale-while-revalidate extension. Responses retain credential-free CORS `*` and exposed `X-Appearance-Status: selected|fallback|invalid-settings|invalid-target|invalid-method`. Missing configuration, an absent row or a network outage returns explicit default CSS; malformed settings return HTTP 502, an invalid target HTTP 400 and an unsupported method HTTP 405. Caller-supplied URLs cannot change the SQL endpoint. Static builds copy only fonts/licenses and fallback, never database configuration/catalogue/source modules. Vercel separately runs the API function.

Latency is an activation criterion, not an assumed result: compare first paint against the hardcoded theme with a sleeping database and with warm shared/browser caches. If the real overhead is too high, keep the selected appearance in source and retain the admin as a preview-only workshop. Synthetic transport tests prove bounds and behavior, not actual Neon or Vercel performance. No database or deployment is claimed by this source change.

Regenerate the checked-in default fallback after generator changes:

```sh
node --input-type=module -e 'import {writeFile} from "node:fs/promises"; import {appearanceCss,DEFAULT_APPEARANCE} from "./scripts/appearance.mjs"; await writeFile("client/appearance-fallback.css",appearanceCss(DEFAULT_APPEARANCE));'
```

Refresh SHA256 values in `scripts/renderer-manifest.json` only after final formatting and fallback regeneration; `npm test` verifies every pinned byte plus fallback/generator parity.

Exports: `renderIndex(snapshot,{preview:true})`, `renderArticle(article,snapshot,{preview:true})`, `renderArticleBody(article)`. Full renderers return HTML documents, not React JSX. The protected service must authorize before supplying any selected draft DTO, derive public-shaped fields and pins without private IDs/URLs, and never put that DTO into public Git/output. Preview has no canonical URL or website publication date, and displays PRIVATE PREVIEW / Not published. Historical previews show only the original date, matching the public article date without exposing provenance. That rendering option is not an access-control boundary; the caller owns effective authorization. Media must be frozen local hash-addressed copies or visibly blocked by the service before rendering. Unsupported draft content must surface warnings rather than be silently dropped.

Serve assets at identical absolute paths. A private preview response must retain external theme-init/site scripts, CSS and font bytes; do not embed the document into an unrelated styled page. Index navigation always points at public routes; preview linkage may be separately protected but cannot expose draft endpoints. Tests prove exact article-body equality and identical assets in public/private variants. No public fixture/preview route exists.

## Build and failure behavior

`make build` reads the canonical public snapshot, validates hashes and structure, renders all pages, verifies each frozen asset's SHA256 and image signature, and stages an allowlisted static tree before replacement. It never copies the snapshot JSON, source modules, tests, fixtures, secrets or private content. Missing/malformed snapshots and failed media verification leave last-known-good output unchanged and fail the command, so deployment must not proceed. Missing provider configuration is irrelevant: the committed public snapshot is sufficient. Notion outage cannot alter the deployed output.

Articles become `/blog/<slug>.html`, served by Vercel cleanUrls as `/blog/<slug>`. Sitemap entries derive only from published articles. Rebuild removes unpublished/stale article files. Asset paths are `/content/assets/<SHA256>.(png|jpg|webp|gif)`, at most 10MiB; symlinked/mismatched/executable formats are rejected. Existing assets are code-owned; media ingestion/SSRF protection belong to the service.

## Verification and next release step

Run `npm ci --ignore-scripts`, `npm test`, `make build`, `npm run lint`, `npm run format:check`, `npm run test:browser`, design-spec lint and `git diff --check`. Browser tests use installed Brave; CI may set `HSC_BROWSER_EXECUTABLE` or install Playwright Chromium. Synthetic fixtures exist only in tests and the loopback harness, never the production snapshot/output.

The pre-created reviewer t_23f1b1dc consumes the signed UI candidate and service candidate. Integrator freezes the combined candidate and checks vendored hashes/build/preview parity; release remains the existing chain. This UI task performs no deployment, live Notion/provider writes, draft publication or release-triggering push.
