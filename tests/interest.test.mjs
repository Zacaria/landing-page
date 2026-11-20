import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import {
  handle,
  purge,
  normalizeEmail,
  CONSENT_TEXT,
} from "../workers/interest/index.mjs";
import { weeklyStats, parisWeek } from "../workers/interest/stats.mjs";

const ORIGIN = "https://www.havesomecode.io";
const T0 = Date.parse("2026-11-20T10:00:00Z");

function makeEnv() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(
    readFileSync(
      new URL(
        "../workers/interest/migrations/0001_subscriptions.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const sent = [];
  const env = {
    sqlite,
    sent,
    PUBLIC_ORIGIN: "https://interest.havesomecode.io",
    SITE_ORIGIN: ORIGIN,
    MAIL_FROM: "zacaria@mail.havesomecode.io",
    HASH_SALT: "salt",
    EMAIL: { send: async (m) => void sent.push(m) },
    DB: {
      prepare: (sql) => ({
        bind: (...args) => ({
          first: async () => sqlite.prepare(sql).get(...args) ?? null,
          run: async () => sqlite.prepare(sql).run(...args),
        }),
      }),
    },
  };
  return env;
}

const post = (fields, { origin = ORIGIN, headers = {} } = {}) =>
  new Request("https://interest.havesomecode.io/subscribe", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      origin,
      "cf-connecting-ip": "203.0.113.7",
      ...headers,
    },
    body: new URLSearchParams(fields),
  });
const rows = (env) => env.sqlite.prepare("SELECT * FROM subscriptions").all();
const linkFrom = (mail, name) =>
  new URL(mail.text.match(new RegExp(`${name}[^\\n]*?: (https://\\S+)`))[1]);

test("a valid request stores a pending row and sends one confirmation", async () => {
  const env = makeEnv();
  const res = await handle(
    post({ email: " Ana@Entreprise.FR ", consent: "on" }),
    env,
    T0,
  );
  assert.equal(res.status, 200);
  assert.equal((await res.json()).ok, true);
  const [row] = rows(env);
  assert.equal(row.email, "ana@entreprise.fr");
  assert.equal(row.status, "pending");
  assert.equal(row.list, "havesomecode-conseil-ia");
  assert.match(row.consent_text, new RegExp(CONSENT_TEXT));
  assert.equal(env.sent.length, 1);
  assert.equal(env.sent[0].to, "ana@entreprise.fr");
  assert.match(env.sent[0].text, /\/confirm\?t=/);
  assert.match(env.sent[0].text, /\/unsubscribe\?t=/);
  assert.doesNotMatch(env.sent[0].text, /€|tarif|prix/i);
});

test("missing consent, bad address, foreign origin are refused and store nothing", async () => {
  const env = makeEnv();
  assert.equal((await handle(post({ email: "a@b.fr" }), env, T0)).status, 400);
  assert.equal(
    (await handle(post({ email: "nope", consent: "on" }), env, T0)).status,
    400,
  );
  assert.equal(
    (
      await handle(
        post(
          { email: "a@b.fr", consent: "on" },
          { origin: "https://evil.example" },
        ),
        env,
        T0,
      )
    ).status,
    403,
  );
  assert.equal(rows(env).length, 0);
  assert.equal(env.sent.length, 0);
});

test("the trap field answers success without storing or sending", async () => {
  const env = makeEnv();
  const res = await handle(
    post({ email: "bot@b.fr", consent: "on", website: "http://spam" }),
    env,
    T0,
  );
  assert.equal(res.status, 200);
  assert.equal(rows(env).length, 0);
  assert.equal(env.sent.length, 0);
});

const get = (url) => new Request(url);
const postTo = (url, headers = {}) =>
  new Request(url, { method: "POST", headers });

