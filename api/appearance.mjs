import {
  appearanceCss,
  DEFAULT_APPEARANCE,
  validateChoice,
  validateTarget,
} from "../scripts/appearance.mjs";

const RAW_SETTINGS =
  "https://raw.githubusercontent.com/Zacaria/landing-page/master/content/appearance.json";
const MAX_BYTES = 8192;
class InvalidSettings extends Error {}

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
    const settings = JSON.parse(Buffer.concat(chunks).toString("utf8"));
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
  now = Date.now,
  timeoutMs = 2000,
} = {}) {
  return async function appearance(req, res) {
    res.setHeader("Content-Type", "text/css; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "X-Appearance-Status");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const end = (status, state, body) => {
      res.statusCode = status;
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
      const settings = await Promise.race([
        (async () => {
          const response = await fetch(`${RAW_SETTINGS}?t=${now()}`, {
            signal: controller.signal,
            redirect: "error",
            credentials: "omit",
            cache: "no-store",
            headers: { Accept: "application/json" },
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
