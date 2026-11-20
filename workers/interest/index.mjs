// Interest list for www.havesomecode.io: double opt-in, one-click unsubscribe.
// Cloudflare Worker + D1. See ../../docs/interest-list.md.

export const LIST = "havesomecode-conseil-ia";
export const CONSENT_VERSION = "v1-2026-11-20";
export const CONSENT_TEXT =
  "Je souhaite recevoir par courriel l’actualité de HaveSomeCode sur le conseil IA pour les PME.";

const WEEK_MS = 7 * 24 * 3600 * 1000;
const HOUR_MS = 3600 * 1000;
const MAX_PER_HOUR = 5;
const ALLOWED_ORIGINS = [
  "https://www.havesomecode.io",
  "https://havesomecode.io",
];

const MESSAGES = {
  invalid_email: "Cette adresse ne semble pas complète.",
  consent_required: "Cochez la case pour que je puisse vous écrire.",
  server_error:
    "Votre demande n’a pas pu être enregistrée. Réessayez dans un moment, ou écrivez-moi à z@havesomecode.io.",
  rate_limited: "Trop de demandes. Réessayez dans une heure.",
  forbidden: "Demande refusée.",
};
const SUCCESS =
  "Presque fini. Je viens de vous écrire pour confirmer votre adresse. Cliquez sur le lien du courriel : tant que vous ne l’avez pas fait, vous ne recevrez rien. Rien dans votre boîte ? Regardez dans les courriers indésirables.";

const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export function normalizeEmail(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || /[\s\x00-\x1f\x7f<>(),;:\\"]/.test(email))
    return null;
  return /^[^@]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(email)
    ? email
    : null;
}

function token() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256(text) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const iso = (ms) => new Date(ms).toISOString();

function page(title, body, status = 200) {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)} | HaveSomeCode</title><style>
@font-face{font-family:Geist;src:url(https://www.havesomecode.io/assets/fonts/geist-regular.woff2) format("woff2");font-display:swap}
@font-face{font-family:"Instrument Serif";src:url(https://www.havesomecode.io/assets/fonts/instrument-serif-regular.woff2) format("woff2");font-display:swap}
:root{color-scheme:light dark;--bg:#f5f3ed;--fg:#23231f;--muted:#68675f;--accent:#526500;--border:#d5d2c9}
@media (prefers-color-scheme:dark){:root{--bg:#0b0b0c;--fg:#ece8e1;--muted:#a29e97;--accent:#d4ff4f;--border:#303032}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.6 Geist,system-ui,sans-serif}
header{border-bottom:1px solid var(--border);padding:1.2rem 0}header a{font-weight:700;letter-spacing:.08em;color:var(--fg);text-decoration:none}
.shell{width:min(100% - 2.5rem,40rem);margin-inline:auto}main{padding:3.5rem 0 5rem}
h1{font:400 clamp(2.4rem,8vw,3.6rem)/1.08 "Instrument Serif",Georgia,serif;margin:0 0 1rem}p{max-width:60ch;color:var(--muted)}
a{color:var(--accent);text-underline-offset:.2em}a:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
</style></head><body><header><div class="shell"><a href="https://www.havesomecode.io/">HAVESOMECODE</a></div></header><main class="shell">${body}</main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'; font-src https://www.havesomecode.io; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    },
  });
}

const backHome =
  '<p><a href="https://www.havesomecode.io/">Retour à havesomecode.io</a></p>';
const confirmedPage = () =>
  page(
    "C’est noté",
    `<h1>C’est noté.</h1><p>Je vous écrirai quand j’aurai quelque chose d’utile à partager. Vous pouvez vous désinscrire à tout moment depuis n’importe lequel de mes courriels. Si vous avez déjà un processus précis en tête, vous pouvez aussi m’écrire : <a href="mailto:z@havesomecode.io">z@havesomecode.io</a>.</p>${backHome}`,
  );
const unsubscribedPage = () =>
  page(
    "Désinscription",
    `<h1>Vous êtes désinscrit·e.</h1><p>Je ne vous écrirai plus. Si c’était une erreur, vous pouvez vous réinscrire depuis <a href="https://www.havesomecode.io/">havesomecode.io</a>.</p>`,
  );
const invalidLinkPage = () =>
  page(
    "Lien expiré",
    `<h1>Ce lien n’est plus valable.</h1><p>Il a expiré ou a déjà été remplacé. Vous pouvez refaire la demande depuis <a href="https://www.havesomecode.io/">havesomecode.io</a>.</p>`,
    404,
  );
const resultPage = (ok, message) =>
  page(
    ok ? "Presque fini" : "Demande non enregistrée",
    `<h1>${ok ? "Presque fini." : "Demande non enregistrée."}</h1><p>${escapeHtml(message)}</p>${backHome}`,
    ok ? 200 : 400,
  );

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  return ALLOWED_ORIGINS.includes(origin)
    ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
    : { Vary: "Origin" };
}

function json(request, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...corsHeaders(request),
    },
  });
}

