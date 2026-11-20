# Interest list (conseil IA)

Form on www.havesomecode.io (`#suivre`, rendered by `scripts/render.mjs`, enhanced by `client/assets/interest.js`) posting to a separate Cloudflare Worker, `hsc-interest`, at https://interest.havesomecode.io. Source: `workers/interest/`. Not part of the Vercel build (`.vercelignore`).

Texts and schema come from the owner's `listes-interet/` drafts. Double opt-in, no price, one purpose (news about HaveSomeCode's AI consulting for SMEs).

## Flow

1. `POST /subscribe` (form or fetch, Origin must be the site): email + ticked consent box. Stores a `pending` row (`consent_text` = version + exact label), emails a confirmation link. Same address again: resend at most hourly; a confirmed address gets the same answer (not revealed). An unsubscribed address starts over only with a new ticked box.
2. `GET /confirm?t=` shows one button; `POST /confirm?t=` → `confirmed`. A GET never changes a row, because mail scanners open every link in a message. Links last 7 days.
3. `GET /unsubscribe?t=` shows one button; `POST /unsubscribe?t=` → `unsubscribed` (one click, no login; the same POST serves mail clients). A confirmed address stays as `unsubscribed` so it is not re-added without a new request; an address still `pending` is deleted.
4. Daily cron deletes `pending` rows older than 7 days and old rate-limit rows.

Anti-abuse: hidden `website` trap field, 5 requests per hour per hashed IP (salted, never stored in clear). Nothing is ever sent to the list from here: a newsletter send needs its own approval.

## Numbers

`npm run interest:stats` (reads production D1, timestamps only): confirmed active total, and requested / confirmed / unsubscribed per Monday-to-Sunday week, Europe/Paris. Addresses ending `@havesomecode.io` or `@example.com` are excluded. Confirmed per week is the interest figure. Add `-- --local` for a local D1.

## Deploy

```
cd workers/interest
npx wrangler@4.158.0 d1 migrations apply hsc-interest --remote
npx wrangler@4.158.0 secret put HASH_SALT   # once, random
npx wrangler@4.158.0 deploy
```

Needs a Cloudflare token with Workers Scripts, D1, Workers Routes, DNS and Email Sending on the account. Sender: `zacaria@mail.havesomecode.io` (same Email Sending domain as Calmly), reply-to z@havesomecode.io.

## Tests

`node --test tests/interest.test.mjs` runs the Worker against an in-memory SQLite (uses `node:sqlite`, Node 22.13+).