test("a GET on the confirm or unsubscribe link only shows a button and changes nothing", async () => {
  const env = makeEnv();
  await handle(post({ email: "ana@entreprise.fr", consent: "on" }), env, T0);
  const confirmUrl = linkFrom(env.sent[0], "Confirmer mon adresse");
  const unsubUrl = linkFrom(env.sent[0], "Se désinscrire");
  const c = await handle(get(confirmUrl), env, T0 + 1000);
  assert.equal(c.status, 200);
  assert.match(await c.text(), /<form method="post"[^>]*>[\s\S]*<button/);
  assert.match(c.headers.get("content-security-policy"), /form-action 'self'/);
  assert.equal(rows(env)[0].status, "pending");
  const u = await handle(get(unsubUrl), env, T0 + 2000);
  assert.match(await u.text(), /<form method="post"/);
  assert.equal(rows(env)[0].status, "pending");
  assert.equal(rows(env).length, 1);
});

test("POST confirms, POST unsubscribes, links are reusable and tokens are unguessable", async () => {
  const env = makeEnv();
  await handle(post({ email: "ana@entreprise.fr", consent: "on" }), env, T0);
  const confirmUrl = linkFrom(env.sent[0], "Confirmer mon adresse");
  const unsubUrl = linkFrom(env.sent[0], "Se désinscrire");
  assert.ok(confirmUrl.searchParams.get("t").length >= 43);
  for (const method of ["GET", "POST"])
    assert.equal(
      (
        await handle(
          new Request("https://interest.havesomecode.io/confirm?t=bad", {
            method,
          }),
          env,
          T0,
        )
      ).status,
      404,
    );
  const ok = await handle(postTo(confirmUrl), env, T0 + 1000);
  assert.equal(ok.status, 200);
  assert.match(await ok.text(), /C’est noté/);
  assert.equal(rows(env)[0].status, "confirmed");
  assert.ok(rows(env)[0].confirmed_at);
  assert.equal((await handle(postTo(confirmUrl), env, T0 + 2000)).status, 200);
  const un = await handle(
    postTo(unsubUrl, { accept: "text/html" }),
    env,
    T0 + 3000,
  );
  assert.match(await un.text(), /désinscrit·e/);
  assert.equal(rows(env)[0].status, "unsubscribed");
  const oneClick = await handle(postTo(unsubUrl), env, T0 + 4000);
  assert.equal(oneClick.status, 200);
  assert.equal(await oneClick.text(), "ok");
});

test("unsubscribing a still pending address deletes the row", async () => {
  const env = makeEnv();
  await handle(post({ email: "ana@entreprise.fr", consent: "on" }), env, T0);
  await handle(postTo(linkFrom(env.sent[0], "Se désinscrire")), env, T0 + 1);
  assert.equal(rows(env).length, 0);
});

test("a JSON null body is a bad request, not a crash", async () => {
  const env = makeEnv();
  const res = await handle(
    new Request("https://interest.havesomecode.io/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json", origin: ORIGIN },
      body: "null",
    }),
    env,
    T0,
  );
  assert.equal(res.status, 400);
  assert.equal(res.headers.get("access-control-allow-origin"), ORIGIN);
});

test("a confirmation link expires after 7 days", async () => {
  const env = makeEnv();
  await handle(post({ email: "ana@entreprise.fr", consent: "on" }), env, T0);
  const confirmUrl = linkFrom(env.sent[0], "Confirmer mon adresse");
  const late = await handle(
    postTo(confirmUrl),
    env,
    T0 + 8 * 24 * 3600 * 1000,
  );
  assert.equal(late.status, 404);
  assert.equal(rows(env)[0].status, "pending");
});

test("same address twice: resend at most hourly, never reveal a confirmed address", async () => {
  const env = makeEnv();
  await handle(post({ email: "ana@entreprise.fr", consent: "on" }), env, T0);
  await handle(
    post({ email: "ana@entreprise.fr", consent: "on" }),
    env,
    T0 + 60_000,
  );
  assert.equal(env.sent.length, 1);
  await handle(
    post({ email: "ana@entreprise.fr", consent: "on" }),
    env,
    T0 + 2 * 3600_000,
  );
  assert.equal(env.sent.length, 2);
  assert.equal(rows(env).length, 1);
  await handle(
    postTo(linkFrom(env.sent[1], "Confirmer mon adresse")),
    env,
    T0 + 2 * 3600_000 + 1,
  );
  const again = await handle(
    post({ email: "ana@entreprise.fr", consent: "on" }),
    env,
    T0 + 3 * 3600_000,
  );
  assert.equal(again.status, 200);
  assert.equal(env.sent.length, 2);
});