async function readFields(request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 4096) throw new Error("too_large");
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const text = await request.text();
    if (text.length > 4096) throw new Error("too_large");
    return JSON.parse(text);
  }
  const form = await request.formData();
  return Object.fromEntries(
    [...form.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]),
  );
}

function confirmationMail(env, row) {
  const confirmUrl = `${env.PUBLIC_ORIGIN}/confirm?t=${row.confirm_token}`;
  const unsubUrl = `${env.PUBLIC_ORIGIN}/unsubscribe?t=${row.unsub_token}`;
  const privacy = `${env.SITE_ORIGIN}/confidentialite`;
  const text = `Bonjour,

Vous avez demandé à recevoir l’actualité de HaveSomeCode sur le conseil IA pour les PME. Pour confirmer que cette adresse est bien la vôtre :

Confirmer mon adresse : ${confirmUrl}

Ce lien est valable 7 jours. Si vous n’êtes pas à l’origine de cette demande, ignorez ce message : rien ne sera enregistré et vous ne recevrez rien.

Zacaria Chtatar
HaveSomeCode
Se désinscrire : ${unsubUrl} · Confidentialité : ${privacy}
`;
  const html = `<p>Bonjour,</p><p>Vous avez demandé à recevoir l’actualité de HaveSomeCode sur le conseil IA pour les PME. Pour confirmer que cette adresse est bien la vôtre :</p><p><a href="${confirmUrl}">Confirmer mon adresse</a></p><p>Ce lien est valable 7 jours. Si vous n’êtes pas à l’origine de cette demande, ignorez ce message : rien ne sera enregistré et vous ne recevrez rien.</p><p>Zacaria Chtatar<br>HaveSomeCode<br><a href="${unsubUrl}">Se désinscrire</a> · <a href="${privacy}">Confidentialité</a></p>`;
  return {
    from: { email: env.MAIL_FROM, name: "Zacaria — HaveSomeCode" },
    replyTo: "z@havesomecode.io",
    to: row.email,
    subject: "Confirmez votre adresse — conseil IA, HaveSomeCode",
    text,
    html,
  };
}

async function allowRequest(env, request, now) {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const hour = Math.floor(now / HOUR_MS);
  const key = await sha256(`${env.HASH_SALT ?? ""}|${ip}|${hour}`);
  const row = await env.DB.prepare(
    "INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count",
  )
    .bind(key, now)
    .first();
  return row.count <= MAX_PER_HOUR;
}

