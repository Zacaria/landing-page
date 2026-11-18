import { createHash } from "node:crypto";
import {
  appearanceCss,
  DEFAULT_APPEARANCE,
  validateChoice,
  validateTarget,
} from "../scripts/appearance.mjs";

const SELECT =
  "SELECT version, document FROM public.appearance_settings WHERE id = 'appearance'";
const MAX_BYTES = 16384;
class InvalidSettings extends Error {}

function neonEndpoint(connection) {
  if (
    typeof connection !== "string" ||
    connection.length > 4096 ||
    /[\s\x00-\x1f\x7f]/.test(connection)
  )
    throw new Error("Database unavailable");
  const url = new URL(connection);
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !/^ep-[a-z0-9-]+\.(?:[a-z0-9-]+\.)*neon\.tech$/.test(url.hostname) ||
    !url.username ||
    !url.password ||
    !/^\/[A-Za-z0-9_-]+$/.test(url.pathname) ||
    (url.port && url.port !== "5432") ||
    url.hash ||
    url.searchParams.getAll("sslmode").length !== 1 ||
    !["require", "verify-full"].includes(url.searchParams.get("sslmode")) ||
    [...url.searchParams.keys()].some(
      (key) =>
        !["sslmode", "channel_binding"].includes(key) ||
        url.searchParams.getAll(key).length !== 1,
    )
  )
    throw new Error("Database unavailable");
  // Match the official Neon driver's regional HTTP SQL endpoint mapping.
  return `https://${url.hostname.replace(/^[^.]+\./, "api.")}/sql`;
}

async function readSettings(response) {
  if (Number(response.headers.get("content-length")) > MAX_BYTES)
    throw new InvalidSettings();
  const reader = response.body?.getReader();
  if (!reader) throw new InvalidSettings();
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) throw new InvalidSettings();
      chunks.push(Buffer.from(value));
    }
  } finally {
    // Do not await cancellation: a broken upstream must not extend the deadline.
    void reader.cancel().catch(() => {});
  }
  try {
    const envelope = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)),
    );
    if (!envelope || !Array.isArray(envelope.rows) || envelope.rows.length > 1)
      throw new InvalidSettings();
    if (envelope.rows.length === 0) return null;
    const row = envelope.rows[0];
    if (
      !Array.isArray(row) ||
      row.length !== 2 ||
      typeof row[0] !== "string" ||
      !/^[a-f0-9]{64}$/.test(row[0]) ||
      typeof row[1] !== "string" ||
      Buffer.byteLength(row[1]) > 8192 ||
      createHash("sha256").update(row[1]).digest("hex") !== row[0]
    )
      throw new InvalidSettings();
    const settings = JSON.parse(row[1]);
    if (
      !settings ||
      Array.isArray(settings) ||
      Object.keys(settings).sort().join(",") !== "cv,site"
    )
      throw new InvalidSettings();
    return {
      site: validateChoice(settings.site),
      cv: validateChoice(settings.cv),
    };
  } catch {
    throw new InvalidSettings();
  }
}

export function createAppearanceHandler({
  fetch = globalThis.fetch,
  env = process.env,
  timeoutMs = 2000,
} = {}) {
  return async function appearance(req, res) {
    res.setHeader("Content-Type", "text/css; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "X-Appearance-Status");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const end = (status, state, body) => {
      res.statusCode = status;
      res.setHeader(
        "Cache-Control",
        state === "selected" ? "public, max-age=60, s-maxage=60" : "no-store",
      );
      res.setHeader("X-Appearance-Status", state);
      res.end(req.method === "HEAD" ? "" : body);
    };
    if (!["GET", "HEAD"].includes(req.method)) {
      res.setHeader("Allow", "GET, HEAD");
      return end(405, "invalid-method", "/* Method not allowed */\n");
    }
    let target;
    try {
      const query = new URL(req.url, "https://www.havesomecode.io")
        .searchParams;
      if (query.getAll("target").length > 1) throw new TypeError();
      target = validateTarget(query.get("target") ?? "site");
    } catch {
      return end(400, "invalid-target", "/* Invalid appearance target */\n");
    }
    const controller = new AbortController();
    let timer;
    try {
      const connection = env.HSC_APPEARANCE_DATABASE_URL;
      const endpoint = neonEndpoint(connection);
      const settings = await Promise.race([
        (async () => {
          const response = await fetch(endpoint, {
            method: "POST",
            signal: controller.signal,
            redirect: "error",
            credentials: "omit",
            cache: "no-store",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "Neon-Connection-String": connection,
              "Neon-Raw-Text-Output": "true",
              "Neon-Array-Mode": "true",
            },
            body: JSON.stringify({ query: SELECT, params: [] }),
          });
          if (!response.ok) {
            void response.body?.cancel().catch(() => {});
            throw new Error("Settings unavailable");
          }
          return readSettings(response);
        })(),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            controller.abort();
            reject(new Error("Settings timeout"));
          }, timeoutMs);
        }),
      ]);
      if (!settings)
        return end(200, "fallback", appearanceCss(DEFAULT_APPEARANCE, target));
      return end(200, "selected", appearanceCss(settings[target], target));
    } catch (error) {
      if (error instanceof InvalidSettings)
        return end(
          502,
          "invalid-settings",
          "/* Invalid appearance settings */\n",
        );
      return end(200, "fallback", appearanceCss(DEFAULT_APPEARANCE, target));
    } finally {
      clearTimeout(timer);
      controller.abort();
    }
  };
}

export default createAppearanceHandler();