test("after unsubscribing, a new explicit request starts a fresh confirmation", async () => {
  const env = makeEnv();
  await handle(post({ email: "ana@entreprise.fr", consent: "on" }), env, T0);
  await handle(
    postTo(linkFrom(env.sent[0], "Confirmer mon adresse")),
    env,
    T0 + 1,
  );
  await handle(
    postTo(linkFrom(env.sent[0], "Se désinscrire")),
    env,
    T0 + 2,
  );
  await handle(
    post({ email: "ana@entreprise.fr", consent: "on" }),
    env,
    T0 + 3,
  );
  assert.equal(rows(env)[0].status, "pending");
  assert.equal(rows(env)[0].confirmed_at, null);
  assert.equal(env.sent.length, 2);
  assert.notEqual(
    linkFrom(env.sent[1], "Confirmer mon adresse").href,
    linkFrom(env.sent[0], "Confirmer mon adresse").href,
  );
});

test("more than five requests an hour from one address are refused", async () => {
  const env = makeEnv();
  for (let i = 0; i < 5; i++)
    assert.equal(
      (await handle(post({ email: `a${i}@b.fr`, consent: "on" }), env, T0))
        .status,
      200,
    );
  assert.equal(
    (await handle(post({ email: "a9@b.fr", consent: "on" }), env, T0)).status,
    429,
  );
  assert.equal(
    (
      await handle(
        post({ email: "a9@b.fr", consent: "on" }),
        env,
        T0 + 3600_000,
      )
    ).status,
    200,
  );
});

test("a failed send leaves no row behind", async () => {
  const env = makeEnv();
  env.EMAIL.send = async () => {
    throw new Error("down");
  };
  const res = await handle(
    post({ email: "ana@entreprise.fr", consent: "on" }),
    env,
    T0,
  );
  assert.equal(res.status, 500);
  assert.equal(rows(env).length, 0);
});

test("form navigation without JavaScript gets a readable page", async () => {
  const env = makeEnv();
  const res = await handle(
    post(
      { email: "ana@entreprise.fr", consent: "on" },
      { headers: { accept: "text/html" } },
    ),
    env,
    T0,
  );
  assert.match(res.headers.get("content-type"), /text\/html/);
  assert.match(await res.text(), /Presque fini/);
});

test("the daily purge removes stale pending rows and keeps the rest", async () => {
  const env = makeEnv();
  await handle(post({ email: "old@b.fr", consent: "on" }), env, T0);
  await handle(
    post({ email: "keep@b.fr", consent: "on" }),
    env,
    T0 + 6 * 24 * 3600_000,
  );
  await purge(env, T0 + 8 * 24 * 3600_000);
  assert.deepEqual(
    rows(env).map((r) => r.email),
    ["keep@b.fr"],
  );
});

test("weekly numbers use Europe/Paris Monday to Sunday and ignore addresses", () => {
  assert.equal(parisWeek("2026-11-22T22:30:00Z"), "2026-11-16"); // Sunday 23:30 Paris
  assert.equal(parisWeek("2026-11-22T23:30:00Z"), "2026-11-23"); // Monday 00:30 Paris
  const stats = weeklyStats([
    {
      status: "confirmed",
      created_at: "2026-11-20T10:00:00Z",
      confirmed_at: "2026-11-24T08:00:00Z",
      unsubscribed_at: null,
    },
    {
      status: "pending",
      created_at: "2026-11-21T10:00:00Z",
      confirmed_at: null,
      unsubscribed_at: null,
    },
  ]);
  assert.equal(stats.activeConfirmed, 1);
  assert.deepEqual(stats.weeks, [
    { week: "2026-11-23", requested: 0, confirmed: 1, unsubscribed: 0 },
    { week: "2026-11-16", requested: 2, confirmed: 0, unsubscribed: 0 },
  ]);
});

test("normalizeEmail", () => {
  assert.equal(normalizeEmail("A@B.fr"), "a@b.fr");
  for (const bad of ["", "a@b", "a b@c.fr", "a@b.c", 5, "a@b.fr\n<x>"])
    assert.equal(normalizeEmail(bad), null);
});