async function subscribe(request, env, now) {
  const wantsHtml = (request.headers.get("Accept") ?? "").includes("text/html");
  const fail = (status, code) =>
    wantsHtml
      ? resultPage(false, MESSAGES[code])
      : json(request, status, {
          ok: false,
          error: code,
          message: MESSAGES[code],
        });
  const succeed = () =>
    wantsHtml
      ? resultPage(true, SUCCESS)
      : json(request, 200, { ok: true, message: SUCCESS });

  if (!ALLOWED_ORIGINS.includes(request.headers.get("Origin")))
    return fail(403, "forbidden");
  let fields;
  try {
    fields = await readFields(request);
  } catch {
    return fail(400, "invalid_email");
  }
  if (typeof fields.website === "string" && fields.website !== "")
    return succeed(); // honeypot
  if (!(await allowRequest(env, request, now)))
    return fail(429, "rate_limited");
  const email = normalizeEmail(fields.email);
  if (!email) return fail(400, "invalid_email");
  if (!["on", "true", "1", true].includes(fields.consent))
    return fail(400, "consent_required");
  const source = ["landing", "blog"].includes(fields.source)
    ? fields.source
    : "landing";

  try {
    const stamp = iso(now);
    let row = await env.DB.prepare(
      "SELECT * FROM subscriptions WHERE list = ? AND email = ?",
    )
      .bind(LIST, email)
      .first();
    let created = false;
    if (!row) {
      row = {
        id: crypto.randomUUID(),
        list: LIST,
        email,
        status: "pending",
        created_at: stamp,
        consent_text: `${CONSENT_VERSION}: ${CONSENT_TEXT}`,
        confirmed_at: null,
        unsubscribed_at: null,
        source,
        confirm_token: token(),
        unsub_token: token(),
        last_sent_at: stamp,
      };
      await env.DB.prepare(
        "INSERT INTO subscriptions (id, list, email, status, created_at, consent_text, source, confirm_token, unsub_token, last_sent_at) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)",
      )
        .bind(
          row.id,
          LIST,
          email,
          stamp,
          row.consent_text,
          source,
          row.confirm_token,
          row.unsub_token,
          stamp,
        )
        .run();
      created = true;
    } else if (row.status === "confirmed") {
      return succeed();
    } else if (row.status === "pending") {
      if (row.last_sent_at && now - Date.parse(row.last_sent_at) < HOUR_MS)
        return succeed();
      row.confirm_token = token();
      row.last_sent_at = stamp;
      await env.DB.prepare(
        "UPDATE subscriptions SET confirm_token = ?, last_sent_at = ?, consent_text = ? WHERE id = ?",
      )
        .bind(
          row.confirm_token,
          stamp,
          `${CONSENT_VERSION}: ${CONSENT_TEXT}`,
          row.id,
        )
        .run();
    } else {
      // unsubscribed: a new explicit request starts over
      row.confirm_token = token();
      row.last_sent_at = stamp;
      await env.DB.prepare(
        "UPDATE subscriptions SET status = 'pending', created_at = ?, consent_text = ?, source = ?, confirmed_at = NULL, unsubscribed_at = NULL, confirm_token = ?, last_sent_at = ? WHERE id = ?",
      )
        .bind(
          stamp,
          `${CONSENT_VERSION}: ${CONSENT_TEXT}`,
          source,
          row.confirm_token,
          stamp,
          row.id,
        )
        .run();
    }
    try {
      await env.EMAIL.send(confirmationMail(env, row));
    } catch (error) {
      if (created)
        await env.DB.prepare("DELETE FROM subscriptions WHERE id = ?")
          .bind(row.id)
          .run();
      throw error;
    }
    return succeed();
  } catch (error) {
    console.error("subscribe failed", error?.message);
    return fail(500, "server_error");
  }
}

async function confirm(url, env, now) {
  const t = url.searchParams.get("t") ?? "";
  const row = t
    ? await env.DB.prepare(
        "SELECT * FROM subscriptions WHERE confirm_token = ?",
      )
        .bind(t)
        .first()
    : null;
  if (!row) return invalidLinkPage();
  if (row.status === "confirmed") return confirmedPage();
  if (
    row.status !== "pending" ||
    now - Date.parse(row.last_sent_at ?? row.created_at) > WEEK_MS
  )
    return invalidLinkPage();
  await env.DB.prepare(
    "UPDATE subscriptions SET status = 'confirmed', confirmed_at = ? WHERE id = ?",
  )
    .bind(iso(now), row.id)
    .run();
  return confirmedPage();
}

async function unsubscribe(request, url, env, now) {
  const t = url.searchParams.get("t") ?? "";
  const row = t
    ? await env.DB.prepare("SELECT * FROM subscriptions WHERE unsub_token = ?")
        .bind(t)
        .first()
    : null;
  if (!row) return invalidLinkPage();
  if (row.status !== "unsubscribed")
    await env.DB.prepare(
      "UPDATE subscriptions SET status = 'unsubscribed', unsubscribed_at = ? WHERE id = ?",
    )
      .bind(iso(now), row.id)
      .run();
  return request.method === "POST"
    ? new Response("ok", { status: 200 })
    : unsubscribedPage();
}

export async function purge(env, now = Date.now()) {
  await env.DB.prepare(
    "DELETE FROM subscriptions WHERE status = 'pending' AND COALESCE(last_sent_at, created_at) < ?",
  )
    .bind(iso(now - WEEK_MS))
    .run();
  await env.DB.prepare("DELETE FROM rate_limits WHERE window_start < ?")
    .bind(now - 2 * HOUR_MS)
    .run();
}

export async function handle(request, env, now = Date.now()) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS" && url.pathname === "/subscribe")
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders(request),
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  if (url.pathname === "/subscribe" && request.method === "POST")
    return subscribe(request, env, now);
  if (url.pathname === "/confirm" && request.method === "GET")
    return confirm(url, env, now);
  if (
    url.pathname === "/unsubscribe" &&
    ["GET", "POST"].includes(request.method)
  )
    return unsubscribe(request, url, env, now);
  return new Response("Not found", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
}

export default {
  fetch: (request, env) => handle(request, env),
  scheduled: (_event, env, ctx) => ctx.waitUntil(purge(env)),
};
